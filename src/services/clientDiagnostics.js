import { diagnosticArea, diagnosticCode, diagnosticFrames, validateDiagnostic } from '../utils/clientDiagnostics.js';

const STORAGE_KEY = 'newgears_diagnostics_v1';
const LIMIT = 40;
let records = [];
let installed = false;
let timer;
let sending = false;
let context = { area: 'startup', role: 'visitor' };
const listeners = new Set();
const attempts = new Map();
const build = import.meta.env?.VITE_APP_BUILD || 'local';
const notify = () => {
  const activeIds = new Set(records.map((item) => item.id));
  for (const id of attempts.keys()) if (!activeIds.has(id)) attempts.delete(id);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); } catch { /* Capture remains available in memory. */ }
  listeners.forEach((listener) => listener());
};
export const diagnosticsSnapshot = () => records;
export const subscribeDiagnostics = (listener) => { listeners.add(listener); return () => listeners.delete(listener); };
export const setDiagnosticsContext = (next) => { context = { area: diagnosticArea(next.area), role: ['technical', 'student'].includes(next.role) ? next.role : 'visitor' }; };

export function reportClientIssue(error, options = {}) {
  try {
    const agent = navigator.userAgent;
    const candidate = validateDiagnostic({ id: crypto.randomUUID(), area: diagnosticArea(options.area || context.area), role: context.role,
      code: diagnosticCode(error, options.kind), frames: diagnosticFrames(error?.stack), build,
      count: 1, occurredAt: new Date().toISOString(), device: innerWidth < 768 ? 'mobile' : 'desktop',
      browser: /Edg\//.test(agent) ? 'Edge' : /Firefox\//.test(agent) ? 'Firefox' : /Chrome\//.test(agent) ? 'Chrome' : /Safari\//.test(agent) ? 'Safari' : 'Other', online: navigator.onLine });
    if (!candidate) return;
    const previous = records.find((item) => item.fingerprint === candidate.fingerprint && Date.now() - Date.parse(item.occurredAt) < 60000);
    if (previous) {
      records = records.map((item) => item.id === previous.id ? { ...item, count: Math.min(10000, item.count + 1), sent: false } : item);
    } else records = [{ ...candidate, sent: false }, ...records].slice(0, LIMIT);
    notify();
    clearTimeout(timer); timer = setTimeout(() => { void flushDiagnostics(); }, 800);
  } catch { /* Monitoring must never interrupt the application. */ }
}

export async function flushDiagnostics() {
  if (sending || !navigator.onLine) return;
  const pending = records.filter((item) => !item.sent && (attempts.get(item.id) || 0) < 3).slice(0, 5);
  if (!pending.length) return;
  sending = true;
  try {
    for (const item of pending) {
      attempts.set(item.id, (attempts.get(item.id) || 0) + 1);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      try {
        const response = await fetch('/api/diagnostics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(validateDiagnostic(item)), signal: controller.signal, keepalive: true });
        if (!response.ok || !(response.headers.get('content-type') || '').includes('application/json')) continue;
        const body = await response.json();
        if (body.accepted === true) records = records.map((record) => record.id === item.id && record.count === item.count ? { ...record, sent: true } : record);
      } catch { /* Retry on reconnect or from the stability panel. */ }
      finally { clearTimeout(timeout); }
    }
    notify();
  } finally {
    sending = false;
    if (records.some((item) => !item.sent && (attempts.get(item.id) || 0) < 3)) { clearTimeout(timer); timer = setTimeout(() => { void flushDiagnostics(); }, 15000); }
  }
}

export function retryDiagnostics() { attempts.clear(); return flushDiagnostics(); }
export function clearDiagnostics() { records = []; attempts.clear(); notify(); }

export function installDiagnostics() {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved)) records = saved.slice(0, LIMIT).map((item) => { const valid = validateDiagnostic(item); return valid ? { ...valid, sent: item.sent === true } : null; }).filter(Boolean);
  } catch { /* Invalid browser storage does not block startup. */ }
  window.addEventListener('error', (event) => {
    if (event.target !== window) {
      if (['SCRIPT', 'LINK'].includes(event.target?.tagName)) reportClientIssue(new Error('Failed to load module script'), { kind: 'module-load' });
      return;
    }
    reportClientIssue(event.error || new Error('runtime'), { kind: 'runtime' });
  }, true);
  window.addEventListener('unhandledrejection', (event) => reportClientIssue(event.reason, { kind: 'runtime' }));
  window.addEventListener('online', () => { attempts.clear(); void flushDiagnostics(); });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') void flushDiagnostics(); });
  timer = setTimeout(() => { void flushDiagnostics(); }, 2000);
}
