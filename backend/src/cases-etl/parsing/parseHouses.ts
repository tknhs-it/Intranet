import { parseFixedWidth } from '../util/fixedWidth';

export interface RawHouseRecord {
  houseCode: string;
  houseName: string;
  description?: string;
}

/**
 * Parse HOUSE.DAT file (optional)
 */
export function parseHouses(raw: string): RawHouseRecord[] {
  const columns = [
    { name: 'houseCode', start: 0, width: 10 },
    { name: 'houseName', start: 10, width: 50 },
    { name: 'description', start: 60, width: 100 },
  ];

  return parseFixedWidth(raw, columns);
}

