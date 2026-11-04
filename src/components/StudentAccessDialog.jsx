import { useRef, useState } from 'react';
import { Lock, UserCheck } from 'lucide-react';
import { DialogSurface } from './InterfacePrimitives';
import { openStudentTasks, participantSignature } from '../utils/workflowImprovements';
import { FINAL_SPRINT_FRONTS } from '../constants/finalSprintFronts';

export default function StudentAccessDialog({ student, students = [], tasks = [], planning, assignments = [], assignmentsLoading, assignmentsError, onConfirm, onClose }) {
  const active = student.status === 'inactive';
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [redistribution, setRedistribution] = useState({});
  const [removeFromPlanning, setRemoveFromPlanning] = useState(true);
  const pendingTasks = openStudentTasks(tasks, student, students);
  const roles = [['captainIds', 'Capitão / capitã'], ['traineeIds', 'Aprendiz'], ['participantIds', 'Participante do rodízio']].filter(([key]) => planning?.[key]?.includes(student.id));
  const fronts = assignments.filter((item) => item.studentId === student.id && item.active !== false);
  const submitting = useRef(false);
  const cancel = useRef(null);
  const close = () => { if (!submitting.current) onClose(); };
  const submit = async (event) => {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true); setError('');
    try {
      await onConfirm(student.id, active, active ? undefined : {
        removeFromPlanning,
        tasks: pendingTasks.filter((task) => redistribution[task.id]).map((task) => ({ taskId: task.id, replacementId: redistribution[task.id] === '__remove__' ? '' : redistribution[task.id], expectedStatus: task.status, expectedParticipants: participantSignature(task) })),
      });
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
      {!active && <section className="space-y-3 rounded-2xl border border-amber-300/20 p-4">
        <h3 className="font-bold text-amber-100">Revisar responsabilidades</h3>
        <p className="text-xs text-slate-300">Estação: {student.station || 'Sem estação'} · {roles.map(([, label]) => label).join(', ') || 'Sem papel fixo no rodízio'}</p>
        <label className="flex min-h-11 items-center gap-2 text-sm text-slate-200"><input type="checkbox" checked={removeFromPlanning} disabled={busy} onChange={(event) => setRemoveFromPlanning(event.target.checked)} />Retirar do planejamento dos próximos rodízios</label>
        {assignmentsLoading ? <p role="status" className="text-xs text-slate-400">Consultando frentes de trabalho…</p> : assignmentsError ? <p role="alert" className="text-xs text-amber-200">Não foi possível consultar as frentes. Confira a Reta final depois.</p> : <p className="text-xs text-slate-300">Frentes registradas: {fronts.map((item) => FINAL_SPRINT_FRONTS.find((front) => front.id === item.frontId)?.title || item.frontId).join(', ') || 'Nenhuma'}. Os registros das frentes serão preservados; revise sua distribuição na Reta final.</p>}
        <p className="text-sm text-white">{pendingTasks.length} tarefa(s) aberta(s)</p>
        <p className="text-xs text-slate-400">Escolha quem assume cada tarefa. Os demais participantes e a autoria original serão preservados.</p>
        <div className="max-h-64 space-y-3 overflow-y-auto">{pendingTasks.map((task) => <label key={task.id} className="block rounded-xl border border-white/10 p-3 text-sm text-slate-200"><span className="block break-words">{task.text}</span><select aria-label={`Responsável por ${task.text}`} disabled={busy} value={redistribution[task.id] || ''} onChange={(event) => setRedistribution((current) => ({ ...current, [task.id]: event.target.value }))} className="mt-2 min-h-11 w-full rounded-xl border border-white/15 bg-[#101520] p-2 text-white"><option value="">Manter participantes e revisar depois</option><option value="__remove__">Retirar apenas este integrante</option>{students.filter((person) => person.id !== student.id && person.status !== 'inactive').map((person) => <option key={person.id} value={person.id}>Transferir participação para {person.name}</option>)}</select></label>)}</div>
        {pendingTasks.some((task) => !redistribution[task.id]) && <p className="text-xs text-amber-100">As tarefas mantidas ainda terão um integrante inativo entre os responsáveis e precisarão de revisão.</p>}
      </section>}
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
