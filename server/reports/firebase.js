export class ApiError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

const encoder = new TextEncoder();
const accessTokens = new Map();
let publicKeys = { expires: 0, keys: [] };
const base64url = (bytes) => btoa(String.fromCharCode(...bytes)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
const encodeJson = (value) => base64url(encoder.encode(JSON.stringify(value)));
const decodeSegment = (value) => Uint8Array.from(atob(value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=')), (char) => char.charCodeAt(0));

export async function verifyFirebaseToken(token, projectId) {
  try {
    if (typeof token !== 'string' || token.length > 10000) throw new Error('JWT');
    const segments = token.split('.');
    if (segments.length !== 3) throw new Error('JWT');
    const header = JSON.parse(new TextDecoder().decode(decodeSegment(segments[0])));
    const claims = JSON.parse(new TextDecoder().decode(decodeSegment(segments[1])));
    const now = Math.floor(Date.now() / 1000);
    if (header.alg !== 'RS256' || typeof header.kid !== 'string'
      || claims.aud !== projectId || claims.iss !== `https://securetoken.google.com/${projectId}`
      || typeof claims.sub !== 'string' || !claims.sub || claims.sub.length > 128 || claims.sub.includes('/')
      || !Number.isFinite(claims.exp) || claims.exp <= now
      || !Number.isFinite(claims.iat) || claims.iat > now
      || !Number.isFinite(claims.auth_time) || claims.auth_time > now
      || claims.firebase?.sign_in_provider === 'anonymous') throw new Error('Claims');
    if (publicKeys.expires < Date.now() || !publicKeys.keys.some((key) => key.kid === header.kid)) {
      const response = await fetch('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com');
      if (!response.ok) throw new ApiError(503, 'Não foi possível validar a sessão agora. Tente novamente.');
      const data = await response.json();
      const age = Number(response.headers.get('cache-control')?.match(/max-age=(\d+)/)?.[1] || 300);
      publicKeys = { keys: data.keys || [], expires: Date.now() + age * 1000 };
    }
    const jwk = publicKeys.keys.find((key) => key.kid === header.kid);
    if (!jwk) throw new Error('Key');
    const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, decodeSegment(segments[2]), encoder.encode(`${segments[0]}.${segments[1]}`));
    if (!valid) throw new Error('Signature');
    return claims;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(401, 'Sessão inválida ou expirada. Entre novamente.');
  }
}

export async function googleAccessToken(env) {
  const cached = accessTokens.get(env.FIREBASE_CLIENT_EMAIL);
  if (cached && cached.expires > Date.now() + 60000) return cached.token;
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${encodeJson({ alg: 'RS256', typ: 'JWT' })}.${encodeJson({
    iss: env.FIREBASE_CLIENT_EMAIL,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600,
  })}`;
  const pem = env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/-----[^-]+-----/g, '').replace(/\s/g, '');
  const key = await crypto.subtle.importKey('pkcs8', Uint8Array.from(atob(pem), (char) => char.charCodeAt(0)), { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const signature = new Uint8Array(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, encoder.encode(unsigned)));
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${base64url(signature)}` }),
  });
  if (!response.ok) throw new ApiError(503, 'A autenticação do servidor precisa ser configurada pelo técnico.');
  const data = await response.json();
  accessTokens.set(env.FIREBASE_CLIENT_EMAIL, { token: data.access_token, expires: Date.now() + data.expires_in * 1000 });
  return data.access_token;
}

export function firestoreValue(value) {
  if (value === null) return { nullValue: null };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  if (typeof value === 'string') return { stringValue: value };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(firestoreValue) } };
  return { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, firestoreValue(entry)])) } };
}

function decodeValue(value) {
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('timestampValue' in value) return value.timestampValue;
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(decodeValue);
  if ('mapValue' in value) return decodeFields(value.mapValue.fields || {});
  return null;
}
const decodeFields = (fields) => Object.fromEntries(Object.entries(fields || {}).map(([key, value]) => [key, decodeValue(value)]));
export const decodeDocument = (document) => ({ ...decodeFields(document.fields), id: document.name.split('/').pop(), _updateTime: document.updateTime });

