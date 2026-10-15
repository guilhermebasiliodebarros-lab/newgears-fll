export const MAX_REPORT_FILE_SIZE = 10 * 1024 * 1024;
export const REPORT_FILE_TYPES = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

export function reportFileExtension(name = '') {
  return name.split('.').pop().toLowerCase();
}

export function validateReportFile(file) {
  if (!file) throw new Error('Selecione um arquivo PDF, DOC ou DOCX.');
  const extension = reportFileExtension(file.name);
  if (!REPORT_FILE_TYPES[extension]) throw new Error('Formato não permitido. Use PDF, DOC ou DOCX.');
  if (!file.size || file.size > MAX_REPORT_FILE_SIZE) throw new Error('O arquivo deve ter conteúdo e no máximo 10 MB.');
  if (file.type && file.type !== 'application/octet-stream' && file.type !== REPORT_FILE_TYPES[extension]) {
    throw new Error('O tipo do arquivo não corresponde à extensão.');
  }
  return extension;
}

// Verificação do conteúdo no servidor, independente do nome/MIME enviados pelo navegador.
export function validateReportBytes(bytes, extension) {
  const startsWith = (signature) => signature.every((byte, index) => bytes[index] === byte);
  if (extension === 'pdf' && startsWith([37, 80, 68, 70, 45])) return;
  if (extension === 'doc' && bytes.length >= 512 && startsWith([208, 207, 17, 224, 161, 177, 26, 225])) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const shift = view.getUint16(30, true);
    if ([9, 12].includes(shift)) {
      const sectorSize = 2 ** shift;
      let sector = view.getInt32(48, true);
      const visited = new Set();
      while (sector >= 0 && !visited.has(sector) && visited.size < 32) {
        visited.add(sector);
        const offset = (sector + 1) * sectorSize;
        if (offset + sectorSize > bytes.length) break;
        for (let entry = offset; entry < offset + sectorSize; entry += 128) {
          const nameLength = view.getUint16(entry + 64, true);
          if (nameLength >= 2 && nameLength <= 64 && bytes[entry + 66] === 2) {
            const name = new TextDecoder('utf-16le').decode(bytes.subarray(entry, entry + nameLength - 2));
            if (name === 'WordDocument') return;
          }
        }
        const fatIndex = Math.floor(sector / (sectorSize / 4));
        if (fatIndex >= 109) break;
        const fatSector = view.getInt32(76 + fatIndex * 4, true);
        const fatOffset = (fatSector + 1) * sectorSize + (sector % (sectorSize / 4)) * 4;
        if (fatSector < 0 || fatOffset + 4 > bytes.length) break;
        sector = view.getInt32(fatOffset, true);
      }
    }
  }
  if (extension === 'docx' && startsWith([80, 75, 3, 4])) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    // Lê apenas o diretório central ZIP; não descompacta conteúdo fornecido pelo usuário.
    let end = -1;
    for (let offset = bytes.length - 22; offset >= Math.max(0, bytes.length - 65557); offset -= 1) {
      if (view.getUint32(offset, true) === 0x06054b50 && offset + 22 + view.getUint16(offset + 20, true) === bytes.length) {
        end = offset;
        break;
      }
    }
    if (end >= 0 && view.getUint16(end + 4, true) === 0 && view.getUint16(end + 6, true) === 0) {
      const count = view.getUint16(end + 10, true);
      let offset = view.getUint32(end + 16, true);
      const centralEnd = offset + view.getUint32(end + 12, true);
      const names = new Set();
      if (count > 0 && count <= 4096 && centralEnd <= end) {
        for (let entry = 0; entry < count; entry += 1) {
          if (offset + 46 > centralEnd || view.getUint32(offset, true) !== 0x02014b50) break;
          const nameLength = view.getUint16(offset + 28, true);
          const next = offset + 46 + nameLength + view.getUint16(offset + 30, true) + view.getUint16(offset + 32, true);
          if (next > centralEnd || (view.getUint16(offset + 8, true) & 1)) break;
          names.add(new TextDecoder().decode(bytes.subarray(offset + 46, offset + 46 + nameLength)));
          offset = next;
        }
        if (names.size === count && names.has('[Content_Types].xml') && names.has('word/document.xml') && ![...names].some((name) => /vbaProject\.bin$/i.test(name))) return;
      }
    }
  }
  throw new Error('O conteúdo não corresponde a um PDF, DOC ou DOCX válido.');
}

export function validateReportDetails(input) {
  const title = `${input.title || ''}`.trim();
  const description = `${input.description || ''}`.trim();
  const week = `${input.week || ''}`.trim();
  const reportDate = `${input.reportDate || ''}`;
  if (!title || title.length > 160) throw new Error('Informe um título de até 160 caracteres.');
  if (!week || week.length > 80) throw new Error('Informe a semana (até 80 caracteres).');
  if (description.length > 4000) throw new Error('O resumo deve ter no máximo 4.000 caracteres.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(reportDate) || !Number.isFinite(Date.parse(`${reportDate}T12:00:00Z`)) || new Date(`${reportDate}T12:00:00Z`).toISOString().slice(0, 10) !== reportDate) throw new Error('Informe uma data válida.');
  return { title, description, week, reportDate, weekStart: weekStartFor(reportDate) };
}

export function localReportDate() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

export function weekStartFor(date) {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() - ((value.getUTCDay() + 6) % 7));
  return value.toISOString().slice(0, 10);
}

export const formatReportSize = (bytes) => bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`;
export const canManageReport = (user, report) => Boolean(user?.uid && (user.type === 'admin' || report.userId === user.uid));

export function filterWeeklyReports(reports, filters) {
  const search = (value) => `${value || ''}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const needle = search(filters.search).trim();
  return reports.filter((report) => {
    const date = report.reportDate || '';
    return (!needle || search([report.studentName, report.title, report.description].join(' ')).includes(needle))
      && (!filters.student || report.userId === filters.student)
      && (!filters.week || report.week === filters.week)
      && (!filters.month || date.slice(5, 7) === filters.month)
      && (!filters.year || date.slice(0, 4) === filters.year);
  });
}
