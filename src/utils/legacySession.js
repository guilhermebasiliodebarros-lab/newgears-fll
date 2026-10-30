// Legacy sessions are a convenience for the UI, never proof of authorization.
// Keep only identity fields; student records may contain passwords and private data.
export function legacySessionIdentity(user) {
  if (!user || typeof user !== 'object') return null;
  const fields = (value) => Object.fromEntries(['id', 'uid', 'type', 'name', 'username', 'studentId'].filter((key) => typeof value?.[key] === 'string').map((key) => [key, value[key]]));
  return { ...fields(user), ...(user.data ? { data: fields(user.data) } : {}) };
}
