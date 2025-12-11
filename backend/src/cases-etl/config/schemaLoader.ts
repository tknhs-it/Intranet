import fs from 'fs/promises';
import path from 'path';
import { logger } from '../util/logger';
import { FixedWidthColumn } from '../util/fixedWidth';

/**
 * CASES table name to file name mapping
 * DF_8865 = Students (STUDENT.DAT)
 * SF_8865 = Staff (STAFF.DAT)
 * etc.
 */
export const CASES_TABLE_TO_FILE: Record<string, string> = {
  'DF_8865': 'STUDENT.DAT',
  'SF_8865': 'STAFF.DAT',
  'ENROL_8865': 'ENROL.DAT', // May need adjustment
  'PARENT_8865': 'PARENT.DAT', // May need adjustment
  'HOMEGRP_8865': 'HOMEGRP.DAT',
  'HOUSE_8865': 'HOUSE.DAT',
};

/**
 * File name to CASES table name mapping (reverse)
 */
export const CASES_FILE_TO_TABLE: Record<string, string> = {
  'STUDENT.DAT': 'DF_8865',
  'STAFF.DAT': 'SF_8865',
  'ENROL.DAT': 'ENROL_8865',
  'PARENT.DAT': 'PARENT_8865',
  'HOMEGRP.DAT': 'HOMEGRP_8865',
  'HOUSE.DAT': 'HOUSE_8865',
};

/**
 * Relationships JSON structure
 */
interface RelationshipsJson {
  primary_keys: Record<string, string[]>;
  relationships?: any[];
  field_definitions?: Record<string, FieldDefinition[]>;
  file_layouts?: Record<string, FileLayout>;
}

/**
 * Field definition from relationships JSON
 */
interface FieldDefinition {
  name: string;
  type?: string;
  length?: number;
}

/**
 * File layout with column positions
 */
export interface FileLayout {
  filename: string;
  table_name: string;
  columns: FixedWidthColumn[];
  field_mapping?: Record<string, string>; // Maps JSON field names to our field names
}

/**
 * Load relationships JSON file
 */
export async function loadRelationshipsJson(filePath?: string): Promise<RelationshipsJson> {
  const defaultPath = path.join(process.cwd(), 'relationships.json');
  const jsonPath = filePath || process.env.CASES_RELATIONSHIPS_JSON || defaultPath;

  try {
    const content = await fs.readFile(jsonPath, 'utf8');
    const json = JSON.parse(content) as RelationshipsJson;
    logger.info({ path: jsonPath }, 'Loaded relationships JSON');
    return json;
  } catch (error: any) {
    logger.error({ path: jsonPath, error: error.message }, 'Failed to load relationships JSON');
    throw new Error(`Failed to load relationships JSON: ${error.message}`);
  }
}

/**
 * Get primary keys for a CASES table
 */
export async function getTablePrimaryKeys(tableName: string): Promise<string[]> {
  const relationships = await loadRelationshipsJson();
  return relationships.primary_keys[tableName] || [];
}

/**
 * Get all field names for a CASES table from primary_keys
 * (This extracts field names from the primary_keys structure)
 */
export async function getTableFields(tableName: string): Promise<string[]> {
  const relationships = await loadRelationshipsJson();
  return relationships.primary_keys[tableName] || [];
}

/**
 * Load file layout schema
 * This can be extended to read from relationships.json or a separate schema file
 */
export async function loadFileLayout(filename: string): Promise<FileLayout | null> {
  const tableName = CASES_FILE_TO_TABLE[filename];
  if (!tableName) {
    logger.warn({ filename }, 'Unknown CASES file, no table mapping');
    return null;
  }

  // Try to load from relationships.json first
  const relationships = await loadRelationshipsJson();
  
  // If relationships.json has file_layouts, use that
  if (relationships.file_layouts && relationships.file_layouts[filename]) {
    return relationships.file_layouts[filename] as FileLayout;
  }

  // Otherwise, fall back to hardcoded schemas (for now)
  // These should eventually be moved to a schema config file
  return getDefaultFileLayout(filename, tableName);
}

/**
 * Get default file layout (fallback when not in relationships.json)
 * These should be moved to a configuration file or the relationships.json
 */
function getDefaultFileLayout(filename: string, tableName: string): FileLayout | null {
  const layouts: Record<string, FileLayout> = {
    'STUDENT.DAT': {
      filename: 'STUDENT.DAT',
      table_name: 'DF_8865',
      columns: [
        { name: 'CASES_KEY', start: 0, width: 10 },
        { name: 'SURNAME', start: 10, width: 30 },
        { name: 'GIVEN_NAMES', start: 40, width: 30 },
        { name: 'DOB', start: 70, width: 8 }, // YYYYMMDD
        { name: 'SEX', start: 78, width: 1 }, // M/F
        { name: 'HOMEKEY', start: 79, width: 10 },
        { name: 'HOUSE', start: 89, width: 10 },
        { name: 'YEAR_LEVEL', start: 99, width: 2 },
        { name: 'EMAIL', start: 101, width: 100 },
        { name: 'TELEPHONE', start: 201, width: 20 },
      ],
      field_mapping: {
        'CASES_KEY': 'studentId',
        'SURNAME': 'surname',
        'GIVEN_NAMES': 'givenNames',
        'DOB': 'dob',
        'SEX': 'sex',
        'HOMEKEY': 'homeGroup',
        'HOUSE': 'house',
        'YEAR_LEVEL': 'yearLevel',
        'EMAIL': 'email',
        'TELEPHONE': 'phone',
      },
    },
    'STAFF.DAT': {
      filename: 'STAFF.DAT',
      table_name: 'SF_8865',
      columns: [
        { name: 'SFKEY', start: 0, width: 10 },
        { name: 'SURNAME', start: 10, width: 30 },
        { name: 'GIVEN_NAMES', start: 40, width: 30 },
        { name: 'EMAIL', start: 70, width: 100 },
        { name: 'EMPLOYMENT_TYPE', start: 170, width: 2 },
        { name: 'ACTIVE_FLAG', start: 172, width: 1 }, // Y/N
        { name: 'DEPARTMENT', start: 173, width: 50 },
        { name: 'POSITION', start: 223, width: 50 },
        { name: 'TELEPHONE', start: 273, width: 20 },
      ],
      field_mapping: {
        'SFKEY': 'staffId',
        'SURNAME': 'surname',
        'GIVEN_NAMES': 'givenNames',
        'EMAIL': 'email',
        'EMPLOYMENT_TYPE': 'employmentType',
        'ACTIVE_FLAG': 'activeFlag',
        'DEPARTMENT': 'department',
        'POSITION': 'position',
        'TELEPHONE': 'phone',
      },
    },
  };

  return layouts[filename] || null;
}

/**
 * Validate that relationships.json structure matches expected format
 */
export async function validateRelationshipsJson(): Promise<boolean> {
  try {
    const relationships = await loadRelationshipsJson();
    
    // Check required structure
    if (!relationships.primary_keys) {
      logger.error('relationships.json missing primary_keys section');
      return false;
    }

    // Check that we have the expected tables
    const requiredTables = ['DF_8865', 'SF_8865'];
    const missingTables = requiredTables.filter(t => !relationships.primary_keys[t]);
    
    if (missingTables.length > 0) {
      logger.warn({ missingTables }, 'Some expected CASES tables not found in relationships.json');
    }

    logger.info('relationships.json validation passed');
    return true;
  } catch (error: any) {
    logger.error({ error: error.message }, 'relationships.json validation failed');
    return false;
  }
}

