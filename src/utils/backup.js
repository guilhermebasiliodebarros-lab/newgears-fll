const SECRET_FIELDS = /^(password|pass|apiKey|accessToken|refreshToken|idToken|privateKey|secret|serviceRoleKey)$/i;
export function backupValue(value) {
  if (value === null || value === undefined) return value ?? null;
  if (value instanceof Date) return { $type: 'date', value: value.toISOString() };
  if (typeof value?.toDate === 'function' && Number.isFinite(value.seconds)) return { $type: 'timestamp', seconds: value.seconds, nanoseconds: value.nanoseconds || 0 };
  if (value?.type === 'document' && typeof value.path === 'string') return { $type: 'reference', path: value.path };
  if (typeof value?.latitude === 'number' && typeof value.longitude === 'number') return { $type: 'geopoint', latitude: value.latitude, longitude: value.longitude };
  if (typeof value?.toBase64 === 'function') return { $type: 'bytes', value: value.toBase64() };
  if (Array.isArray(value)) return value.map(backupValue);
  if (typeof value === 'object') return Object.fromEntries(Object.entries(value).filter(([key]) => !SECRET_FIELDS.test(key)).map(([key, entry]) => [key, backupValue(entry)]));
  return value;
}

const crcTable = Array.from({ length: 256 }, (_, index) => { let crc = index; for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0); return crc >>> 0; });
export function crc32(bytes) { let crc = 0xffffffff; for (const byte of bytes) crc = crcTable[(crc ^ byte) & 255] ^ (crc >>> 8); return (crc ^ 0xffffffff) >>> 0; }
export function makeZip(files) {
  if (files.length > 65535) throw new Error('Há arquivos demais para este backup. Exporte uma temporada por vez.');
  const encoder = new TextEncoder(); const local = []; const central = []; let offset = 0; let directorySize = 0;
  for (const file of files) {
    if (!file.name || file.name.split('/').some((part) => part === '..') || file.name.startsWith('/')) throw new Error('Nome de arquivo inválido no backup.');
    const name = encoder.encode(file.name); const bytes = file.bytes; const checksum = crc32(bytes);
    if (offset + bytes.length + name.length + 30 > 0xffffffff) throw new Error('Backup muito grande. Exporte uma temporada por vez.');
    const header = new Uint8Array(30); const h = new DataView(header.buffer);
    h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(12, 33, true); h.setUint32(14, checksum, true); h.setUint32(18, bytes.length, true); h.setUint32(22, bytes.length, true); h.setUint16(26, name.length, true);
    local.push(header, name, bytes);
    const record = new Uint8Array(46); const c = new DataView(record.buffer);
    c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true); c.setUint16(14, 33, true); c.setUint32(16, checksum, true); c.setUint32(20, bytes.length, true); c.setUint32(24, bytes.length, true); c.setUint16(28, name.length, true); c.setUint32(42, offset, true);
    central.push(record, name); directorySize += record.length + name.length; offset += header.length + name.length + bytes.length;
  }
  const end = new Uint8Array(22); const view = new DataView(end.buffer);
  view.setUint32(0, 0x06054b50, true); view.setUint16(8, files.length, true); view.setUint16(10, files.length, true); view.setUint32(12, directorySize, true); view.setUint32(16, offset, true);
  return new Blob([...local, ...central, end], { type: 'application/zip' });
}
export async function createBackupArchive({ documents, files = [], scope, startedAt, filesIncluded, omissions = [] }) {
  const encoder = new TextEncoder();
  const dataset = { format: 'newgears-backup', version: 1, scope, startedAt, completedAt: new Date().toISOString(), documents: documents.map((entry) => ({ path: entry.path, data: backupValue(entry.data) })) };
  const allFiles = [{ name: 'dados.json', bytes: encoder.encode(JSON.stringify(dataset, null, 2)) }, ...files];
  const manifest = { format: dataset.format, version: 1, scope, createdAt: dataset.completedAt, documentCount: dataset.documents.length, reportFilesIncluded: filesIncluded, teamPdfIncluded: files.some((file) => file.name === 'relatorio-da-equipe.pdf'), omissions, excluded: ['Senhas e credenciais', 'Contas de autenticação', 'Filas privadas de e-mail', 'Estados individuais de leitura', 'Arquivos de links externos fora dos relatórios'], files: [] };
  for (const file of allFiles) {
    const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', file.bytes));
    manifest.files.push({ name: file.name, size: file.bytes.length, sha256: [...hash].map((byte) => byte.toString(16).padStart(2, '0')).join('') });
  }
  return makeZip([...allFiles, { name: 'manifesto.json', bytes: encoder.encode(JSON.stringify(manifest, null, 2)) }]);
}
