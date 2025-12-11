import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all resources
router.get('/', async (req, res) => {
  try {
    const { type, category, tag, search, limit = 50 } = req.query;

    const where: any = {
      isPublic: true
    };

    if (type) where.type = type;
    if (category) where.category = category;
    if (tag) where.tags = { has: tag as string };
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const resources = await prisma.resource.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      take: parseInt(limit as string)
    });

    res.json(resources);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single resource
router.get('/:id', async (req, res) => {
  try {
    const resource = await prisma.resource.findUnique({
      where: { id: req.params.id }
    });

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    // Increment download count
    await prisma.resource.update({
      where: { id: req.params.id },
      data: {
        downloadCount: {
          increment: 1
        }
      }
    });

    res.json(resource);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create resource
router.post('/', async (req, res) => {
  try {
    const { title, description, type, category, tags, fileUrl, externalUrl, authorId } = req.body;

    if (!title || !type || !authorId) {
      return res.status(400).json({ error: 'title, type, and authorId required' });
    }

    const resource = await prisma.resource.create({
      data: {
        title,
        description,
        type,
        category,
        tags: tags || [],
        fileUrl,
        externalUrl,
        authorId
      }
    });

    res.status(201).json(resource);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

