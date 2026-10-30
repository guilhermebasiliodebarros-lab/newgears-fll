export const csvCell = (value) => {
  const text = String(value ?? '');
  const leading = [...text].find((char) => char.charCodeAt(0) > 32 && !/\s/.test(char));
  const safe = leading && '=+@-'.includes(leading) ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
};
export const teamCsv = (headers, rows) => `\uFEFF${[headers, ...rows].map((row) => row.map(csvCell).join(';')).join('\r\n')}`;
