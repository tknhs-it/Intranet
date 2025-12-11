import { RawStudentRecord } from '../parsing/parseStudents';
import { RawStaffRecord } from '../parsing/parseStaff';
import { RawEnrolmentRecord } from '../parsing/parseEnrolments';
import { RawParentRecord } from '../parsing/parseParentContacts';
import { logger } from '../util/logger';

export class ValidationError extends Error {
  constructor(public field: string, message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validate student record
 */
export function validateStudent(r: RawStudentRecord): boolean {
  if (!r.studentId || r.studentId.trim() === '') {
    throw new ValidationError('studentId', 'Student missing ID');
  }

  if (!r.surname || r.surname.trim() === '') {
    throw new ValidationError('surname', 'Student missing surname');
  }

  if (!r.givenNames || r.givenNames.trim() === '') {
    throw new ValidationError('givenNames', 'Student missing given names');
  }

  // Validate date format (YYYYMMDD)
  if (r.dob && r.dob.length === 8) {
    const year = parseInt(r.dob.substring(0, 4));
    const month = parseInt(r.dob.substring(4, 6));
    const day = parseInt(r.dob.substring(6, 8));

    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      logger.warn({ studentId: r.studentId, dob: r.dob }, 'Invalid date format');
    }
  }

  return true;
}

/**
 * Validate staff record
 */
export function validateStaff(r: RawStaffRecord): boolean {
  if (!r.staffId || r.staffId.trim() === '') {
    throw new ValidationError('staffId', 'Staff missing ID');
  }

  if (!r.surname || r.surname.trim() === '') {
    throw new ValidationError('surname', 'Staff missing surname');
  }

  if (r.email && !isValidEmail(r.email)) {
    logger.warn({ staffId: r.staffId, email: r.email }, 'Invalid email format');
  }

  return true;
}

/**
 * Validate enrolment record
 */
export function validateEnrolment(r: RawEnrolmentRecord): boolean {
  if (!r.studentId || r.studentId.trim() === '') {
    throw new ValidationError('studentId', 'Enrolment missing student ID');
  }

  if (!r.classCode || r.classCode.trim() === '') {
    throw new ValidationError('classCode', 'Enrolment missing class code');
  }

  return true;
}

/**
 * Validate parent record
 */
export function validateParent(r: RawParentRecord): boolean {
  if (!r.parentId || r.parentId.trim() === '') {
    throw new ValidationError('parentId', 'Parent missing ID');
  }

  if (!r.studentId || r.studentId.trim() === '') {
    throw new ValidationError('studentId', 'Parent missing student ID');
  }

  return true;
}

/**
 * Batch validate records with error collection
 */
export function validateBatch<T>(
  records: T[],
  validator: (r: T) => boolean
): { valid: T[]; invalid: Array<{ record: T; error: string }> } {
  const valid: T[] = [];
  const invalid: Array<{ record: T; error: string }> = [];

  for (const record of records) {
    try {
      validator(record);
      valid.push(record);
    } catch (error: any) {
      invalid.push({
        record,
        error: error.message || 'Validation failed',
      });
    }
  }

  return { valid, invalid };
}

/**
 * Simple email validation
 */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

