export default function LinkedTaskReferences({ ids = [], tasks = [], onOpenTask }) {
  if (!ids.length) return null;
  return <div className="mt-3 text-xs text-cyan-200"><p>Tarefas vinculadas</p><div className="mt-1 flex flex-wrap gap-2">{ids.map((id) => {
    const task = tasks.find((item) => item.id === id);
    return task && onOpenTask ? <button key={id} type="button" onClick={() => onOpenTask(id)} className="min-h-11 rounded-lg border border-cyan-300/20 px-3 py-2 text-left underline">{task.text}</button> : <span key={id} className="py-2">{task?.text || 'Tarefa arquivada ou indisponível'}</span>;
  })}</div></div>;
}
