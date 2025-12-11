import { parseFixedWidth } from '../util/fixedWidth';

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
 */
export function parseStudents(raw: string): RawStudentRecord[] {
  const columns = [
    { name: 'studentId', start: 0, width: 10 },
    { name: 'surname', start: 10, width: 30 },
    { name: 'givenNames', start: 40, width: 30 },
    { name: 'dob', start: 70, width: 8 }, // YYYYMMDD format
    { name: 'sex', start: 78, width: 1 }, // M/F
    { name: 'homeGroup', start: 79, width: 10 },
    { name: 'house', start: 89, width: 10 },
    { name: 'yearLevel', start: 99, width: 2 },
    { name: 'email', start: 101, width: 100 },
    { name: 'phone', start: 201, width: 20 },
  ];

  return parseFixedWidth(raw, columns);
}

