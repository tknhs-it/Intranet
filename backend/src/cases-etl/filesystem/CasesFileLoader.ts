import fs from 'fs/promises';
import path from 'path';
import { CASES_FILES, getFileDef } from '../config/casesConfig';
import { logger } from '../util/logger';

export class CasesFileLoader {
  constructor(private directory: string) {}

  /**
   * Load all CASES files from the directory
   */
  async loadAll(): Promise<Record<string, string>> {
    const results: Record<string, string> = {};
    const errors: string[] = [];

    for (const fileDef of CASES_FILES) {
      const fullPath = path.join(this.directory, fileDef.filename);

      try {
        const data = await fs.readFile(fullPath, 'utf8');
        results[fileDef.filename] = data;
        logger.info({ filename: fileDef.filename }, 'Loaded CASES file');
      } catch (err: any) {
        if (fileDef.required) {
          logger.error({ filename: fileDef.filename, error: err.message }, 'Required CASES file missing');
          errors.push(`Required file missing: ${fileDef.filename}`);
        } else {
          logger.warn({ filename: fileDef.filename }, 'Optional CASES file not found');
        }
      }
    }

    if (errors.length > 0) {
      throw new Error(`CASES ETL failed: ${errors.join(', ')}`);
    }

    return results;
  }

  /**
   * Check if directory exists and is accessible
   */
  async validateDirectory(): Promise<boolean> {
    try {
      await fs.access(this.directory);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * List available files in directory
   */
  async listFiles(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.directory);
      return files.filter(f => CASES_FILES.some(cf => cf.filename === f));
    } catch (err: any) {
      logger.error({ error: err.message, directory: this.directory }, 'Failed to list CASES directory');
      return [];
    }
  }
}

