import { useState } from 'react';

const field = 'w-full rounded-xl border border-white/15 bg-[#111827] px-3 py-2 text-sm text-white';
const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function SeasonPlanningPanel({ config, students, onSave, busy }) {
  const [draft, setDraft] = useState(() => ({ ...config, ...Object.fromEntries(['participantIds', 'captainIds', 'traineeIds'].map((key) => [key, config[key].filter((id) => students.some((student) => student.id === id))])) }));
  const [pauses, setPauses] = useState((config.pauseWeeks || []).join(', '));
  const roleOf = (id) => draft.captainIds.includes(id) ? 'captainIds' : draft.traineeIds.includes(id) ? 'traineeIds' : draft.participantIds.includes(id) ? 'participantIds' : '';
  const setRole = (id, role) => setDraft((current) => ({ ...current, ...Object.fromEntries(['captainIds', 'traineeIds', 'participantIds'].map((key) => [key, [...current[key].filter((value) => value !== id), ...(role === key ? [id] : [])]])) }));
  return <details className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
    <summary className="cursor-pointer font-bold text-white">Configurar planejamento da temporada</summary>
    <form onSubmit={async (event) => { event.preventDefault(); await onSave({ ...draft, pauseWeeks: pauses.split(',').map((date) => date.trim()).filter(Boolean) }); }} className="mt-5 space-y-4 text-sm text-slate-300">
      <div className="grid gap-4 sm:grid-cols-3">
        <label>Início do ciclo<input type="date" required value={draft.startDate} onChange={(event) => setDraft({ ...draft, startDate: event.target.value })} className={field} /></label>
        <label>Semanas de atividade<input type="number" min="1" max="52" required value={draft.totalWeeks} onChange={(event) => setDraft({ ...draft, totalWeeks: Number(event.target.value) })} className={field} /></label>
        <label>Entrega dos relatórios<select value={draft.reportDueDay} onChange={(event) => setDraft({ ...draft, reportDueDay: Number(event.target.value) })} className={field}>{days.map((day, index) => <option key={day} value={index}>{day}</option>)}</select></label>
      </div>
      <fieldset><legend className="mb-2">Dias de treino</legend><div className="flex flex-wrap gap-3">{days.map((day, index) => <label key={day} className="flex gap-2"><input type="checkbox" checked={draft.trainingDays.includes(index)} onChange={(event) => setDraft({ ...draft, trainingDays: event.target.checked ? [...draft.trainingDays, index] : draft.trainingDays.filter((value) => value !== index) })} />{day}</label>)}</div></fieldset>
      <label className="block">Semanas de pausa ou férias<input value={pauses} onChange={(event) => setPauses(event.target.value)} placeholder="2027-07-05, 2027-07-12" className={field} /><span className="mt-1 block text-xs text-slate-400">Informe uma data de cada semana sem atividade, separada por vírgula. Essas semanas não avançam o rodízio.</span></label>
      <div className="grid max-h-72 gap-2 overflow-y-auto sm:grid-cols-2">{students.map((student) => <label key={student.id} className="flex items-center gap-3 rounded-xl bg-black/20 p-3"><span className="min-w-0 flex-1">{student.name}</span><select aria-label={`Papel de ${student.name}`} value={roleOf(student.id)} onChange={(event) => setRole(student.id, event.target.value)} className={`${field} max-w-44`}><option value="participantIds">Rodízio</option><option value="captainIds">Capitã(o) em Gestão</option><option value="traineeIds">Aprendiz</option><option value="">Fora da escala</option></select></label>)}</div>
      <p className="text-xs text-slate-400">Salvar altera as próximas prévias. Para modificar uma semana já aplicada, desfaça primeiro a aplicação.</p>
      <button disabled={busy} className="rounded-full bg-cyan-300 px-5 py-3 font-bold text-slate-950 disabled:opacity-50">{busy ? 'Salvando…' : 'Salvar planejamento'}</button>
    </form>
  </details>;
}
