import { useEffect, useMemo, useState } from 'react';
import { loadReportExpectations, saveReportExemption } from '../services/weeklyReports';
import { localReportDate, weekStartFor, buildWeeklyDeliveries } from '../utils/weeklyReports';

export default function WeeklyDeliveryPanel({ students, reports, seasonId, dueDay }) {
  const [week, setWeek] = useState(weekStartFor(localReportDate()));
  const [snapshot, setSnapshot] = useState({ key: '', exemptions: {}, error: '' });
  const [actionError, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [editing, setEditing] = useState('');
  const [reason, setReason] = useState('');
  const periodKey = `${seasonId}:${week}`;
  const [retry, setRetry] = useState(0);
  const requestKey = `${periodKey}:${retry}`;
  const loading = snapshot.key !== requestKey;
  const error = loading ? '' : snapshot.error || actionError;
  const exemptions = useMemo(() => snapshot.key === requestKey ? snapshot.exemptions : {}, [snapshot, requestKey]);
  useEffect(() => {
    let active = true;
    loadReportExpectations(seasonId, week).then((data) => { if (active) setSnapshot({ key: requestKey, exemptions: data.exemptions, error: '' }); }).catch((issue) => { if (active) setSnapshot({ key: requestKey, exemptions: {}, error: issue.message }); });
    return () => { active = false; };
  }, [seasonId, week, requestKey]);
  const deliveries = useMemo(() => buildWeeklyDeliveries({ students, reports, weekStart: week, dueDay, exemptions }), [students, reports, week, dueDay, exemptions]);
  const save = async (studentId, exempt) => {
    setBusy(studentId); setError('');
    try { const data = await saveReportExemption({ seasonId, weekStart: week, studentId, exempt, reason }); setSnapshot({ key: requestKey, exemptions: data.exemptions, error: '' }); setEditing(''); setReason(''); }
    catch (issue) { setError(issue.message); }
    finally { setBusy(''); }
  };
  return <section className="rounded-[24px] border border-cyan-300/15 bg-[#121722] p-5 text-slate-300">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold text-white">Entregas esperadas da semana</h3><p className="mt-1 text-xs text-slate-400">Acompanhe envios e dispensas. O prazo segue o planejamento da temporada.</p></div><label className="text-xs">Semana de <input type="date" disabled={Boolean(busy)} value={week} onChange={(event) => { if (event.target.value) { setError(''); setWeek(weekStartFor(event.target.value)); setEditing(''); } }} className="rounded-xl border border-white/15 bg-black/20 p-2 text-white" /></label></div>
    {error && <p role="alert" className="mt-3 text-sm text-red-200">{error} <button onClick={() => { setError(''); setRetry((value) => value + 1); }} className="underline">Tentar novamente</button></p>}
    {loading ? <p role="status" className="mt-4 text-sm">Carregando dispensas e entregas…</p> : !error && <><p className="my-4 text-sm">{deliveries.filter((row) => row.status === 'Entregue').length}/{deliveries.length} entregues · {deliveries.filter((row) => row.status === 'Atrasado').length} atrasados · {deliveries.filter((row) => row.status === 'Dispensado').length} dispensados</p><div className="max-h-80 space-y-2 overflow-y-auto">{deliveries.map(({ student, report, exemption, dueDate, status }) => <div key={student.id} className="rounded-xl border border-white/10 p-3"><div className="flex flex-wrap items-center justify-between gap-2"><div><strong className="text-sm text-white">{student.name}</strong><p className="text-xs text-slate-400">Prazo: {dueDate.split('-').reverse().join('/')} {exemption && `· ${exemption.reason}`}</p></div><span className={`text-xs font-bold ${status === 'Atrasado' ? 'text-amber-200' : status === 'Entregue' ? 'text-emerald-200' : 'text-slate-300'}`}>{status}</span>{!report && <button disabled={Boolean(busy)} onClick={() => { if (exemption) save(student.id, false); else { setEditing(student.id); setReason(''); } }} className="rounded-full border border-white/15 px-3 py-2 text-xs disabled:opacity-50">{busy === student.id ? 'Salvando…' : exemption ? 'Remover dispensa' : 'Dispensar'}</button>}</div>{editing === student.id && <form className="mt-3 flex flex-wrap gap-2" onSubmit={(event) => { event.preventDefault(); save(student.id, true); }}><input required maxLength={300} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Motivo da dispensa" aria-label="Motivo da dispensa" className="min-w-0 flex-1 rounded-xl border border-white/15 bg-black/20 p-2 text-sm" /><button disabled={Boolean(busy)} className="rounded-full bg-cyan-300 px-3 py-2 text-xs font-bold text-slate-950">Confirmar</button></form>}</div>)}</div></>}
  </section>;
}
