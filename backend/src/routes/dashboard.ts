import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import compassService from '../services/compass';

const router = Router();
const prisma = new PrismaClient();

// Get dashboard data for current user
router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId as string;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get user's tasks
    const tasks = await prisma.task.findMany({
      where: {
        userId,
        completed: false,
        dueDate: {
          gte: today,
          lt: tomorrow
        }
      },
      orderBy: {
        dueDate: 'asc'
      },
      take: 10
    });

    // Get announcements
    const announcements = await prisma.announcement.findMany({
      where: {
        OR: [
          { expiresAt: null },
          { expiresAt: { gte: today } }
        ]
      },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 5,
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // Get helpdesk tickets
    const helpdeskTickets = await prisma.helpdeskTicket.findMany({
      where: {
        userId,
        status: {
          in: ['OPEN', 'IN_PROGRESS']
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    // Get Compass data
    let compassData = {
      classes: [],
      roomChanges: [],
      yardDuty: [],
      meetings: [],
      replacements: [],
      studentAbsences: []
    };

    try {
      // Get today's events from Compass
      const startDate = today.toISOString().split('T')[0];
      const endDate = tomorrow.toISOString().split('T')[0];
      
      // TODO: Get actual userId from authenticated user
      const compassUserId = parseInt(userId) || 0; // This should come from user's CASES/Compass mapping
      
      if (compassUserId > 0) {
        const compassEvents = await compassService.getEventsByUser(
          compassUserId,
          startDate,
          endDate
        );
        
        compassData = compassService.transformEventsToDashboard(compassEvents);
      }
    } catch (error: any) {
      console.error('Error fetching Compass data:', error.message);
      // Continue without Compass data if it fails
    }

    res.json({
      tasks,
      announcements,
      helpdeskTickets,
      compassData
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

