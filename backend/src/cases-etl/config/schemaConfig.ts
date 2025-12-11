/**
 * CASES Schema Configuration
 * 
 * This file defines the schema for CASES text files.
 * The schema can be loaded from relationships.json or defined here.
 * 
 * Column positions are 0-indexed.
 */

import { FixedWidthColumn } from '../util/fixedWidth';
import { FileLayout } from './schemaLoader';

/**
 * CASES file schemas
 * These define the fixed-width column positions for each file type
 * 
 * NOTE: These positions should match your actual CASES export format.
 * If you have a relationships.json with file_layouts, those will be used instead.
 */
export const CASES_FILE_SCHEMAS: Record<string, FileLayout> = {
  'STUDENT.DAT': {
    filename: 'STUDENT.DAT',
    table_name: 'DF_8865',
    columns: [
      { name: 'CASES_KEY', start: 0, width: 10 },
      { name: 'SURNAME', start: 10, width: 30 },
      { name: 'GIVEN_NAMES', start: 40, width: 30 },
      { name: 'DOB', start: 70, width: 8 }, // YYYYMMDD format
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

  'ENROL.DAT': {
    filename: 'ENROL.DAT',
    table_name: 'ENROL_8865',
    columns: [
      { name: 'CASES_KEY', start: 0, width: 10 },
      { name: 'CLASS_CODE', start: 10, width: 20 },
      { name: 'PERIOD', start: 30, width: 2 },
      { name: 'YEAR', start: 32, width: 4 },
      { name: 'SEMESTER', start: 36, width: 1 },
    ],
    field_mapping: {
      'CASES_KEY': 'studentId',
      'CLASS_CODE': 'classCode',
      'PERIOD': 'period',
      'YEAR': 'year',
      'SEMESTER': 'semester',
    },
  },

  'PARENT.DAT': {
    filename: 'PARENT.DAT',
    table_name: 'PARENT_8865',
    columns: [
      { name: 'PARENT_KEY', start: 0, width: 10 },
      { name: 'SURNAME', start: 10, width: 30 },
      { name: 'GIVEN_NAMES', start: 40, width: 30 },
      { name: 'EMAIL', start: 70, width: 100 },
      { name: 'TELEPHONE', start: 170, width: 20 },
      { name: 'RELATIONSHIP', start: 190, width: 20 },
    ],
    field_mapping: {
      'PARENT_KEY': 'parentId',
      'SURNAME': 'surname',
      'GIVEN_NAMES': 'givenNames',
      'EMAIL': 'email',
      'TELEPHONE': 'phone',
      'RELATIONSHIP': 'relationship',
    },
  },
};

/**
 * Get schema for a CASES file
 * First tries to load from relationships.json, then falls back to hardcoded schemas
 */
export async function getFileSchema(filename: string): Promise<FileLayout | null> {
  // Try to load from relationships.json first
  try {
    const { loadFileLayout } = await import('./schemaLoader');
    const schema = await loadFileLayout(filename);
    if (schema) {
      return schema;
    }
  } catch (error) {
    // Fall back to hardcoded schema
  }

  // Fall back to hardcoded schema
  return CASES_FILE_SCHEMAS[filename] || null;
}

/**
 * Get column definitions for a file
 */
export async function getFileColumns(filename: string): Promise<FixedWidthColumn[]> {
  const schema = await getFileSchema(filename);
  if (!schema) {
    throw new Error(`No schema found for file: ${filename}`);
  }
  return schema.columns;
}

