import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all forms
router.get('/', async (req, res) => {
  try {
    const { category, isActive } = req.query;

    const where: any = {};
    if (category) where.category = category;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const forms = await prisma.form.findMany({
      where,
      orderBy: {
        name: 'asc'
      }
    });

    res.json(forms);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single form
router.get('/:id', async (req, res) => {
  try {
    const form = await prisma.form.findUnique({
      where: { id: req.params.id }
    });

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    res.json(form);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Submit form
router.post('/:id/submit', async (req, res) => {
  try {
    const { userId, data } = req.body;

    if (!userId || !data) {
      return res.status(400).json({ error: 'userId and data required' });
    }

    const submission = await prisma.formSubmission.create({
      data: {
        formId: req.params.id,
        userId,
        data,
        status: 'PENDING'
      }
    });

    // TODO: Trigger approval workflow if configured

    res.status(201).json(submission);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's form submissions
router.get('/submissions/:userId', async (req, res) => {
  try {
    const submissions = await prisma.formSubmission.findMany({
      where: {
        userId: req.params.userId
      },
      include: {
        form: {
          select: {
            name: true,
            category: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(submissions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

