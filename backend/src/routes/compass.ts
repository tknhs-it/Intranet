import { Router } from 'express';
import compassService from '../services/compass';
import { authenticate } from '../middleware/auth';

const router = Router();

// All Compass routes require authentication
router.use(authenticate);

/**
 * GET /api/compass/timetable
 * Get user's timetable for date range
 */
router.get('/timetable', async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.query;

    if (!userId || !startDate || !endDate) {
      return res.status(400).json({ 
        error: 'userId, startDate, and endDate are required' 
      });
    }

    const events = await compassService.getEventsByUser(
      parseInt(userId as string),
      startDate as string,
      endDate as string
    );

    res.json(events);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/compass/tasks
 * Get learning tasks / assessments
 */
router.get('/tasks', async (req, res) => {
  try {
    const { page = 1, limit = 25 } = req.query;

    const tasks = await compassService.getTaskItems(
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/compass/notices
 * Get feed items (notices, alerts)
 */
router.get('/notices', async (req, res) => {
  try {
    const { page = 1, limit = 25 } = req.query;

    const notices = await compassService.getFeedItems(
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.json(notices);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/compass/staff
 * Get all staff
 */
router.get('/staff', async (req, res) => {
  try {
    const staff = await compassService.getStaff();
    res.json(staff);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/compass/staff/:userId
 * Get staff summary by user ID
 */
router.get('/staff/:userId', async (req, res) => {
  try {
    const staff = await compassService.getSummaryByUserId(
      parseInt(req.params.userId)
    );
    res.json(staff);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/compass/terms
 * Get all terms
 */
router.get('/terms', async (req, res) => {
  try {
    const terms = await compassService.getAllTerms();
    res.json(terms);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/compass/campuses
 * Get all campuses
 */
router.get('/campuses', async (req, res) => {
  try {
    const campuses = await compassService.getAllCampuses();
    res.json(campuses);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

