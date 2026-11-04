export const ONBOARDING_STEPS = ['station', 'tasks', 'learning', 'deliveries'];
export const onboardingKey = (studentId, seasonId) => `newgears_onboarding_v1:${JSON.stringify([studentId, seasonId || 'legacy'])}`;
export function readOnboarding(storage, key) {
  try {
    const value = JSON.parse(storage.getItem(key));
    return { completed: value?.version === 1 && Array.isArray(value.completed) ? [...new Set(value.completed.filter((step) => ONBOARDING_STEPS.includes(step)))] : [] };
  } catch { return { completed: [] }; }
}
export function writeOnboardingStep(storage, key, step, checked, fallback = []) {
  if (!ONBOARDING_STEPS.includes(step)) throw Error('Etapa de orientação inválida.');
  const completed = new Set([...readOnboarding(storage, key).completed, ...fallback.filter((item) => ONBOARDING_STEPS.includes(item))]);
  if (checked) completed.add(step); else completed.delete(step);
  const next = { version: 1, completed: [...completed], updatedAt: new Date().toISOString() };
  storage.setItem(key, JSON.stringify(next));
  return next;
}
