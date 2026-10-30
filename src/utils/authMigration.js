// Planning only. This module never creates accounts or changes Firestore.
export function planAuthMigration({ students, accounts = [] }) {
  if (!Array.isArray(students) || !Array.isArray(accounts)) throw Error('Informe listas de integrantes e contas.');
  const active = students.filter((student) => student?.status !== 'inactive');
  const ids = new Set(); const emails = new Set(); const uids = new Set();
  const entries = active.map((student) => {
    const studentId = String(student?.id || '').trim();
    if (!studentId || studentId.includes('/') || ids.has(studentId)) throw Error('Há integrantes sem ID válido ou com ID repetido.');
    ids.add(studentId);
    const matches = accounts.filter((account) => account.studentId === studentId);
    if (matches.length > 1) throw Error('Um integrante está vinculado a mais de uma conta no planejamento.');
    const account = matches[0];
    const email = String(account?.email || student.email || '').trim().toLowerCase();
    const uid = String(account?.uid || '').trim();
    if (email && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || emails.has(email))) throw Error('Confira os e-mails: há endereços inválidos ou compartilhados.');
    if (uid && (uid.includes('/') || uid.length > 128 || uids.has(uid))) throw Error('Confira os UIDs: há identificadores inválidos ou repetidos.');
    if (email) emails.add(email); if (uid) uids.add(uid);
    return { studentId, name: String(student.name || ''), email: email || null, uid: uid || null,
      action: !email ? 'confirm-email' : !uid ? 'create-auth-account' : 'verify-and-link',
      member: uid && email ? { path: `weeklyReportMembers/${uid}`, data: { studentId, role: 'student', active: true, name: String(student.name || ''), email } } : null };
  });
  const unmapped = accounts.filter((account) => !ids.has(account.studentId));
  if (unmapped.length) throw Error('Há contas sem integrante ativo correspondente. Revise o arquivo de vínculos.');
  return { version: 1, dryRun: true, readyToActivate: false, legacyAccessPreserved: true, entries,
    pending: ['Criar e testar uma conta técnica separada.', 'Confirmar a identidade e o acesso de cada integrante.', 'Validar todas as regras no emulador antes de publicar.', 'Ativar a flag somente depois de concluir o piloto.'] };
}
