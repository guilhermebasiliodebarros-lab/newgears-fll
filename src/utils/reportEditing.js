export const REPORT_EDIT_FIELDS = ['title', 'description', 'week', 'reportDate', 'linkedTaskIds'];
export function reportEditSnapshot(report) {
  return { title: report?.title || '', description: report?.description || '', week: report?.week || '', reportDate: report?.reportDate || '', linkedTaskIds: report?.linkedTaskIds || [], revision: Number.isSafeInteger(report?.revision) ? report.revision : 0,
    document: report?.fileName ? { fileName: report.fileName, fileSize: report.fileSize || 0, fileRevision: report.fileRevision || 0 } : null };
}
export function reportEditConflict(expected, currentRecord, details, file) {
  return { expected, current: reportEditSnapshot(currentRecord), proposed: { ...details, document: file ? { fileName: file.name, fileSize: file.size, fileRevision: 'local-upload' } : expected.document }, fields: [...REPORT_EDIT_FIELDS, 'document'] };
}
