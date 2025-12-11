import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all tickets
router.get('/', async (req, res) => {
  try {
    const { userId, type, status, limit = 50 } = req.query;

    const where: any = {};
    if (userId) where.userId = userId as string;
    if (type) where.type = type;
    if (status) where.status = status;

    const tickets = await prisma.helpdeskTicket.findMany({
      where,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        updates: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 5
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: parseInt(limit as string)
    });

    res.json(tickets);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single ticket
router.get('/:id', async (req, res) => {
  try {
    const ticket = await prisma.helpdeskTicket.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        updates: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json(ticket);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create ticket
router.post('/', async (req, res) => {
  try {
    const { userId, type, category, title, description, location, photos, priority } = req.body;

    if (!userId || !type || !category || !title || !description) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const ticket = await prisma.helpdeskTicket.create({
      data: {
        userId,
        type,
        category,
        title,
        description,
        location,
        photos: photos || [],
        priority: priority || 'NORMAL',
        status: 'OPEN'
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // TODO: Send notification to ICT/Maintenance team
    // TODO: Create Teams channel or notification

    res.status(201).json(ticket);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update ticket
router.patch('/:id', async (req, res) => {
  try {
    const { status, assignedTo, priority } = req.body;

    const updateData: any = {};
    if (status) {
      updateData.status = status;
      if (status === 'RESOLVED' || status === 'CLOSED') {
        updateData.resolvedAt = new Date();
      }
    }
    if (assignedTo) updateData.assignedTo = assignedTo;
    if (priority) updateData.priority = priority;

    const ticket = await prisma.helpdeskTicket.update({
      where: { id: req.params.id },
      data: updateData
    });

    res.json(ticket);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Add ticket update/comment
router.post('/:id/updates', async (req, res) => {
  try {
    const { userId, content, status } = req.body;

    if (!userId || !content) {
      return res.status(400).json({ error: 'userId and content required' });
    }

    const update = await prisma.ticketUpdate.create({
      data: {
        ticketId: req.params.id,
        userId,
        content,
        status
      }
    });

    // Update ticket status if provided
    if (status) {
      await prisma.helpdeskTicket.update({
        where: { id: req.params.id },
        data: { status }
      });
    }

    res.status(201).json(update);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

