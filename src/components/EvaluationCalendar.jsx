import { useState } from 'react';

const STATUS = {
  complete: { label: 'Completa', tone: 'border-emerald-300/25 bg-emerald-300/10 text-emerald-100' },
  partial: { label: 'Incompleta', tone: 'border-amber-300/30 bg-amber-300/10 text-amber-100' },
  empty: { label: 'Sem avaliação', tone: 'border-rose-300/25 bg-rose-300/10 text-rose-100' },
  paused: { label: 'Pausa', tone: 'border-white/10 bg-white/5 text-gray-400' },
};

export default function EvaluationCalendar({ weeks, selectedWeekId, month, onMonthChange, onSelectWeek, disabled = false }) {
  const [onlyPending, setOnlyPending] = useState(false);
  const pending = weeks.filter((week) => week.pending.length);
  const visible = weeks.filter((week) => (!month || week.id.startsWith(month)) && (!onlyPending || week.pending.length));
  return <details className="rounded-2xl border border-white/10 bg-[#111722] p-4 md:p-5" open>
    <summary className="cursor-pointer text-base font-black text-white">Calendário de avaliações · {pending.length} semana(s) com pendências</summary>
    <p className="mt-3 text-xs leading-relaxed text-gray-400">Consulte as semanas desde o início da temporada. Os totais consideram os integrantes ativos que já haviam entrado na equipe em cada período; semanas de pausa ficam fora das pendências.</p>
    <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-300">
      <label>Mês <input type="month" aria-label="Mês do calendário de avaliações" value={month} onChange={(event) => onMonthChange(event.target.value)} className="ml-2 rounded-lg border border-white/15 bg-black/20 p-2 text-white [color-scheme:dark]" /></label>
      <button type="button" onClick={() => onMonthChange('')} className="rounded-lg border border-white/15 px-3 py-2">Toda a temporada</button>
      <label className="flex items-center gap-2"><input type="checkbox" checked={onlyPending} onChange={(event) => setOnlyPending(event.target.checked)} />Somente semanas com pendências</label>
    </div>
    <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">{visible.map((week) => <button key={week.id} type="button" disabled={disabled} aria-pressed={week.id === selectedWeekId} onClick={() => onSelectWeek(week.id)} className={`rounded-xl border p-3 text-left disabled:cursor-wait disabled:opacity-60 ${STATUS[week.status].tone} ${week.id === selectedWeekId ? 'ring-2 ring-white/60' : ''}`}>
      <span className="block text-xs font-black">{week.label}</span><span className="mt-2 block text-[10px] font-bold">{STATUS[week.status].label} · {week.completeCount}/{week.total} avaliados</span>
      {week.pending.length ? <span className="mt-2 block text-[10px] leading-relaxed">Faltam: {week.pending.map((item) => item.name || 'Aluno').join(', ')}</span> : null}
    </button>)}</div>
    {!visible.length ? <p className="mt-4 text-sm text-gray-400">Nenhuma semana neste filtro.</p> : null}
  </details>;
}
