import { useMemo, useRef, useState } from 'react';
import { ATTENDANCE_LABELS, dateKey, isActiveStudent, sessionEntries } from '../utils/teamProcesses';

import { recordDay } from '../utils/workspaceRecords';

const inputClass = 'rounded-xl border border-white/15 bg-[#111827] px-3 py-2 text-sm text-white';

function AttendanceForm({ students, session, date, onSave, onClose }) {
  const previous = sessionEntries(session);
  const roster = students.filter((student) => (isActiveStudent(student) && (!recordDay(student.joinedAt) || recordDay(student.joinedAt) <= date)) || previous[student.id]);
  const [entries, setEntries] = useState({});
  const entryFor = (id) => entries[id] || previous[id] || { status: 'present', note: '' };
  const saveRunning = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  return <form className="space-y-4" onSubmit={async (event) => { event.preventDefault(); if (saveRunning.current) return; saveRunning.current = true; setBusy(true); setError(''); try { const saved = await onSave({ date, entries: Object.fromEntries(roster.map((student) => [student.id, entryFor(student.id)])), existingId: session?.id }); if (saved !== false) onClose(); } catch (issue) { setError(issue.message); } finally { saveRunning.current = false; setBusy(false); } }}>
    <p className="text-sm text-slate-400">{session ? 'Corrigir chamada existente' : 'Registrar nova chamada'}. Atraso conta como presença; falta justificada não reduz o percentual de frequência.</p>
    <div className="max-h-[45vh] space-y-2 overflow-y-auto">{roster.map((student) => { const entry = entryFor(student.id); return <div key={student.id} className="grid gap-2 rounded-2xl border border-white/10 p-3 sm:grid-cols-[1fr_170px_1fr]"><span className="self-center text-sm font-bold text-white">{student.name}{!isActiveStudent(student) && ' (inativo)'}</span><select aria-label={`Presença de ${student.name}`} disabled={busy} className={inputClass} value={entry.status} onChange={(event) => setEntries({ ...entries, [student.id]: { ...entry, status: event.target.value } })}>{Object.entries(ATTENDANCE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><input aria-label={`Observação de ${student.name}`} disabled={busy} className={inputClass} placeholder="Motivo ou observação" maxLength={300} required={entry.status === 'excused'} value={entry.note} onChange={(event) => setEntries({ ...entries, [student.id]: { ...entry, note: event.target.value } })} /></div>; })}</div>
    {error && <p role="alert" className="text-sm text-red-200">{error}</p>}
    <button disabled={busy || !roster.length} className="rounded-full bg-emerald-400 px-5 py-3 font-bold text-slate-950 disabled:opacity-50">{busy ? 'Salvando…' : session ? 'Salvar correção' : 'Confirmar chamada'}</button>
  </form>;
}

export default function AttendancePanel({ students, sessions, onSave, onClose }) {
  const [date, setDate] = useState(dateKey(new Date()));
  const [start, setStart] = useState(`${date.slice(0, 7)}-01`);
  const [end, setEnd] = useState(date);
  const session = sessions.find((item) => item.date === date);
  const summary = useMemo(() => students.filter(isActiveStudent).map((student) => {
    const statuses = sessions.filter((item) => item.date >= start && item.date <= end).map((item) => sessionEntries(item)[student.id]?.status).filter(Boolean);
    const count = (status) => statuses.filter((value) => value === status).length;
    return { student, present: count('present'), late: count('late'), absent: count('absent'), excused: count('excused') };
  }), [students, sessions, start, end]);
  return <section className="h-full space-y-5 overflow-y-auto p-5 custom-scrollbar md:p-7"><h2 className="text-2xl font-black text-white">Chamada e frequência</h2>
    <label className="flex flex-wrap items-center gap-3 text-sm text-slate-300">Data do treino<input type="date" required value={date} onChange={(event) => setDate(event.target.value)} className={inputClass} /></label>
    {date && <AttendanceForm key={date} students={students} session={session} date={date} onSave={onSave} onClose={onClose} />}
    <details className="rounded-2xl border border-white/10 p-4"><summary className="cursor-pointer font-bold text-white">Resumo por período</summary><div className="my-4 flex flex-wrap gap-3 text-sm text-slate-300"><label>De <input aria-label="Início do período" type="date" value={start} onChange={(event) => setStart(event.target.value)} className={inputClass} /></label><label>Até <input aria-label="Fim do período" type="date" value={end} onChange={(event) => setEnd(event.target.value)} className={inputClass} /></label></div><div className="space-y-2">{summary.map(({ student, present, late, absent, excused }) => <p key={student.id} className="rounded-xl bg-white/5 p-3 text-xs text-slate-300"><strong>{student.name}</strong> · {present} presenças · {late} atrasos · {absent} faltas · {excused} justificadas</p>)}</div></details>
  </section>;
}
