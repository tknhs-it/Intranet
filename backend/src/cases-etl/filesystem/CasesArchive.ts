import fs from 'fs/promises';
import path from 'path';
import { logger } from '../util/logger';

export class CasesArchive {
  constructor(
    private sourceDirectory: string,
    private archiveDirectory: string
  ) {}

  /**
   * Archive processed CASES files
   */
  async archiveFiles(filenames: string[]): Promise<void> {
    // Ensure archive directory exists
    try {
      await fs.mkdir(this.archiveDirectory, { recursive: true });
    } catch (err: any) {
      if (err.code !== 'EEXIST') {
        throw err;
      }
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const archiveSubdir = path.join(this.archiveDirectory, timestamp);

    await fs.mkdir(archiveSubdir, { recursive: true });

    for (const filename of filenames) {
      const sourcePath = path.join(this.sourceDirectory, filename);
      const archivePath = path.join(archiveSubdir, filename);

      try {
        await fs.copyFile(sourcePath, archivePath);
        logger.info({ filename, archivePath }, 'Archived CASES file');
      } catch (err: any) {
        logger.error({ filename, error: err.message }, 'Failed to archive file');
      }
    }
  }

  /**
   * Clean up old archives (keep last N days)
   */
  async cleanupOldArchives(daysToKeep: number = 30): Promise<void> {
    try {
      const entries = await fs.readdir(this.archiveDirectory, { withFileTypes: true });
      const now = Date.now();
      const cutoff = now - (daysToKeep * 24 * 60 * 60 * 1000);

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const entryPath = path.join(this.archiveDirectory, entry.name);
          const stats = await fs.stat(entryPath);
          
          if (stats.mtimeMs < cutoff) {
            await fs.rm(entryPath, { recursive: true });
            logger.info({ directory: entry.name }, 'Removed old archive');
          }
        }
      }
    } catch (err: any) {
      logger.error({ error: err.message }, 'Failed to cleanup old archives');
    }
  }
}

