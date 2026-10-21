import { useState } from 'react';

export default function TaskBlockForm({ task, tasks, students, onSave }) {
  const open = task.block && !task.block.resolvedAt;
  const [reason, setReason] = useState(open ? task.block.reason : '');
  const [category, setCategory] = useState(open ? task.block.category : 'help');
  const [dependencyId, setDependencyId] = useState(open ? task.block.dependencyId : '');
  const [helpFromId, setHelpFromId] = useState(open ? task.block.helpFromId : '');
  const [resolution, setResolution] = useState('');
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const field = 'mt-2 w-full rounded-xl border border-white/15 bg-[#111827] p-3 text-white';
  const submit = async (blocked) => { setBusy(true); setError(''); try { await onSave({ blocked, reason, category, dependencyId: category === 'dependency' ? dependencyId : '', helpFromId, resolution }); } catch (issue) { setError(issue.message); } finally { setBusy(false); } };
  return <div className="space-y-5 text-sm text-slate-300"><h2 className="text-xl font-black text-white">{open ? 'Impedimento da tarefa' : 'Registrar impedimento'}</h2><p>{task.text}</p>
    <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); submit(true); }}>
      <label className="block">Tipo<select className={field} value={category} onChange={(event) => setCategory(event.target.value)}><option value="material">Falta de material ou peça</option><option value="help">Preciso de ajuda</option><option value="decision">Aguardando decisão</option><option value="dependency">Depende de outra tarefa</option><option value="other">Outro impedimento</option></select></label>
      <label className="block">O que impede o avanço?<textarea required minLength={5} maxLength={1000} rows={3} className={field} value={reason} onChange={(event) => setReason(event.target.value)} /></label>
      {category === 'dependency' && <label className="block">Tarefa anterior<select required className={field} value={dependencyId} onChange={(event) => setDependencyId(event.target.value)}><option value="">Selecionar tarefa</option>{tasks.filter((item) => item.id !== task.id).map((item) => <option key={item.id} value={item.id}>{item.text}</option>)}</select></label>}
      <label className="block">Quem pode ajudar? (opcional)<select className={field} value={helpFromId} onChange={(event) => setHelpFromId(event.target.value)}><option value="">Técnico / equipe</option>{students.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}</select></label>
      <button disabled={busy} className="rounded-full bg-amber-300 px-5 py-3 font-bold text-slate-950 disabled:opacity-50">{busy ? 'Salvando…' : open ? 'Atualizar impedimento' : 'Bloquear avanço'}</button>
    </form>
    {open && <form className="space-y-3 border-t border-white/10 pt-4" onSubmit={(event) => { event.preventDefault(); submit(false); }}><label className="block">Como foi resolvido?<textarea required minLength={3} maxLength={1000} className={field} value={resolution} onChange={(event) => setResolution(event.target.value)} /></label><button disabled={busy} className="rounded-full bg-emerald-300 px-5 py-3 font-bold text-slate-950 disabled:opacity-50">Liberar tarefa</button></form>}
    {error && <p role="alert" className="text-red-200">{error}</p>}
  </div>;
}
