import { validDate } from './teamProcesses.js';

export function countdownState(targetDate, now = Date.now()) {
  if (!targetDate) return { status: 'unset', label: 'Data a definir', units: null };
  if (typeof targetDate === 'string' && /^\d{4}-\d{2}-\d{2}/.test(targetDate) && !validDate(targetDate.slice(0, 10))) return { status: 'unset', label: 'Confira a data', units: null };
  const target = new Date(typeof targetDate === 'string' && targetDate.length === 10 ? `${targetDate}T00:00:00` : targetDate);
  const timestamp = target.getTime();
  if (!Number.isFinite(timestamp)) return { status: 'unset', label: 'Confira a data', units: null };
  const difference = timestamp - now;
  if (difference <= 0) {
    const current = new Date(now);
    const today = target.getFullYear() === current.getFullYear() && target.getMonth() === current.getMonth() && target.getDate() === current.getDate();
    return { status: today ? 'today' : 'past', label: today ? 'É hoje' : 'Data já passou', units: null };
  }
  return { status: 'upcoming', label: '', units: { dias: Math.floor(difference / 86400000), horas: Math.floor(difference / 3600000) % 24, minutos: Math.floor(difference / 60000) % 60, segundos: Math.floor(difference / 1000) % 60 } };
}
