import { Router } from 'express';
import { authenticateAzure } from '../middleware/auth-azure';
import { graphSDK } from '../graph-sdk';
import { logger } from '../cases-etl/util/logger';

const router = Router();

// All routes require authentication
router.use(authenticateAzure);

/**
 * GET /api/daily-org
 * Get latest Daily Org PDF from Teams SharePoint
 */
router.get('/', async (req, res) => {
  try {
    // Find SharePoint site for Daily Org
    // This would typically be in a Teams channel's SharePoint
    const siteId = process.env.DAILY_ORG_SITE_ID || '';
    
    if (!siteId) {
      return res.status(404).json({ error: 'Daily Org site not configured' });
    }

    // Get files from SharePoint
    const items = await graphSDK.sharepoint.listDriveRoot(siteId);
    
    // Find latest PDF (assuming naming convention like "Daily Org 2025-02-13.pdf")
    const pdfFiles = items.filter(item => 
      item.name.toLowerCase().endsWith('.pdf') && 
      item.name.toLowerCase().includes('daily org')
    );

    if (pdfFiles.length === 0) {
      return res.status(404).json({ error: 'No Daily Org PDF found' });
    }

    // Sort by date (newest first) - assuming filename contains date
    pdfFiles.sort((a, b) => {
      const dateA = new Date(a.lastModifiedDateTime);
      const dateB = new Date(b.lastModifiedDateTime);
      return dateB.getTime() - dateA.getTime();
    });

    const latestPdf = pdfFiles[0];

    // Get file content
    const content = await graphSDK.sharepoint.getFileContent(siteId, latestPdf.id);

    // Return PDF with appropriate headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${latestPdf.name}"`);
    res.send(content);
  } catch (error: any) {
    logger.error({ error: error.message }, 'Failed to get Daily Org PDF');
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/daily-org/metadata
 * Get Daily Org PDF metadata (URL, date, etc.)
 */
router.get('/metadata', async (req, res) => {
  try {
    const siteId = process.env.DAILY_ORG_SITE_ID || '';
    
    if (!siteId) {
      return res.status(404).json({ error: 'Daily Org site not configured' });
    }

    const items = await graphSDK.sharepoint.listDriveRoot(siteId);
    
    const pdfFiles = items.filter(item => 
      item.name.toLowerCase().endsWith('.pdf') && 
      item.name.toLowerCase().includes('daily org')
    );

    if (pdfFiles.length === 0) {
      return res.status(404).json({ error: 'No Daily Org PDF found' });
    }

    pdfFiles.sort((a, b) => {
      const dateA = new Date(a.lastModifiedDateTime);
      const dateB = new Date(b.lastModifiedDateTime);
      return dateB.getTime() - dateA.getTime();
    });

    const latestPdf = pdfFiles[0];

    res.json({
      id: latestPdf.id,
      name: latestPdf.name,
      webUrl: latestPdf.webUrl,
      lastModified: latestPdf.lastModifiedDateTime,
      size: latestPdf.size,
    });
  } catch (error: any) {
    logger.error({ error: error.message }, 'Failed to get Daily Org metadata');
    res.status(500).json({ error: error.message });
  }
});

export default router;