export async function firestoreRequest(env, path, options = {}) {
  const token = await googleAccessToken(env);
  const response = await fetch(`https://firestore.googleapis.com/v1/projects/${encodeURIComponent(env.FIREBASE_PROJECT_ID)}/databases/(default)/documents/${path}`, {
    ...options, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...options.headers },
  });
  if (response.status === 404) return null;
  if ([409, 412].includes(response.status)) throw new ApiError(409, 'Este registro foi alterado. Atualize a página e tente novamente.');
  if (!response.ok) {
    console.error('Firestore Reports API', response.status);
    throw new ApiError(503, 'Não foi possível acessar os relatórios no banco de dados.');
  }
  return response.status === 204 ? {} : response.json();
}

export async function getRecord(env, path) {
  const data = await firestoreRequest(env, path);
  return data ? decodeDocument(data) : null;
}

export async function writeRecord(env, path, data, { create = false, updateTime, merge = false } = {}) {
  const fields = Object.fromEntries(Object.entries(data).filter(([key, value]) => !key.startsWith('_') && key !== 'id' && value !== undefined).map(([key, value]) => [key, firestoreValue(value)]));
  const params = new URLSearchParams();
  if (merge) Object.keys(fields).forEach((field) => params.append('updateMask.fieldPaths', field));
  if (create) params.set('currentDocument.exists', 'false');
  else if (merge && !updateTime) params.set('currentDocument.exists', 'true');
  if (updateTime) params.set('currentDocument.updateTime', updateTime);
  const result = await firestoreRequest(env, `${path}${params.size ? `?${params}` : ''}`, { method: 'PATCH', body: JSON.stringify({ fields }) });
  if (!result) throw new ApiError(404, 'Registro não encontrado.');
  return result;
}

export async function listRecords(env, collectionPath) {
  const records = [];
  let pageToken = '';
  do {
    const data = await firestoreRequest(env, `${collectionPath}?${new URLSearchParams({ pageSize: '100', ...(pageToken ? { pageToken } : {}) })}`);
    records.push(...(data?.documents || []).map(decodeDocument));
    pageToken = data?.nextPageToken || '';
    if (records.length > 500) throw new ApiError(400, 'Limite de 500 destinatários excedido.');
  } while (pageToken);
  return records;
}

export async function authenticate(request, env) {
  if (!env.FIREBASE_PROJECT_ID || !env.FIREBASE_CLIENT_EMAIL || !env.FIREBASE_PRIVATE_KEY) throw new ApiError(503, 'O técnico precisa concluir a configuração dos relatórios.');
  const bearer = request.headers.get('Authorization')?.match(/^Bearer (\S+)$/)?.[1];
  if (!bearer) throw new ApiError(401, 'Entre no sistema para acessar os relatórios.');
  const claims = await verifyFirebaseToken(bearer, env.FIREBASE_PROJECT_ID);
  const token = await googleAccessToken(env);
  // Verifica também conta desativada e tokens revogados, além da assinatura JWT.
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/projects/${encodeURIComponent(env.FIREBASE_PROJECT_ID)}/accounts:lookup`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ localId: [claims.sub] }),
  });
  if (!response.ok) throw new ApiError(503, 'O servidor não conseguiu validar a conta Firebase.');
  const account = (await response.json()).users?.[0];
  if (!account || account.disabled || claims.auth_time < Number(account.validSince || 0)) throw new ApiError(401, 'Sua sessão foi encerrada. Entre novamente.');
  const member = await getRecord(env, `weeklyReportMembers/${encodeURIComponent(claims.sub)}`);
  if (!member || member.active !== true || !['admin', 'student'].includes(member.role)
    || !account.email || member.email?.toLowerCase() !== account.email.toLowerCase()
    || !member.name || (member.role === 'student' && !member.studentId)) throw new ApiError(403, 'Sua conta ainda não está vinculada a um integrante ativo da equipe. Peça ao técnico para conferir o cadastro.');
  return { uid: claims.sub, role: member.role, name: member.name, email: account.email, studentId: member.studentId || '' };
}
