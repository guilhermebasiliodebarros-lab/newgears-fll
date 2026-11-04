import { useRef, useState } from 'react';
import { Lock, UserCheck } from 'lucide-react';
import { DialogSurface } from './InterfacePrimitives';

export default function StudentAccessDialog({ student, onConfirm, onClose }) {
  const active = student.status === 'inactive';
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submitting = useRef(false);
  const cancel = useRef(null);
  const close = () => { if (!submitting.current) onClose(); };
  const submit = async (event) => {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true); setError('');
    try {
      await onConfirm(student.id, active);
      onClose();
    } catch (failure) {
      setError(failure.message || 'Não foi possível alterar o acesso. Tente novamente.');
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  };

  return <DialogSurface onClose={close} initialFocusRef={cancel} label="Acesso do aluno">
    <form onSubmit={submit} className="space-y-5" aria-busy={busy}>
      <h2 className="flex items-center gap-2 text-xl font-black text-white">{active ? <UserCheck size={22} /> : <Lock size={22} />}{active ? 'Reativar acesso' : 'Inativar acesso'}</h2>
      <p className="text-sm text-slate-200">{active ? 'Reativar o acesso de' : 'Inativar o acesso de'} <strong>{student.name}</strong>?</p>
      <p className="text-sm leading-relaxed text-slate-300">{active
        ? 'O aluno poderá entrar novamente com a mesma conta e continuará com os dados e o histórico que já possui.'
        : 'O aluno não poderá entrar no sistema. Se estiver conectado, a sessão será encerrada ao receber a atualização do cadastro.'}</p>
      <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/5 p-4 text-sm leading-relaxed text-emerald-100">
        Relatórios, arquivos, diário, tarefas, avaliações, notas, presenças, XP e conquistas continuam salvos e vinculados ao aluno.
      </div>
      <p className="text-xs leading-relaxed text-slate-400">{active
        ? 'Confira o planejamento e o rodízio antes de incluí-lo nas próximas atividades.'
        : 'O cadastro ficará em Inativos, disponível para consulta pelo técnico. Você poderá reativar o acesso quando precisar.'}</p>
      {error && <p role="alert" className="text-sm text-rose-200">{error}</p>}
      <div className="flex flex-wrap justify-end gap-2">
        <button ref={cancel} type="button" disabled={busy} onClick={close} className="ng-button">Cancelar</button>
        <button type="submit" disabled={busy} className={`ng-button ${active ? 'bg-emerald-300 text-slate-950' : 'bg-rose-300 text-slate-950'}`}>{busy ? 'Salvando…' : active ? 'Confirmar reativação' : 'Confirmar inativação'}</button>
      </div>
    </form>
  </DialogSurface>;
}
