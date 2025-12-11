import { Router } from 'express';
import { authenticateAzure, AuthenticatedRequest } from '../middleware/auth-azure';
import microsoftGraph from '../services/microsoft-graph';

const router = Router();

// All Graph routes require authentication
router.use(authenticateAzure);

/**
 * GET /api/graph/photo/:userId
 * Get staff photo
 */
router.get('/photo/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const photoUrl = await microsoftGraph.getStaffPhotoUrl(userId);

    if (!photoUrl) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    res.json({ photoUrl });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/graph/teams
 * Get user's Teams
 */
router.get('/teams', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const teams = await microsoftGraph.getUserTeams(req.userId);
    res.json(teams);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/graph/teams/:teamId/channels
 * Get team channels
 */
router.get('/teams/:teamId/channels', async (req, res) => {
  try {
    const { teamId } = req.params;
    const channels = await microsoftGraph.getTeamChannels(teamId);
    res.json(channels);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/graph/calendar
 * Get user calendar events
 */
router.get('/calendar', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { startDateTime, endDateTime } = req.query;

    if (!startDateTime || !endDateTime) {
      return res.status(400).json({ 
        error: 'startDateTime and endDateTime required' 
      });
    }

    const events = await microsoftGraph.getUserCalendarEvents(
      req.userId,
      startDateTime as string,
      endDateTime as string
    );

    res.json(events);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/graph/presence/:userId
 * Get user presence
 */
router.get('/presence/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const presence = await microsoftGraph.getUserPresence(userId);
    res.json(presence);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/graph/sharepoint/sites
 * Get SharePoint sites
 */
router.get('/sharepoint/sites', async (req, res) => {
  try {
    const sites = await microsoftGraph.getSharePointSites();
    res.json(sites);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/graph/sharepoint/sites/:siteId/files
 * Get SharePoint site files
 */
router.get('/sharepoint/sites/:siteId/files', async (req, res) => {
  try {
    const { siteId } = req.params;
    const { path } = req.query;
    const items = await microsoftGraph.getSiteDriveItems(siteId, path as string);
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

