import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all announcements
router.get('/', async (req, res) => {
  try {
    const { tag, priority, limit = 20 } = req.query;
    const today = new Date();

    const where: any = {
      OR: [
        { expiresAt: null },
        { expiresAt: { gte: today } }
      ]
    };

    if (tag) {
      where.tags = { has: tag as string };
    }

    if (priority) {
      where.priority = priority;
    }

    const announcements = await prisma.announcement.findMany({
      where,
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        comments: {
          take: 5,
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' }
      ],
      take: parseInt(limit as string)
    });

    res.json(announcements);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single announcement
router.get('/:id', async (req, res) => {
  try {
    const announcement = await prisma.announcement.findUnique({
      where: { id: req.params.id },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        comments: {
          orderBy: {
            createdAt: 'asc'
          },
          include: {
            author: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    res.json(announcement);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create announcement
router.post('/', async (req, res) => {
  try {
    const { title, content, authorId, tags, priority, isPinned, expiresAt } = req.body;

    if (!title || !content || !authorId) {
      return res.status(400).json({ error: 'title, content, and authorId required' });
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        authorId,
        tags: tags || [],
        priority: priority || 'NORMAL',
        isPinned: isPinned || false,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // TODO: Send Teams notification

    res.status(201).json(announcement);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Add comment
router.post('/:id/comments', async (req, res) => {
  try {
    const { authorId, content } = req.body;

    if (!authorId || !content) {
      return res.status(400).json({ error: 'authorId and content required' });
    }

    const comment = await prisma.announcementComment.create({
      data: {
        announcementId: req.params.id,
        authorId,
        content
      }
    });

    res.status(201).json(comment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

