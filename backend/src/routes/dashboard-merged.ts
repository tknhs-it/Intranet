import { Router } from 'express';
import { authenticateAzure, AuthenticatedRequest } from '../middleware/auth-azure';
import { dataMergeService } from '../services/data-merge';
import { PrismaClient } from '@prisma/client';
import compassService from '../services/compass';

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
    const staff = await prisma.user.findFirst({
      where: {
        OR: [
          { email: req.user?.email || '' },
          // TODO: Add Azure AD object ID mapping
        ],
      },
    });

    if (!staff) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    // Get merged dashboard data
    const dashboard = await dataMergeService.getTodayDashboard(staff.id);

    // Get staff absences (mock for now, will integrate with Compass)
    const staffAway = await this.getStaffAbsencesToday().catch(() => []);

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
    res.status(500).json({ error: error.message });
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

