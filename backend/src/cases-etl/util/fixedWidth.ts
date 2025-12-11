/**
 * Fixed-width file parser for CASES format
 * CASES files use fixed-width columns rather than delimited formats
 */

export interface FixedWidthColumn {
  name: string;
  start: number;
  width: number;
}

/**
 * Parse fixed-width text into structured objects
 */
export function parseFixedWidth(
  text: string,
  columns: FixedWidthColumn[]
): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter(Boolean);

  return lines.map(line => {
    const obj: Record<string, string> = {};

    for (const col of columns) {
      const end = Math.min(col.start + col.width, line.length);
      obj[col.name] = line.substring(col.start, end).trim();
    }

    return obj;
  });
}

/**
 * Parse CSV format (some CASES files may use CSV)
 */
export function parseCSV(text: string, headers?: string[]): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter(Boolean);
  
  if (lines.length === 0) return [];

  // If headers provided, use them; otherwise parse from first line
  const headerRow = headers || lines[0].split(',').map(h => h.trim());
  const dataLines = headers ? lines : lines.slice(1);

  return dataLines.map(line => {
    const values = line.split(',').map(v => v.trim());
    const obj: Record<string, string> = {};
    
    headerRow.forEach((header, index) => {
      obj[header] = values[index] || '';
    });

    return obj;
  });
}

