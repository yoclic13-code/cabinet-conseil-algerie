export function toCsv(rows: Record<string, unknown>[], columns: string[]): string {
  const escape = (val: unknown) => {
    const str = val == null ? '' : String(val);
    if (/[",\n\r]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const header = columns.join(',');
  const body = rows.map((row) => columns.map((col) => escape(row[col])).join(',')).join('\n');
  return `${header}\n${body}\n`;
}
