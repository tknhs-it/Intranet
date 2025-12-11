import { parseFixedWidth } from '../util/fixedWidth';
import { getFileSchema } from '../config/schemaConfig';
import { logger } from '../util/logger';

export interface RawStudentRecord {
  studentId: string;
  surname: string;
  givenNames: string;
  dob: string;
  sex: string;
  homeGroup: string;
  house: string;
  yearLevel?: string;
  email?: string;
  phone?: string;
}

/**
 * Parse STUDENT.DAT file
 * Format: Fixed-width columns
 * Schema is loaded from relationships.json or schemaConfig.ts
 */
export async function parseStudents(raw: string): Promise<RawStudentRecord[]> {
  // Load schema from relationships.json or fallback
  const schema = await getFileSchema('STUDENT.DAT');
  
  if (!schema) {
    throw new Error('No schema found for STUDENT.DAT');
  }

  // Parse using schema columns
  const rawRecords = parseFixedWidth(raw, schema.columns);

  // Map fields using field_mapping if available
  const fieldMapping = schema.field_mapping || {};
  
  return rawRecords.map(record => {
    const mapped: any = {};
    
    // Apply field mapping
    for (const [jsonField, ourField] of Object.entries(fieldMapping)) {
      mapped[ourField] = record[jsonField]?.trim() || record[ourField]?.trim();
    }
    
    // If no mapping, use original field names
    if (Object.keys(mapped).length === 0) {
      Object.assign(mapped, record);
    }

    return mapped as RawStudentRecord;
  });
}

