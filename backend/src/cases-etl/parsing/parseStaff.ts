import { parseFixedWidth } from '../util/fixedWidth';
import { getFileSchema } from '../config/schemaConfig';
import { logger } from '../util/logger';

export interface RawStaffRecord {
  staffId: string;
  surname: string;
  givenNames: string;
  email: string;
  employmentType: string;
  activeFlag: string;
  department?: string;
  position?: string;
  phone?: string;
}

/**
 * Parse STAFF.DAT file
 * Format: Fixed-width columns
 * Schema is loaded from relationships.json or schemaConfig.ts
 */
export async function parseStaff(raw: string): Promise<RawStaffRecord[]> {
  // Load schema from relationships.json or fallback
  const schema = await getFileSchema('STAFF.DAT');
  
  if (!schema) {
    throw new Error('No schema found for STAFF.DAT');
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

    return mapped as RawStaffRecord;
  });
}

