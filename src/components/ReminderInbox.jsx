import { useEffect, useMemo, useState } from 'react';
import { Bell } from 'lucide-react';
import { loadReminderInbox } from '../services/weeklyReports';
import { buildReminders, DEFAULT_REMINDERS } from '../utils/reminders';
import { localDateOf } from '../utils/evolution';

export default function ReminderInbox({ user, seasonId, tasks, students, authenticated = false, reportsVersion = '', onOpen }) {
  const [remote, setRemote] = useState({}); const [now, setNow] = useState(() => Date.now());
  const identity = `${authenticated ? user?.uid || '' : 'legacy'}:${user?.type || ''}:${seasonId}`;
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 60000); return () => clearInterval(timer); }, []);
  useEffect(() => {
    if (!authenticated || !user?.uid) return undefined;
    let active = true;
    const refresh = async () => { if (document.hidden) return; try { const data = await loadReminderInbox(); if (active) setRemote({ identity, ...data }); } catch (issue) { if (active) setRemote({ identity, error: issue.message }); } };
    void refresh(); const timer = setInterval(refresh, 5 * 60000);
    const visible = () => { if (!document.hidden) void refresh(); }; document.addEventListener('visibilitychange', visible);
    return () => { active = false; clearInterval(timer); document.removeEventListener('visibilitychange', visible); };
  }, [authenticated, user?.uid, identity, reportsVersion]);
  const state = remote.identity === identity && (!remote.seasonId || remote.seasonId === seasonId) ? remote : {};
  const today = localDateOf(now);
  const items = useMemo(() => [...buildReminders({ user, students, tasks, today, config: { ...(state.config || DEFAULT_REMINDERS), reports: false } }), ...(state.items || []).filter((item) => item.kind === 'report')], [user, students, tasks, today, state.config, state.items]);
  if (!items.length && !state.error) return null;
  return <details className="mx-auto mb-4 max-w-[1536px] rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] px-4 py-3 text-sm text-slate-200"><summary className="cursor-pointer font-bold"><Bell size={15} className="mr-2 inline" />{items.length} lembrete(s) para acompanhar</summary>{state.error && <p role="status" className="mt-3 text-xs text-amber-200">Os avisos de relatórios não puderam ser atualizados. {state.error}</p>}<div className="mt-3 max-h-72 space-y-2 overflow-y-auto">{items.map((item) => <button key={item.id} onClick={() => onOpen(item.tab)} className="block w-full rounded-xl border border-white/10 bg-black/15 p-3 text-left hover:bg-white/5"><span className="block text-xs font-bold text-white">{item.title}</span><span className="mt-1 block text-xs text-slate-400">{item.detail}</span></button>)}</div></details>;
}
