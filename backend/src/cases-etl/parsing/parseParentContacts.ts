import { parseFixedWidth } from '../util/fixedWidth';

export interface RawParentRecord {
  parentId: string;
  surname: string;
  givenNames: string;
  email: string;
  phone: string;
  relationship: string;
  studentId: string;
  primaryContact: string; // Y/N
}

/**
 * Parse PARENT.DAT file
 * Format: Fixed-width columns
 */
export function parseParentContacts(raw: string): RawParentRecord[] {
  const columns = [
    { name: 'parentId', start: 0, width: 10 },
    { name: 'surname', start: 10, width: 30 },
    { name: 'givenNames', start: 40, width: 30 },
    { name: 'email', start: 70, width: 100 },
    { name: 'phone', start: 170, width: 20 },
    { name: 'relationship', start: 190, width: 20 },
    { name: 'studentId', start: 210, width: 10 },
    { name: 'primaryContact', start: 220, width: 1 },
  ];

  return parseFixedWidth(raw, columns);
}

