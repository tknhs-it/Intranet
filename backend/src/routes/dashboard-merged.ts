import { Router } from 'express';
import { authenticateAzure, AuthenticatedRequest } from '../middleware/auth-azure';
import { dataMergeService } from '../services/data-merge';
import { PrismaClient } from '@prisma/client';
import compassService from '../services/compass';
import { logger } from '../cases-etl/util/logger';

const router = Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authenticateAzure);

/**
 * GET /api/dashboard/merged
 * Get merged dashboard data for today
 */
router.get('/merged', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Find staff by Azure AD object ID or email
    // First try to find by Azure AD object ID (if we have it stored)
    // Then fall back to email matching
    const userEmail = req.user?.email || req.user?.preferred_username || '';
    const azureObjectId = req.user?.oid || req.userId;

    let staff = null;

    // Try to find by email first (most reliable)
    // Note: SQL Server doesn't support mode: 'insensitive', so we do case-insensitive matching manually
    if (userEmail) {
      // Try exact match first
      staff = await prisma.user.findFirst({
        where: {
          email: userEmail,
        },
      });
      
      // If not found, try case-insensitive match using raw query (SQL Server compatible)
      if (!staff) {
        const result = await prisma.$queryRaw<Array<{ id: string }>>`
          SELECT id FROM "User" 
          WHERE LOWER(email) = LOWER(${userEmail})
        `;
        if (result.length > 0) {
          staff = await prisma.user.findUnique({
            where: { id: result[0].id },
          });
        }
      }
    }

    // If not found and we have Azure object ID, try that
    // (This requires adding azureObjectId field to User table)
    if (!staff && azureObjectId) {
      // TODO: Add azureObjectId field to User schema
      // staff = await prisma.user.findFirst({
      //   where: { azureObjectId },
      // });
    }

    if (!staff) {
      logger.warn(
        { 
          email: userEmail, 
          azureObjectId,
          user: req.user 
        }, 
        'Staff member not found in database'
      );
      return res.status(404).json({ 
        error: 'Staff member not found',
        message: 'Your account was not found in the system. Please contact IT support.',
        email: userEmail,
      });
    }

    // Get merged dashboard data
    const dashboard = await dataMergeService.getTodayDashboard(staff.id);

    // Get staff absences (mock for now, will integrate with Compass)
    const staffAway = await getStaffAbsencesToday().catch(() => []);

    // Get announcements
    const announcements = await prisma.announcement.findMany({
      where: {
        OR: [
          { expiresAt: null },
          { expiresAt: { gte: new Date() } },
        ],
      },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 5,
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Get tasks
    const tasks = await prisma.task.findMany({
      where: {
        userId: staff.id,
        completed: false,
        dueDate: {
          gte: new Date(),
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
      take: 10,
    });

    res.json({
      ...dashboard,
      staffAway,
      announcements,
      tasks,
    });
  } catch (error: any) {
    logger.error({ 
      error: error.message,
      stack: error.stack,
      userId: req.userId,
      email: req.user?.email || req.user?.preferred_username,
    }, 'Dashboard error');
    
    // Return more detailed error in development
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? error.message
      : 'An error occurred while fetching dashboard data';
    
    res.status(500).json({ 
      error: errorMessage,
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack,
      }),
    });
  }
});

/**
 * Get staff absences for today
 * TODO: Integrate with Compass Chronicle API
 */
async function getStaffAbsencesToday(): Promise<Array<{ name: string; reason: string }>> {
  try {
    // This should call Compass Chronicle API to get absences
    // For now, return empty array
    // Structure should be:
    // const absences = await compassService.getStaffAbsences(today);
    // return absences.map(a => ({
    //   name: `${a.firstName} ${a.lastName}`,
    //   reason: a.reason || a.type,
    // }));
    return [];
  } catch (error) {
    return [];
  }
}

/**
 * GET /api/dashboard/staff-away
 * Get staff absences for today
 */
router.get('/staff-away', async (req, res) => {
  try {
    const absences = await getStaffAbsencesToday();
    res.json(absences);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

