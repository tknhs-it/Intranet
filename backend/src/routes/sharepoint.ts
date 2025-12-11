import { Router } from 'express';
import { authenticateAzure } from '../middleware/auth-azure';
import { graphSDK } from '../graph-sdk';

const router = Router();

// All routes require authentication
router.use(authenticateAzure);

/**
 * GET /api/sharepoint/sites
 * List SharePoint sites
 */
router.get('/sites', async (req, res) => {
  try {
    const { search } = req.query;
    const sites = await graphSDK.sharepoint.listSites(search as string);
    res.json(sites);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/sharepoint/sites/:siteId
 * Get site details
 */
router.get('/sites/:siteId', async (req, res) => {
  try {
    const { siteId } = req.params;
    const site = await graphSDK.sharepoint.getSite(siteId);
    res.json(site);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/sharepoint/sites/:siteId/files
 * List files in site root or specific folder
 */
router.get('/sites/:siteId/files', async (req, res) => {
  try {
    const { siteId } = req.params;
    const { itemId, path } = req.query;

    let items;

    if (path) {
      items = await graphSDK.sharepoint.listChildrenByPath(siteId, path as string);
    } else if (itemId) {
      items = await graphSDK.sharepoint.getDriveItemChildren(siteId, itemId as string);
    } else {
      items = await graphSDK.sharepoint.listDriveRoot(siteId);
    }

    res.json(items);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/sharepoint/sites/:siteId/files/:itemId/content
 * Get file content
 */
router.get('/sites/:siteId/files/:itemId/content', async (req, res) => {
  try {
    const { siteId, itemId } = req.params;
    const content = await graphSDK.sharepoint.getFileContent(siteId, itemId);

    // Set appropriate headers
    res.setHeader('Content-Type', 'application/octet-stream');
    res.send(content);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

