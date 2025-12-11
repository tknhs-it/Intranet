import { parseFixedWidth } from '../util/fixedWidth';

export interface RawEnrolmentRecord {
  studentId: string;
  classCode: string;
  subject: string;
  period: string;
  teacherId?: string;
  room?: string;
  term?: string;
  year?: string;
}

/**
 * Parse ENROL.DAT file
 * Format: Fixed-width columns
 */
export function parseEnrolments(raw: string): RawEnrolmentRecord[] {
  const columns = [
    { name: 'studentId', start: 0, width: 10 },
    { name: 'classCode', start: 10, width: 20 },
    { name: 'subject', start: 30, width: 50 },
    { name: 'period', start: 80, width: 10 },
    { name: 'teacherId', start: 90, width: 10 },
    { name: 'room', start: 100, width: 10 },
    { name: 'term', start: 110, width: 1 },
    { name: 'year', start: 111, width: 4 },
  ];

  return parseFixedWidth(raw, columns);
}

