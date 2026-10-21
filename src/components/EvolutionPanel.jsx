import { useMemo, useState } from 'react';
import { buildEvolution, shiftDate } from '../utils/evolution';
import { localReportDate } from '../utils/weeklyReports';
import { downloadBlob } from '../utils/download';

const rate = (value) => value === null ? 'Sem base' : `${value.toLocaleString('pt-BR')}%`;
export default function EvolutionPanel({ tasks, sessions }) {
  const today = localReportDate();
  const [start, setStart] = useState(shiftDate(today, -27)); const [end, setEnd] = useState(today);
  const state = useMemo(() => { try { return { data: buildEvolution({ tasks, sessions, start, end }) }; } catch (issue) { return { error: issue.message }; } }, [tasks, sessions, start, end]);
  const exportCsv = () => {
    const rows = [['Início', 'Fim', 'Concluídas', 'No prazo (%)', 'Retrabalho (%)', 'Frequência (%)'], ...state.data.weeks.map((week) => [week.start, week.end, week.completed, week.onTimeRate ?? '', week.reworkRate ?? '', week.attendanceRate ?? ''])];
    downloadBlob(new Blob(['\uFEFF', rows.map((row) => row.join(';')).join('\r\n')], { type: 'text/csv;charset=utf-8' }), `evolucao-${start}-${end}.csv`);
  };
  return <section className="space-y-5 rounded-[26px] border border-white/10 bg-[#121722] p-5 md:p-6">
    <div><h2 className="text-xl font-black text-white">Evolução da equipe</h2><p className="mt-2 text-sm text-slate-400">Compare entregas, retrabalho e frequência com o período anterior de mesma duração.</p></div>
    <div className="flex flex-wrap items-end gap-3 text-sm text-slate-300"><label>De<input aria-label="Início dos indicadores" type="date" value={start} onChange={(event) => setStart(event.target.value)} className="mt-1 block rounded-xl border border-white/15 bg-black/20 p-2 text-white" /></label><label>Até<input aria-label="Fim dos indicadores" type="date" value={end} onChange={(event) => setEnd(event.target.value)} className="mt-1 block rounded-xl border border-white/15 bg-black/20 p-2 text-white" /></label><button disabled={!state.data} onClick={exportCsv} className="rounded-full border border-cyan-300/20 px-4 py-2 text-cyan-200 disabled:opacity-50">Exportar indicadores</button></div>
    {state.error ? <p role="alert" className="text-sm text-amber-200">{state.error}</p> : <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[
        ['Tarefas concluídas', String(state.data.current.completed), String(state.data.previous.completed), `${state.data.current.withDeadline} com prazo registrado`],
        ['Entregas no prazo', rate(state.data.current.onTimeRate), rate(state.data.previous.onTimeRate), `${state.data.current.onTime}/${state.data.current.withDeadline} entregas com prazo`],
        ['Retrabalho', rate(state.data.current.reworkRate), rate(state.data.previous.reworkRate), `${state.data.current.returned}/${state.data.current.reviewed} tarefas em revisão devolvidas`],
        ['Frequência', rate(state.data.current.attendanceRate), rate(state.data.previous.attendanceRate), `${state.data.current.justified} falta(s) justificada(s) fora do cálculo`],
      ].map(([title, current, previous, note]) => <article key={title} className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.03] p-4"><h3 className="text-xs font-bold text-slate-300">{title}</h3><p className="mt-3 text-2xl font-black text-white">{current}</p><p className="mt-2 text-xs text-slate-400">Anterior: {previous}</p><p className="mt-2 text-xs text-slate-400">{note}</p></article>)}</div>
      <p className="text-xs text-slate-400">Comparação: {state.data.previousPeriod.start.split('-').reverse().join('/')} a {state.data.previousPeriod.end.split('-').reverse().join('/')} · {state.data.current.blocked} tarefa(s) bloqueada(s) agora.</p>
      <div className="overflow-x-auto"><table className="w-full min-w-[540px] text-left text-sm text-slate-300"><caption className="mb-3 text-left font-bold text-white">Evolução por semana</caption><thead><tr>{['Período', 'Concluídas', 'No prazo', 'Retrabalho', 'Frequência'].map((label) => <th key={label} className="border-b border-white/10 p-3 text-xs">{label}</th>)}</tr></thead><tbody>{state.data.weeks.map((week) => <tr key={week.start}><td className="border-b border-white/5 p-3 text-xs">{week.start.split('-').reverse().join('/')} — {week.end.split('-').reverse().join('/')}</td><td className="border-b border-white/5 p-3">{week.completed}<div aria-hidden="true" className="mt-1 h-1 rounded-full bg-cyan-300/50" style={{ width: `${Math.min(100, week.completed / Math.max(1, ...state.data.weeks.map((item) => item.completed)) * 100)}%` }} /></td><td className="border-b border-white/5 p-3">{rate(week.onTimeRate)}</td><td className="border-b border-white/5 p-3">{rate(week.reworkRate)}</td><td className="border-b border-white/5 p-3">{rate(week.attendanceRate)}</td></tr>)}</tbody></table></div>
      <p className="text-xs leading-relaxed text-slate-400">São usados registros da temporada ativa. Tarefas sem prazo não entram na pontualidade; sem histórico de revisão, não há base de retrabalho. Atraso conta como presença. Os totais antigos de frequência não são misturados às chamadas do período.</p>
    </>}
  </section>;
}
