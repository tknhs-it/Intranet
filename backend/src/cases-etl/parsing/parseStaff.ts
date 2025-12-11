import { parseFixedWidth } from '../util/fixedWidth';

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
 */
export function parseStaff(raw: string): RawStaffRecord[] {
  const columns = [
    { name: 'staffId', start: 0, width: 10 },
    { name: 'surname', start: 10, width: 30 },
    { name: 'givenNames', start: 40, width: 30 },
    { name: 'email', start: 70, width: 100 },
    { name: 'employmentType', start: 170, width: 2 },
    { name: 'activeFlag', start: 172, width: 1 }, // Y/N
    { name: 'department', start: 173, width: 50 },
    { name: 'position', start: 223, width: 50 },
    { name: 'phone', start: 273, width: 20 },
  ];

  return parseFixedWidth(raw, columns);
}

