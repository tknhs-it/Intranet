import { RawStudentRecord } from '../parsing/parseStudents';
import { RawStaffRecord } from '../parsing/parseStaff';
import { RawEnrolmentRecord } from '../parsing/parseEnrolments';
import { RawParentRecord } from '../parsing/parseParentContacts';

/**
 * Derive year level from various sources
 */
function deriveYearLevel(raw: RawStudentRecord): number | null {
  // Try yearLevel field first
  if (raw.yearLevel) {
    const year = parseInt(raw.yearLevel);
    if (!isNaN(year) && year >= 7 && year <= 12) {
      return year;
    }
  }

  // Try to derive from home group (e.g., "7A", "12B")
  if (raw.homeGroup) {
    const match = raw.homeGroup.match(/^(\d{1,2})/);
    if (match) {
      const year = parseInt(match[1]);
      if (!isNaN(year) && year >= 7 && year <= 12) {
        return year;
      }
    }
  }

  // Try to derive from DOB
  if (raw.dob && raw.dob.length === 8) {
    const birthYear = parseInt(raw.dob.substring(0, 4));
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;
    
    // Approximate year level (age 12-13 = Year 7, etc.)
    if (age >= 12 && age <= 18) {
      return age - 5; // Rough approximation
    }
  }

  return null;
}

/**
 * Parse date from YYYYMMDD format
 */
function parseDate(dateStr: string): Date | null {
  if (!dateStr || dateStr.length !== 8) return null;
  
  const year = parseInt(dateStr.substring(0, 4));
  const month = parseInt(dateStr.substring(4, 6)) - 1; // Month is 0-indexed
  const day = parseInt(dateStr.substring(6, 8));

  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

  return new Date(year, month, day);
}

/**
 * Map raw student record to database model
 */
export function mapStudent(raw: RawStudentRecord) {
  return {
    cases_id: raw.studentId.trim(),
    first_name: raw.givenNames.trim(),
    last_name: raw.surname.trim(),
    date_of_birth: parseDate(raw.dob),
    sex: raw.sex === 'M' ? 'MALE' : raw.sex === 'F' ? 'FEMALE' : null,
    year_level: deriveYearLevel(raw),
    home_group: raw.homeGroup.trim() || null,
    house: raw.house.trim() || null,
    email: raw.email?.trim().toLowerCase() || null,
    phone: raw.phone?.trim() || null,
    active: true,
  };
}

/**
 * Map raw staff record to database model
 */
export function mapStaff(raw: RawStaffRecord) {
  return {
    cases_id: raw.staffId.trim(),
    first_name: raw.givenNames.trim(),
    last_name: raw.surname.trim(),
    email: raw.email.trim().toLowerCase(),
    employment_type: raw.employmentType.trim() || null,
    department: raw.department?.trim() || null,
    position: raw.position?.trim() || null,
    phone: raw.phone?.trim() || null,
    active: raw.activeFlag === 'Y' || raw.activeFlag === '1',
  };
}

/**
 * Map raw enrolment record to database model
 */
export function mapEnrolment(raw: RawEnrolmentRecord, classId?: number) {
  return {
    student_cases_id: raw.studentId.trim(),
    class_code: raw.classCode.trim(),
    subject: raw.subject.trim() || null,
    period: raw.period.trim() || null,
    teacher_cases_id: raw.teacherId?.trim() || null,
    room: raw.room?.trim() || null,
    term: raw.term ? parseInt(raw.term) : null,
    year: raw.year ? parseInt(raw.year) : new Date().getFullYear(),
    class_id: classId || null,
  };
}

/**
 * Map raw parent record to database model
 */
export function mapParent(raw: RawParentRecord) {
  return {
    cases_id: raw.parentId.trim(),
    first_name: raw.givenNames.trim(),
    last_name: raw.surname.trim(),
    email: raw.email.trim().toLowerCase() || null,
    phone: raw.phone.trim() || null,
    relationship: raw.relationship.trim() || null,
    student_cases_id: raw.studentId.trim(),
    is_primary_contact: raw.primaryContact === 'Y' || raw.primaryContact === '1',
  };
}

