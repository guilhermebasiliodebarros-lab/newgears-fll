const normalize = (value) => {
  if (value === undefined) return null;
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((key) => [key, normalize(value[key])]));
  return value;
};
export const sameValue = (left, right) => JSON.stringify(normalize(left)) === JSON.stringify(normalize(right));
export const pickFields = (record, fields) => Object.fromEntries(fields.map((field) => [field, record?.[field] ?? null]));
export class RecordConflictError extends Error {
  constructor(message, { expected, current, proposed, fields }) {
    super(message); this.name = 'RecordConflictError'; this.code = 'record-conflict';
    this.conflict = { expected: pickFields(expected, fields), current: pickFields(current, fields), proposed: pickFields(proposed, fields), fields };
    this.currentRecord = current ? pickFields(current, [...new Set([...fields, 'id', 'revision', 'updatedAt'])]) : null;
  }
}
export function compareRecordVersions({ expected = {}, current = {}, proposed = {}, fields = [] }) {
  return fields.map((field) => {
    const mineChanged = !sameValue(expected[field], proposed[field]);
    const currentChanged = !sameValue(expected[field], current[field]);
    return { field, original: expected[field], current: current[field], proposed: proposed[field], mineChanged, currentChanged,
      needsChoice: mineChanged && currentChanged && !sameValue(proposed[field], current[field]),
      suggested: mineChanged ? 'mine' : 'current' };
  });
}
export function resolveRecordVersions(conflict, choices = {}) {
  const rows = compareRecordVersions(conflict);
  if (rows.some((row) => row.needsChoice && !['mine', 'current'].includes(choices[row.field]))) throw Error('Escolha qual versão manter nos campos alterados pelas duas pessoas.');
  return Object.fromEntries(rows.map((row) => [row.field, (choices[row.field] || row.suggested) === 'mine' ? row.proposed : row.current]));
}
