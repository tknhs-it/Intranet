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

  try {
    logger.info({ directory: CASES_DIRECTORY }, 'Starting CASES ETL');

    // Initialize file loader
    const loader = new CasesFileLoader(CASES_DIRECTORY);
    
    // Validate directory exists
    const dirExists = await loader.validateDirectory();
    if (!dirExists) {
      throw new Error(`CASES directory not found: ${CASES_DIRECTORY}`);
    }

    // Load all CASES files
    const files = await loader.loadAll();
    logger.info({ fileCount: Object.keys(files).length }, 'Loaded CASES files');

    // Process STUDENTS
    if (files['STUDENT.DAT']) {
      try {
        const rawStudents = parseStudents(files['STUDENT.DAT']);
        logger.info({ count: rawStudents.length }, 'Parsed students');

        const { valid, invalid } = validateBatch(rawStudents, validateStudent);
        
        if (invalid.length > 0) {
          logger.warn({ count: invalid.length }, 'Invalid student records found');
          errors.push(`${invalid.length} invalid student records`);
        }

        const students = valid.map(mapStudent);
        const result = await upsertStudents(students);
        stats.students = result;
        logger.info(result, 'Upserted students');
      } catch (error: any) {
        logger.error({ error: error.message }, 'Failed to process students');
        errors.push(`Students: ${error.message}`);
      }
    }

    // Process STAFF
    if (files['STAFF.DAT']) {
      try {
        const rawStaff = parseStaff(files['STAFF.DAT']);
        logger.info({ count: rawStaff.length }, 'Parsed staff');

        const { valid, invalid } = validateBatch(rawStaff, validateStaff);
        
        if (invalid.length > 0) {
          logger.warn({ count: invalid.length }, 'Invalid staff records found');
          errors.push(`${invalid.length} invalid staff records`);
        }

        const staff = valid.map(mapStaff);
        const result = await upsertStaff(staff);
        stats.staff = result;
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

    logger.info({ stats, errors }, 'CASES ETL completed');

    return {
      success: errors.length === 0,
      stats,
      errors,
    };
  } catch (error: any) {
    logger.error({ error: error.message }, 'CASES ETL failed');
    return {
      success: false,
      stats,
      errors: [...errors, error.message],
    };
  }
}

// Export for use in Azure Function or manual execution
export default runEtl;

