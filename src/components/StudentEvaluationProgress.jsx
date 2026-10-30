import { useId, useMemo, useState } from 'react';
import { getWeeklyEvaluationHistory, WEEKLY_EVALUATION_CRITERIA } from '../utils/finalSprintEvaluations';

const COLORS = ['#fcd34d', '#67e8f9', '#f0abfc', '#86efac', '#fb923c'];
const shortDate = (value) => value.slice(5).split('-').reverse().join('/');
const difference = (value) => `${value > 0 ? '+' : ''}${value}`;
const time = (value) => new Date(`${value}T12:00:00`).getTime();

export default function StudentEvaluationProgress({ studentId, studentName, evaluations }) {
  const titleId = useId();
  const [range, setRange] = useState('12');
  const [criterion, setCriterion] = useState('all');
  const [focusedWeek, setFocusedWeek] = useState('');
  const history = useMemo(() => getWeeklyEvaluationHistory(evaluations, studentId), [evaluations, studentId]);
  const rows = range === 'all' ? history : history.slice(-Number(range));
  const first = rows[0];
  const last = rows.at(-1);
  const focused = rows.find((row) => row.weekId === focusedWeek) || last;
  const min = first ? time(first.weekId) : 0;
  const max = last ? time(last.weekId) : min;
  const x = (row) => max === min ? 380 : 55 + (time(row.weekId) - min) / (max - min) * 650;
  const y = (value) => 205 - value * 34;
  return <section className="space-y-4 rounded-[26px] border border-cyan-300/20 bg-[#111722] p-5 md:p-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 id={titleId} className="text-xl font-black text-white">Evolução de {studentName || 'aluno'}</h3><p className="mt-2 text-xs text-gray-400">Notas semanais por critério, de 0 a 5. Somente avaliações completas entram no gráfico.</p></div><label className="text-xs text-gray-300">Período<select aria-label="Período do gráfico de evolução" value={range} onChange={(event) => setRange(event.target.value)} className="ml-2 rounded-lg border border-white/15 bg-[#111722] p-2 text-white"><option value="12">Últimas 12 avaliações</option><option value="all">Toda a temporada</option></select></label></div>
    {!rows.length ? <p className="rounded-xl border border-dashed border-white/15 p-6 text-center text-sm text-gray-400">A evolução aparecerá depois da primeira avaliação semanal completa.</p> : <>
      <div className="grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-white/5 p-4"><p className="text-xs text-gray-400">Última avaliação</p><p className="mt-1 text-2xl font-black text-white">{last.total}/25</p><p className="mt-1 text-[10px] text-gray-400">{last.label}</p></div><div className="rounded-xl bg-white/5 p-4"><p className="text-xs text-gray-400">Variação no período</p><p className={`mt-1 text-2xl font-black ${rows.length > 1 && last.total > first.total ? 'text-emerald-200' : 'text-white'}`}>{rows.length > 1 ? `${difference(last.total - first.total)} pontos` : 'Sem comparação'}</p><p className="mt-1 text-[10px] text-gray-400">{rows.length > 1 ? 'Última nota menos a primeira do período' : 'São necessárias duas avaliações'}</p></div><div className="rounded-xl bg-white/5 p-4"><p className="text-xs text-gray-400">Semanas avaliadas</p><p className="mt-1 text-2xl font-black text-white">{rows.length}</p><p className="mt-1 text-[10px] text-gray-400">Semanas sem nota não são contadas como zero</p></div></div>
      <div className="flex flex-wrap gap-2"><button type="button" aria-pressed={criterion === 'all'} onClick={() => setCriterion('all')} className={`rounded-full border px-3 py-2 text-xs ${criterion === 'all' ? 'border-white/40 bg-white/10 text-white' : 'border-white/10 text-gray-400'}`}>Todos os critérios</button>{WEEKLY_EVALUATION_CRITERIA.map((item, index) => <button key={item.id} type="button" aria-pressed={criterion === item.id} onClick={() => setCriterion(item.id)} style={{ color: COLORS[index], borderColor: criterion === item.id ? COLORS[index] : undefined }} className="rounded-full border border-white/10 px-3 py-2 text-xs">{item.label}</button>)}</div>
      <svg viewBox="0 0 760 255" className="w-full" role="group" aria-labelledby={titleId}>
        <title>Notas semanais de {studentName}. Use os pontos ou consulte a tabela para ler os valores.</title>
        {[0, 1, 2, 3, 4, 5].map((score) => <g key={score}><line x1="55" x2="705" y1={y(score)} y2={y(score)} stroke="white" strokeOpacity="0.1" /><text x="35" y={y(score) + 4} fill="#9ca3af" fontSize="12">{score}</text></g>)}
        {WEEKLY_EVALUATION_CRITERIA.map((item, index) => criterion !== 'all' && criterion !== item.id ? null : <g key={item.id}>
          <path d={rows.map((row, position) => `${position && time(row.weekId) - time(rows[position - 1].weekId) < 8 * 86400000 ? 'L' : 'M'}${x(row)},${y(row.ratings[item.id])}`).join(' ')} fill="none" stroke={COLORS[index]} strokeWidth="2.5" />
          {rows.map((row) => <circle key={row.weekId} cx={x(row)} cy={y(row.ratings[item.id])} r={focused.weekId === row.weekId ? 5 : 3.5} fill={COLORS[index]} tabIndex="0" role="button" aria-label={`${row.label}, ${item.label}: ${row.ratings[item.id]} de 5`} onFocus={() => setFocusedWeek(row.weekId)} onClick={() => setFocusedWeek(row.weekId)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setFocusedWeek(row.weekId); } }}><title>{row.label} · {item.label}: {row.ratings[item.id]}/5</title></circle>)}
        </g>)}
        {rows.filter((_row, index) => index === 0 || index === rows.length - 1 || (rows.length <= 12 && index % 2 === 0)).map((row) => <text key={row.weekId} x={x(row)} y="237" textAnchor="middle" fill="#9ca3af" fontSize="11">{shortDate(row.weekId)}</text>)}
      </svg>
      <div aria-live="polite" className="rounded-xl border border-white/10 bg-black/20 p-4"><p className="text-xs font-bold text-white">{focused.label} · {focused.total}/25</p><div className="mt-3 flex flex-wrap gap-3">{WEEKLY_EVALUATION_CRITERIA.map((item, index) => <span key={item.id} className="text-xs" style={{ color: COLORS[index] }}>{item.label}: {focused.ratings[item.id]}/5</span>)}</div>{focused.improvement ? <p className="mt-3 text-xs text-gray-300">Próximo passo: {focused.improvement}</p> : null}</div>
      <details className="text-xs text-gray-300"><summary className="cursor-pointer font-bold">Consultar notas em tabela</summary><div className="mt-3 overflow-x-auto"><table className="w-full min-w-[640px] text-left"><thead><tr><th className="p-2">Semana</th>{WEEKLY_EVALUATION_CRITERIA.map((item) => <th key={item.id} className="p-2">{item.label}</th>)}<th className="p-2">Total</th></tr></thead><tbody>{rows.map((row) => <tr key={row.weekId} className="border-t border-white/10"><td className="p-2">{row.label}</td>{WEEKLY_EVALUATION_CRITERIA.map((item) => <td key={item.id} className="p-2">{row.ratings[item.id]}</td>)}<td className="p-2 font-bold">{row.total}/25</td></tr>)}</tbody></table></div></details>
    </>}
  </section>;
}
