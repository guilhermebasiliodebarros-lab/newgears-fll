import { useMemo, useState } from 'react';
import { buildWorkload, formatMinutes } from '../utils/workload';
import RecordConflictResolver from './RecordConflictResolver';

function CapacityEditor({ student, onSave }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState('');
  const [expected, setExpected] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [conflict, setConflict] = useState(null);
  return <div className="mt-3">{!editing ? <button type="button" onClick={() => { setValue(student.weeklyCapacityMinutes ?? ''); setExpected(student.weeklyCapacityMinutes ?? null); setEditing(true); }} className="ng-button min-h-11 text-xs">Combinar disponibilidade de {student.name}</button> : <form className="space-y-3" onSubmit={async (event) => {
    event.preventDefault(); if (busy) return; setBusy(true); setError('');
    try { await onSave(student.id, value, expected); setEditing(false); setConflict(null); }
    catch (failure) { setError(failure.message); if (failure.code === 'record-conflict') setConflict(failure.conflict); }
    finally { setBusy(false); }
  }}><label className="block text-xs text-slate-300">Disponibilidade combinada de {student.name} (minutos por semana)<input type="number" min="1" max="2400" step="1" value={value} disabled={busy} onChange={(event) => setValue(event.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-white/15 bg-[#101520] p-2 text-white" placeholder="Em branco = ainda não combinada" /></label><p className="text-xs text-slate-400">Tempo combinado com o integrante para as atividades da equipe. Deixe em branco se ainda não foi definido.</p>{conflict && <RecordConflictResolver conflict={conflict} labels={{ weeklyCapacityMinutes: 'Disponibilidade semanal (minutos)' }} onResolve={(merged) => { setValue(merged.weeklyCapacityMinutes ?? ''); setExpected(conflict.current.weeklyCapacityMinutes); setConflict(null); setError('Escolhas aplicadas. Confira e salve novamente.'); }} />}<div className="flex gap-2"><button disabled={busy || Boolean(conflict)} className="ng-button min-h-11">{busy ? 'Salvando…' : 'Salvar disponibilidade'}</button><button type="button" disabled={busy} onClick={() => { setEditing(false); setConflict(null); setError(''); }} className="ng-button min-h-11">Cancelar</button></div>{error && <p role="status" className="text-xs text-amber-100">{error}</p>}</form>}</div>;
}

export default function WorkloadPanel({ students, tasks, today, onOpenTask, onSaveCapacity }) {
  const workload = useMemo(() => buildWorkload({ students, tasks, today }), [students, tasks, today]);
  const [onlyAttention, setOnlyAttention] = useState(false);
  const rows = workload.rows.filter((row) => !onlyAttention || row.overCapacity || row.blocked || row.overdue);
  return <section aria-label="Distribuição da carga de trabalho" className="space-y-4 rounded-[26px] border border-cyan-300/20 bg-[#121722] p-4 md:p-6">
    <div><h2 className="text-xl font-bold text-white">Carga de trabalho da equipe</h2><p className="mt-2 text-sm text-slate-300">Planejamento dos próximos 7 dias, de {today.split('-').reverse().join('/')} a {workload.endDate.split('-').reverse().join('/')}. Inclui tarefas vencidas e sem prazo.</p></div>
    <p className="text-xs leading-relaxed text-slate-400">O esforço estimado é dividido entre os responsáveis ativos. Tarefas em revisão aparecem separadas e não entram no esforço de execução. Estimativas e disponibilidade ajudam a conversar sobre apoio e distribuição das atividades.</p>
    <label className="flex min-h-11 items-center gap-2 text-sm text-amber-100"><input type="checkbox" checked={onlyAttention} onChange={(event) => setOnlyAttention(event.target.checked)} />Mostrar quem precisa de atenção</label>
    <div className="grid gap-3 xl:grid-cols-2">{rows.map((row) => <article key={row.student.id} className="min-w-0 rounded-2xl border border-white/10 p-4">
      <h3 className="font-bold text-white">{row.student.name}</h3><p className="mt-1 text-xs text-slate-400">{row.student.station || 'Estação ainda não definida'}</p>
      <p className={`mt-3 text-sm ${row.overCapacity ? 'text-amber-100' : 'text-cyan-100'}`}>{formatMinutes(row.estimatedMinutes)} estimadas · {row.capacity === null ? 'Disponibilidade não combinada' : `${formatMinutes(row.capacity)} disponíveis por semana`}</p>
      {row.overCapacity && <p className="mt-2 text-xs text-amber-200">Esforço estimado acima da disponibilidade. Combine prioridades e apoio com o integrante.</p>}
      <p className="mt-2 text-xs text-slate-300">{row.tasks.length} tarefa(s) aberta(s) · {row.inReview} em revisão · {row.blocked} bloqueada(s) · {row.overdue} vencida(s)</p>
      <p className="mt-2 text-xs text-slate-400">{row.unestimated} sem estimativa · {row.withoutDeadline} sem prazo{row.unestimated ? '. O esforço total ainda está incompleto.' : ''}</p>
      <details className="mt-3 text-xs text-slate-200"><summary className="cursor-pointer py-2">Ver tarefas e redistribuir</summary><div className="mt-2 max-h-60 space-y-2 overflow-y-auto">{row.tasks.map((task) => <button type="button" key={task.id} onClick={() => onOpenTask(task.id)} className="block min-h-11 w-full rounded-xl border border-white/10 px-3 py-2 text-left text-cyan-100">{task.text}<span className="mt-1 block text-[11px] text-slate-400">{task.status === 'review' ? 'Aguardando revisão' : task.estimatedMinutes ? `${formatMinutes(task.estimatedMinutes)} no total` : 'Sem estimativa'} · {task.dueDate ? task.dueDate.split('-').reverse().join('/') : 'Sem prazo'}</span></button>)}</div><p className="mt-2 text-slate-400">Abra a tarefa para conferir os responsáveis, combinar a redistribuição ou ajustar a estimativa.</p></details>
      <CapacityEditor student={row.student} onSave={onSaveCapacity} />
    </article>)}</div>
    {!rows.length && <p className="text-sm text-slate-300">{onlyAttention ? 'Nenhum integrante apresenta sobrecarga estimada, tarefa vencida ou bloqueada neste período.' : 'Cadastre os integrantes para acompanhar a distribuição.'}</p>}
    {workload.unassigned.length > 0 && <div className="rounded-xl border border-amber-300/25 p-4"><h3 className="text-sm font-bold text-amber-100">{workload.unassigned.length} tarefa(s) sem responsável ativo</h3><div className="mt-2 flex flex-wrap gap-2">{workload.unassigned.map((task) => <button type="button" key={task.id} onClick={() => onOpenTask(task.id)} className="ng-button min-h-11 text-xs">{task.text}</button>)}</div></div>}
  </section>;
}
