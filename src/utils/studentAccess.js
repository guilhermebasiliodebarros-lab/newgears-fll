export const INACTIVE_STUDENT_MESSAGE = 'Seu acesso foi inativado porque você não faz mais parte da equipe New Gears. Se acredita que houve um engano ou deseja retornar, entre em contato com o técnico da equipe.';

export function resolveLegacyStudentLogin(students, username, password) {
  const userClean = username.trim().toLowerCase();
  const passClean = password.trim();
  const student = students.find((item) => item.username && item.username.toLowerCase().trim() === userClean && item.password === passClean);
  if (!student) return { student: null, error: 'Usuário ou senha incorretos.' };
  if (student.status === 'inactive') return { student: null, error: INACTIVE_STUDENT_MESSAGE };
  return { student, error: '' };
}
