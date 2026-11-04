import { useRef, useState } from 'react';
import DraftForm from './DraftForm';
import RecordConflictResolver from './RecordConflictResolver';
import { editableTask, saveTaskDetails } from '../services/taskEditing';
import { DialogSurface } from './InterfacePrimitives';

const labels = { text: 'Descrição', estimatedMinutes: 'Esforço estimado (minutos)', dueDate: 'Prazo', priority: 'Prioridade' };
const fieldClass = 'mt-2 min-h-11 w-full rounded-xl border border-white/15 bg-[#101520] p-3 text-sm text-white';
export default function TaskDetailsEditor({ task, db, user, seasonId, onClose }) {
  const [draft, setDraft] = useState(() => editableTask(task));
  const [expected, setExpected] = useState(() => editableTask(task));
  const [conflict, setConflict] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const saving = useRef(false);
  const close = () => { if (!saving.current) onClose(); };
  const change = (field, value) => setDraft((current) => ({ ...current, [field]: value }));
  return <DialogSurface label="Editar tarefa" onClose={close} closeButton className="ng-dialog--wide"><h2 className="mb-4 text-xl font-bold text-white">Editar tarefa</h2><DraftForm kind="task-details-edit" recordId={task.id} values={{ draft, expected }} onDiscard={() => { setDraft(editableTask(task)); setExpected(editableTask(task)); setConflict(null); setNotice(''); }} onSubmit={async () => {
    saving.current = true;
    setBusy(true);
    try { await saveTaskDetails({ db, user, id: task.id, expected, changes: draft, seasonId }); onClose(); return true; }
    catch (failure) { if (failure.code === 'record-conflict') setConflict(failure.conflict); throw failure; }
    finally { saving.current = false; setBusy(false); }
  }} className="space-y-3" onClick={(event) => event.stopPropagation()}>
    <input type="hidden" name="expectedRecord" value={JSON.stringify(expected)} onInput={(event) => { try { setExpected(editableTask(JSON.parse(event.target.value))); } catch { /* Invalid local drafts keep the current reference. */ } }} />
    <fieldset disabled={busy} className="min-w-0 space-y-3">
      <label className="block text-xs text-slate-300">Descrição da tarefa<textarea name="taskText" required maxLength={2000} value={draft.text} onChange={(event) => change('text', event.target.value)} className={fieldClass} rows={3} /></label>
      <label className="block text-xs text-slate-300">Esforço estimado total (minutos)<input name="estimatedMinutes" type="number" min="1" max="2400" value={draft.estimatedMinutes ?? ''} onChange={(event) => change('estimatedMinutes', event.target.value)} className={fieldClass} placeholder="Sem estimativa" /></label>
      <p className="text-xs text-slate-400">Estimativa de execução da tarefa inteira, dividida entre os responsáveis ativos no painel de carga.</p>
      <label className="block text-xs text-slate-300">Prazo da tarefa<input name="dueDate" type="date" value={draft.dueDate} onChange={(event) => change('dueDate', event.target.value)} className={fieldClass} /></label>
      <label className="block text-xs text-slate-300">Prioridade<select name="priority" value={draft.priority} onChange={(event) => change('priority', event.target.value)} className={fieldClass}>{[['baixa', 'Baixa'], ['normal', 'Normal'], ['alta', 'Alta'], ['urgente', 'Urgente']].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    </fieldset>
    {conflict && <RecordConflictResolver conflict={{ ...conflict, proposed: { ...draft, estimatedMinutes: draft.estimatedMinutes === '' ? null : Number(draft.estimatedMinutes) || null } }} labels={labels} onResolve={(merged) => { setDraft(editableTask(merged)); setExpected(editableTask(conflict.current)); setConflict(null); setNotice('Escolhas aplicadas. Confira os detalhes e salve novamente.'); }} onCancel={() => setConflict(null)} />}
    {notice && <p role="status" className="text-xs text-cyan-100">{notice}</p>}
    <div className="flex flex-wrap gap-2"><button disabled={busy || Boolean(conflict)} className="ng-button min-h-11">{busy ? 'Salvando…' : 'Salvar detalhes da tarefa'}</button><button type="button" disabled={busy} onClick={close} className="ng-button min-h-11">Fechar edição</button></div>
  </DraftForm></DialogSurface>;
}
