import { CasesFileLoader } from './filesystem/CasesFileLoader';
import { CasesArchive } from './filesystem/CasesArchive';
import { parseStudents } from './parsing/parseStudents';
import { parseStaff } from './parsing/parseStaff';
import { parseEnrolments } from './parsing/parseEnrolments';
import { parseParentContacts } from './parsing/parseParentContacts';
import { validateBatch, validateStudent, validateStaff, validateEnrolment, validateParent } from './validation/validators';
import { mapStudent, mapStaff, mapEnrolment, mapParent } from './mapping/modelMappers';
import { upsertStudents } from './db/upsert/students';
import { upsertStaff } from './db/upsert/staff';
import { logger } from './util/logger';
import { retry } from './util/retry';
import { createSnapshot, shouldRollback } from './db/rollback';
import { etlNotifier } from './notifications/etlNotifier';
import { etlMetrics, EtlMetrics } from './monitoring/etlMetrics';

const CASES_DIRECTORY = process.env.CASES_DIRECTORY || '/mnt/cases-nightly/';
const CASES_ARCHIVE_DIRECTORY = process.env.CASES_ARCHIVE_DIRECTORY || '/mnt/cases-archive/';

/**
 * Main ETL entry point
 * Can be called from Azure Function timer or manually
 */
export async function runEtl(): Promise<{
  success: boolean;
  stats: {
    students: { created: number; updated: number; errors: number };
    staff: { created: number; updated: number; errors: number };
    enrolments: number;
    parents: number;
  };
  errors: string[];
}> {
  const errors: string[] = [];
  const stats = {
    students: { created: 0, updated: 0, errors: 0 },
    staff: { created: 0, updated: 0, errors: 0 },
    enrolments: 0,
    parents: 0,
  };

  let snapshotId: string | null = null;
  const startTime = new Date();
  let metrics: EtlMetrics = {
    startTime,
    filesProcessed: 0,
    recordsProcessed: 0,
    recordsCreated: 0,
    recordsUpdated: 0,
    recordsErrored: 0,
    errorRate: 0,
    success: false,
  };

  try {
    logger.info({ directory: CASES_DIRECTORY }, 'Starting CASES ETL');

    // Create snapshot before processing
    try {
      snapshotId = await createSnapshot();
      logger.info({ snapshotId }, 'Created pre-ETL snapshot');
    } catch (error: any) {
      logger.warn({ error: error.message }, 'Failed to create snapshot, continuing anyway');
    }

    // Initialize file loader with retry
    const loader = new CasesFileLoader(CASES_DIRECTORY);
    
    // Validate directory exists with retry
    const dirExists = await retry(
      async () => {
        const exists = await loader.validateDirectory();
        if (!exists) {
          throw new Error(`CASES directory not found: ${CASES_DIRECTORY}`);
        }
        return exists;
      },
      { maxAttempts: 3, delayMs: 2000 }
    );

    // Load all CASES files with retry
    const files = await retry(
      () => loader.loadAll(),
      { maxAttempts: 3, delayMs: 1000 }
    );
    metrics.filesProcessed = Object.keys(files).length;
    logger.info({ fileCount: metrics.filesProcessed }, 'Loaded CASES files');

    // Process STUDENTS
    if (files['STUDENT.DAT']) {
      try {
        const rawStudents = await parseStudents(files['STUDENT.DAT']);
        logger.info({ count: rawStudents.length }, 'Parsed students');

        const { valid, invalid } = validateBatch(rawStudents, validateStudent);
        
        if (invalid.length > 0) {
          logger.warn({ count: invalid.length }, 'Invalid student records found');
          errors.push(`${invalid.length} invalid student records`);
        }

        const students = valid.map(mapStudent);
        const result = await upsertStudents(students);
        stats.students = result;
        metrics.recordsProcessed += rawStudents.length;
        metrics.recordsCreated += result.created;
        metrics.recordsUpdated += result.updated;
        metrics.recordsErrored += result.errors;
        logger.info(result, 'Upserted students');
      } catch (error: any) {
        logger.error({ error: error.message }, 'Failed to process students');
        errors.push(`Students: ${error.message}`);
      }
    }

    // Process STAFF
    if (files['STAFF.DAT']) {
      try {
        const rawStaff = await parseStaff(files['STAFF.DAT']);
        logger.info({ count: rawStaff.length }, 'Parsed staff');

        const { valid, invalid } = validateBatch(rawStaff, validateStaff);
        
        if (invalid.length > 0) {
          logger.warn({ count: invalid.length }, 'Invalid staff records found');
          errors.push(`${invalid.length} invalid staff records`);
        }

        const staff = valid.map(mapStaff);
        const result = await upsertStaff(staff);
        stats.staff = result;
        metrics.recordsProcessed += rawStaff.length;
        metrics.recordsCreated += result.created;
        metrics.recordsUpdated += result.updated;
        metrics.recordsErrored += result.errors;
        logger.info(result, 'Upserted staff');
      } catch (error: any) {
        logger.error({ error: error.message }, 'Failed to process staff');
        errors.push(`Staff: ${error.message}`);
      }
    }

    // Process ENROLMENTS
    if (files['ENROL.DAT']) {
      try {
        const rawEnrolments = parseEnrolments(files['ENROL.DAT']);
        logger.info({ count: rawEnrolments.length }, 'Parsed enrolments');

        const { valid, invalid } = validateBatch(rawEnrolments, validateEnrolment);
        
        if (invalid.length > 0) {
          logger.warn({ count: invalid.length }, 'Invalid enrolment records found');
        }

        // TODO: Implement enrolment upsert
        stats.enrolments = valid.length;
        logger.info({ count: valid.length }, 'Processed enrolments');
      } catch (error: any) {
        logger.error({ error: error.message }, 'Failed to process enrolments');
        errors.push(`Enrolments: ${error.message}`);
      }
    }

    // Process PARENTS
    if (files['PARENT.DAT']) {
      try {
        const rawParents = parseParentContacts(files['PARENT.DAT']);
        logger.info({ count: rawParents.length }, 'Parsed parents');

        const { valid, invalid } = validateBatch(rawParents, validateParent);
        
        if (invalid.length > 0) {
          logger.warn({ count: invalid.length }, 'Invalid parent records found');
        }

        // TODO: Implement parent upsert
        stats.parents = valid.length;
        logger.info({ count: valid.length }, 'Processed parents');
      } catch (error: any) {
        logger.error({ error: error.message }, 'Failed to process parents');
        errors.push(`Parents: ${error.message}`);
      }
    }

    // Archive processed files
    try {
      const archive = new CasesArchive(CASES_DIRECTORY, CASES_ARCHIVE_DIRECTORY);
      const filenames = Object.keys(files);
      await archive.archiveFiles(filenames);
      logger.info({ count: filenames.length }, 'Archived CASES files');

      // Cleanup old archives
      await archive.cleanupOldArchives(30); // Keep 30 days
    } catch (error: any) {
      logger.error({ error: error.message }, 'Failed to archive files');
      errors.push(`Archive: ${error.message}`);
    }

    // Finalize metrics
    metrics.endTime = new Date();
    metrics.duration = metrics.endTime.getTime() - metrics.startTime.getTime();
    metrics.errorRate = metrics.recordsProcessed > 0 
      ? metrics.recordsErrored / metrics.recordsProcessed 
      : 0;
    metrics.success = errors.length === 0;

    logger.info({ stats, errors, metrics }, 'CASES ETL completed');

    // Record metrics
    etlMetrics.recordMetrics(metrics);

    // Calculate error rate
    const errorRate = metrics.errorRate;

    // Check if rollback is needed
    if (shouldRollback(errorRate)) {
      logger.error({ errorRate, threshold: 0.1 }, 'High error rate detected, rollback recommended');
      errors.push(`High error rate: ${(errorRate * 100).toFixed(2)}%`);
    }

    // Send notifications
    if (errors.length === 0) {
      await etlNotifier.notifySuccess(stats).catch(err => 
        logger.error({ error: err.message }, 'Failed to send success notification')
      );
    } else if (errorRate < 0.1) {
      await etlNotifier.notifyWarning(
        `ETL completed with ${errors.length} warning(s)`,
        stats,
        errors
      ).catch(err => 
        logger.error({ error: err.message }, 'Failed to send warning notification')
      );
    } else {
      await etlNotifier.notifyError(
        'ETL completed with critical errors',
        errors,
        stats
      ).catch(err => 
        logger.error({ error: err.message }, 'Failed to send error notification')
      );
    }

    return {
      success: errors.length === 0 && errorRate < 0.1,
      stats,
      errors,
    };
  } catch (error: any) {
    logger.error({ error: error.message, snapshotId }, 'CASES ETL failed');

    // Send error notification
    await etlNotifier.notifyError(
      `ETL failed: ${error.message}`,
      [...errors, error.message],
      stats
    ).catch(err => 
      logger.error({ error: err.message }, 'Failed to send error notification')
    );

    return {
      success: false,
      stats,
      errors: [...errors, error.message],
    };
  }
}

// Export for use in Azure Function or manual execution
export default runEtl;

