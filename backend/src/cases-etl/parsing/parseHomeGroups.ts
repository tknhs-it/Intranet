import { parseFixedWidth } from '../util/fixedWidth';

export interface RawHomeGroupRecord {
  homeGroupCode: string;
  homeGroupName: string;
  yearLevel: string;
  teacherId?: string;
}

/**
 * Parse HOMEGRP.DAT file (optional)
 */
export function parseHomeGroups(raw: string): RawHomeGroupRecord[] {
  const columns = [
    { name: 'homeGroupCode', start: 0, width: 10 },
    { name: 'homeGroupName', start: 10, width: 50 },
    { name: 'yearLevel', start: 60, width: 2 },
    { name: 'teacherId', start: 62, width: 10 },
  ];

  return parseFixedWidth(raw, columns);
}

