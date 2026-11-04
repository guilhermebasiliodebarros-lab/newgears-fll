import { completedEvidenceTasks, taskEvidenceText } from '../utils/workflowImprovements';

export default function TaskEvidencePicker({ tasks = [], student, technical = false, selected = [], onChange, onInsert, maxLength, currentText = '', seasonId }) {
  const available = completedEvidenceTasks(tasks, student, technical).filter((task) => !seasonId || (task.seasonId || 'legacy') === seasonId);
  const chosen = available.filter((task) => selected.includes(task.id));
  const text = chosen.map(taskEvidenceText).join('\n\n');
  const exceedsLimit = maxLength && [currentText.trim(), text].filter(Boolean).join('\n\n').length > maxLength;
  return <section className="rounded-2xl border border-cyan-300/20 bg-cyan-300/5 p-4">
    <h3 className="text-sm font-bold text-cyan-100">Aproveitar tarefas concluídas</h3>
    <p className="mt-2 text-xs text-slate-300">Vincule tarefas a este registro e use os resultados como ponto de partida. Acrescente o que aprendeu antes de enviar.</p>
    <input type="hidden" name="linkedTaskIds" value={JSON.stringify(selected)} onInput={(event) => { try { const ids = JSON.parse(event.target.value); if (Array.isArray(ids)) onChange(ids.filter((id) => typeof id === 'string')); } catch { /* Ignore invalid local drafts. */ } }} />
    {available.length ? <div className="mt-3 max-h-44 space-y-2 overflow-y-auto">{available.map((task) => <label key={task.id} className="flex min-h-11 items-start gap-2 rounded-xl bg-black/15 p-3 text-sm text-slate-200"><input className="mt-1" type="checkbox" disabled={selected.length >= 30 && !selected.includes(task.id)} name={`evidence-task-${task.id}`} checked={selected.includes(task.id)} onChange={(event) => onChange(event.target.checked ? [...selected, task.id] : selected.filter((id) => id !== task.id))} /><span className="break-words">{task.text}</span></label>)}</div> : <p className="mt-3 text-xs text-slate-400">As tarefas aparecerão aqui depois de concluídas.</p>}
    {selected.some((id) => !available.some((task) => task.id === id)) && <p role="alert" className="mt-2 text-xs text-amber-100">Uma tarefa vinculada não está disponível na lista de tarefas concluídas desta temporada. <button type="button" className="underline" onClick={() => onChange(chosen.map((task) => task.id))}>Revisar vínculos</button></p>}
    <button type="button" disabled={!chosen.length || exceedsLimit} onClick={() => onInsert(text)} className="ng-button mt-3 min-h-11 disabled:opacity-40">Inserir resultados no texto</button>
    {exceedsLimit && <p role="alert" className="mt-2 text-xs text-amber-100">Os resultados ultrapassam o limite do texto. Selecione menos tarefas ou resuma o conteúdo.</p>}
  </section>;
}
