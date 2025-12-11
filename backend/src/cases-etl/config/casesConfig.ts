export interface CasesFileDef {
  filename: string;
  parser: string;
  description: string;
  required: boolean;
}

/**
 * CASES file definitions
 * Maps CASES export filenames to their parsers and descriptions
 */
export const CASES_FILES: CasesFileDef[] = [
  {
    filename: "STUDENT.DAT",
    parser: "parseStudents",
    description: "Student demographic records",
    required: true,
  },
  {
    filename: "ENROL.DAT",
    parser: "parseEnrolments",
    description: "Student enrolment records per period",
    required: true,
  },
  {
    filename: "STAFF.DAT",
    parser: "parseStaff",
    description: "Staff demographic records",
    required: true,
  },
  {
    filename: "PARENT.DAT",
    parser: "parseParentContacts",
    description: "Parent demographic records",
    required: true,
  },
  {
    filename: "HOMEGRP.DAT",
    parser: "parseHomeGroups",
    description: "Home group definitions",
    required: false,
  },
  {
    filename: "HOUSE.DAT",
    parser: "parseHouses",
    description: "House definitions",
    required: false,
  },
  {
    filename: "ABSENCE.DAT",
    parser: "parseAbsences",
    description: "Student absence records",
    required: false,
  },
];

/**
 * Get file definition by filename
 */
export function getFileDef(filename: string): CasesFileDef | undefined {
  return CASES_FILES.find(f => f.filename === filename);
}

