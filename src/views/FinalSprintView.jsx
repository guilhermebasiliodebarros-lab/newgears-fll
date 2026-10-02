import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Bot, Check, CheckCircle2, ClipboardList, Flag, Lightbulb, LoaderCircle, Mic, RefreshCw, Wrench } from 'lucide-react';

export const FINAL_SPRINT_FRONTS = [
  {
    id: 'innovation_project',
    title: 'Projeto de inovação',
    icon: Lightbulb,
    tone: 'border-purple-400/25 bg-purple-400/10 text-purple-200',
    description: 'Concluir a solução, validar seu impacto e organizar a história do projeto.',
    examples: ['Finalizar protótipo e validação', 'Organizar evidências e impacto', 'Preparar a apresentação do projeto'],
  },
  {
    id: 'robot_design',
    title: 'Design do robô',
    icon: Wrench,
    tone: 'border-cyan-400/25 bg-cyan-400/10 text-cyan-200',
    description: 'Explicar as decisões de construção, programação, anexos e testes do robô.',
    examples: ['Ajustar construção e anexos', 'Testar código e sensores', 'Registrar melhorias feitas após os testes'],
  },
  {
    id: 'robot_game',
    title: 'Mesa da FLL',
    icon: Bot,
    tone: 'border-blue-400/25 bg-blue-400/10 text-blue-200',
    description: 'Treinar as saídas, consolidar rounds e melhorar a consistência na mesa.',
    examples: ['Treinar as oito saídas', 'Combinar estratégia e ordem dos rounds', 'Repetir tentativas e acompanhar pontos e tempo'],
  },
  {
    id: 'judges_presentation',
    title: 'Apresentação aos juízes',
    icon: Mic,
    tone: 'border-amber-400/25 bg-amber-400/10 text-amber-200',
    description: 'Praticar explicações e perguntas para que todos participem com segurança.',
    examples: ['Ensaiar falas e transições', 'Treinar respostas a perguntas', 'Ajudar cada integrante a explicar sua contribuição'],
  },
];

const STATUS_OPTIONS = [
  { id: 'planned', label: 'Vou começar' },
  { id: 'in_progress', label: 'Em andamento' },
  { id: 'done', label: 'Concluído' },
];

const STATUS_LABELS = Object.fromEntries(STATUS_OPTIONS.map((status) => [status.id, status.label]));

const formatUpdatedAt = (value) => {
  if (!value) return 'Ainda sem atualização';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Ainda sem atualização';
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(date);
};

const getAssignmentDraft = (assignment) => ({
  commitment: assignment?.commitment || '',
  progressNote: assignment?.progressNote || '',
  status: assignment?.status || 'planned',
});

export default function FinalSprintView({
  isTechnicalProfile = false,
  student,
  assignments = [],
  assignmentsLoading = false,
  assignmentsError = false,
  onToggleFront,
  onSaveProgress,
  onRetryAssignments,
}) {
  const [drafts, setDrafts] = useState({});
  const [savingFrontId, setSavingFrontId] = useState(null);
  const [saveStates, setSaveStates] = useState({});

  useEffect(() => {
    setDrafts((currentDrafts) => {
      const nextDrafts = { ...currentDrafts };
      assignments.forEach((assignment) => {
        if (!nextDrafts[assignment.frontId]) nextDrafts[assignment.frontId] = getAssignmentDraft(assignment);
      });
      return nextDrafts;
    });
  }, [assignments]);

  const ownAssignments = useMemo(
    () => assignments.filter((assignment) => String(assignment.studentId) === String(student?.id)),
    [assignments, student?.id],
  );
  const ownActiveFrontIds = new Set(ownAssignments.filter((assignment) => assignment.active !== false).map((assignment) => assignment.frontId));
  const ownSelectionCount = ownActiveFrontIds.size;
  const activeAssignmentCount = assignments.filter((assignment) => assignment.active !== false).length;
  const activeStudentCount = new Set(assignments.filter((assignment) => assignment.active !== false).map((assignment) => String(assignment.studentId))).size;
  const completedAssignmentCount = assignments.filter((assignment) => assignment.active !== false && assignment.status === 'done').length;
  const studentSummaries = useMemo(() => {
    const summaries = new Map();
    assignments.filter((assignment) => assignment.active !== false).forEach((assignment) => {
      const key = String(assignment.studentId);
      if (!summaries.has(key)) summaries.set(key, { id: key, name: assignment.studentName || 'Aluno', fronts: [] });
      summaries.get(key).fronts.push(assignment);
    });
    return [...summaries.values()].sort((left, right) => left.name.localeCompare(right.name, 'pt-BR'));
  }, [assignments]);

  const updateDraft = (frontId, field, value, assignment) => {
    setSaveStates((current) => ({ ...current, [frontId]: 'idle' }));
    setDrafts((currentDrafts) => ({
      ...currentDrafts,
      [frontId]: { ...(currentDrafts[frontId] || getAssignmentDraft(assignment)), [field]: value },
    }));
  };

  const handleSaveProgress = async (frontId, assignment) => {
    const draft = drafts[frontId] || getAssignmentDraft(assignment);
    setSavingFrontId(frontId);
    setSaveStates((current) => ({ ...current, [frontId]: 'saving' }));
    try {
      const saved = await onSaveProgress(frontId, draft);
      setSaveStates((current) => ({ ...current, [frontId]: saved ? 'saved' : 'error' }));
    } catch {
      setSaveStates((current) => ({ ...current, [frontId]: 'error' }));
    } finally {
      setSavingFrontId(null);
    }
  };

  const assignmentLoadStatus = assignmentsLoading ? (
    <div role="status" className="flex items-center gap-2 rounded-xl border border-blue-400/15 bg-blue-400/5 px-4 py-3 text-xs text-blue-100"><LoaderCircle size={15} className="animate-spin" />Carregando as escolhas dos alunos…</div>
  ) : assignmentsError ? (
    <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-xs text-red-100"><span className="flex items-center gap-2"><AlertCircle size={15} />Não foi possível carregar as escolhas. Verifique a conexão e tente novamente.</span><button type="button" onClick={onRetryAssignments} className="inline-flex items-center gap-2 rounded-lg border border-red-300/20 px-3 py-2 font-bold hover:bg-red-300/10"><RefreshCw size={13} />Tentar novamente</button></div>
  ) : null;

  if (isTechnicalProfile) {
    return (
      <div className="space-y-6">
        <section className="newgears-major-panel rounded-[28px] border border-amber-400/20 bg-gradient-to-br from-[#241d12] via-[#171922] to-[#111722] p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-200/75">Painel técnico • dezembro</p>
              <h2 className="mt-3 text-3xl font-black text-white">Reta final do torneio</h2>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-300">Acompanhe as frentes escolhidas, os compromissos e as atualizações registradas pelos alunos.</p>
            </div>
            <div className="flex gap-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"><p className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-500">Alunos participando</p><p className="mt-1 text-2xl font-black text-white">{activeStudentCount}</p></div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"><p className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-500">Frentes ativas</p><p className="mt-1 text-2xl font-black text-white">{activeAssignmentCount}</p></div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"><p className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-500">Concluídas</p><p className="mt-1 text-2xl font-black text-white">{completedAssignmentCount}</p></div>
            </div>
          </div>
        </section>

        {assignmentLoadStatus}

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {FINAL_SPRINT_FRONTS.map((front) => {
            const FrontIcon = front.icon;
            const count = assignments.filter((assignment) => assignment.frontId === front.id && assignment.active !== false).length;
            return <div key={front.id} className={`rounded-2xl border p-4 ${front.tone}`}><div className="flex items-center justify-between"><FrontIcon size={18} /><span className="text-xl font-black">{count}</span></div><p className="mt-3 text-sm font-bold">{front.title}</p><p className="mt-1 text-[11px] opacity-75">aluno(s) nesta frente</p></div>;
          })}
        </section>

        <section className="rounded-[24px] border border-white/10 bg-[#111722] p-5">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div><h3 className="text-lg font-black text-white">Plano de cada aluno</h3><p className="mt-1 text-xs text-gray-400">As escolhas ficam fixas até o torneio. Consulte aqui as quatro frentes e o andamento de cada pessoa.</p></div>
            <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-amber-100">{studentSummaries.length} aluno(s) com escolhas</span>
          </div>
          {studentSummaries.length ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {studentSummaries.map((summary) => (
                <article key={summary.id} className="rounded-2xl border border-white/8 bg-black/15 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3"><h4 className="font-black text-white">{summary.name}</h4><span className="text-[10px] font-bold text-gray-400">{summary.fronts.length}/4 frentes</span></div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {FINAL_SPRINT_FRONTS.map((front) => {
                      const item = summary.fronts.find((assignment) => assignment.frontId === front.id);
                      const FrontIcon = front.icon;
                      return <div key={front.id} className={`rounded-xl border p-3 ${item ? front.tone : 'border-white/5 bg-white/[0.02] text-gray-600'}`}>
                        <div className="flex items-center justify-between gap-2"><span className="flex items-center gap-2 text-[11px] font-bold"><FrontIcon size={14} />{front.title}</span><span className="text-[9px] font-black uppercase">{item ? STATUS_LABELS[item.status] || STATUS_LABELS.planned : 'Não escolhida'}</span></div>
                        {item ? <p className="mt-2 line-clamp-2 text-[10px] leading-relaxed opacity-80">{item.commitment || 'Próximo passo ainda não registrado'}</p> : null}
                      </div>;
                    })}
                  </div>
                </article>
              ))}
            </div>
          ) : assignmentsLoading || assignmentsError ? null : <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-gray-500">As escolhas dos alunos aparecerão aqui.</div>}
        </section>

      </div>
    );
  }

  if (!student?.id) {
    return <section className="rounded-[28px] border border-white/10 bg-[#111722] p-8 text-center text-sm text-gray-400">Não foi possível localizar o perfil do aluno para abrir as frentes.</section>;
  }

  return (
    <div className="space-y-6">
      <section className="newgears-major-panel rounded-[28px] border border-blue-400/20 bg-gradient-to-br from-[#111e34] via-[#141722] to-[#111722] p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200/75">Plano até o torneio</p><h2 className="mt-3 text-3xl font-black text-white">Reta final do torneio</h2><p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-300">Escolha até quatro frentes para assumir. Suas escolhas ficam registradas até o fim do torneio; em cada uma, combine um próximo passo e atualize seu progresso.</p></div>
          <div className="min-w-[150px] rounded-2xl border border-blue-300/20 bg-black/20 px-5 py-4"><p className="text-[9px] font-bold uppercase tracking-[0.15em] text-blue-100/70">Minhas escolhas</p><p className="mt-1 text-3xl font-black text-white">{ownSelectionCount}<span className="text-lg text-gray-400">/4</span></p><p className="mt-1 text-[10px] text-gray-400">válidas até o torneio</p></div>
        </div>
      </section>

      {assignmentLoadStatus}

      <section className="grid gap-4 xl:grid-cols-2">
        {FINAL_SPRINT_FRONTS.map((front) => {
          const FrontIcon = front.icon;
          const assignment = ownAssignments.find((item) => item.frontId === front.id);
          const isActive = Boolean(assignment && assignment.active !== false);
          const draft = drafts[front.id] || getAssignmentDraft(assignment);
          return (
            <article key={front.id} className={`rounded-[26px] border bg-[#141925] p-5 md:p-6 ${isActive ? 'border-white/15 shadow-[0_16px_40px_rgba(0,0,0,0.2)]' : 'border-white/8'}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3"><div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${front.tone}`}><FrontIcon size={20} /></div><div><h3 className="text-lg font-black text-white">{front.title}</h3><p className="mt-1 max-w-lg text-xs leading-relaxed text-gray-400">{front.description}</p></div></div>
                <button type="button" disabled={assignmentsLoading || assignmentsError || isActive || ownSelectionCount >= 4} onClick={() => onToggleFront(front.id)} className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition-colors disabled:cursor-default ${isActive ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200' : assignmentsLoading || assignmentsError || ownSelectionCount >= 4 ? 'border-white/5 bg-white/[0.02] text-gray-600' : 'border-blue-400/25 bg-blue-400/10 text-blue-100 hover:bg-blue-400/20'}`}>
                  {isActive ? <><Check size={14} /> Escolhida até o torneio</> : assignmentsLoading ? <><LoaderCircle size={14} className="animate-spin" /> Carregando</> : <><Flag size={14} /> Escolher frente</>}
                </button>
              </div>
              <div className="mt-4 rounded-2xl border border-white/5 bg-black/20 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500">Ideias para começar</p>
                <ul className="mt-2 grid gap-2 text-xs text-gray-300 sm:grid-cols-2">{front.examples.map((example) => <li key={example} className="flex gap-2"><span className="text-blue-300">•</span>{example}</li>)}</ul>
              </div>

              {isActive ? (
                <div className="mt-4 space-y-3 border-t border-white/8 pt-4">
                  <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_190px]">
                    <label className="space-y-1 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">Meu próximo passo<input disabled={savingFrontId === front.id} value={draft.commitment} onChange={(event) => updateDraft(front.id, 'commitment', event.target.value, assignment)} maxLength={240} className="mt-1 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm font-normal normal-case text-white outline-none focus:border-blue-400 disabled:opacity-60" placeholder="Uma entrega concreta para começar" /></label>
                    <label className="space-y-1 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">Status<select disabled={savingFrontId === front.id} value={draft.status} onChange={(event) => updateDraft(front.id, 'status', event.target.value, assignment)} className="mt-1 w-full rounded-xl border border-white/10 bg-[#111722] px-3 py-2.5 text-sm font-normal normal-case text-white outline-none focus:border-blue-400 disabled:opacity-60">{STATUS_OPTIONS.map((status) => <option key={status.id} value={status.id}>{status.label}</option>)}</select></label>
                  </div>
                  <label className="block space-y-1 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">Atualização recente<textarea disabled={savingFrontId === front.id} value={draft.progressNote} onChange={(event) => updateDraft(front.id, 'progressNote', event.target.value, assignment)} maxLength={1000} rows="3" className="mt-1 w-full resize-y rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm font-normal normal-case leading-relaxed text-white outline-none focus:border-blue-400 disabled:opacity-60" placeholder="O que você já fez, aprendeu ou precisa destravar?" /></label>
                  <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[10px] text-gray-500">Atualizado: {formatUpdatedAt(assignment.updatedAt || assignment.createdAt)} · escolha mantida até o torneio</p>{saveStates[front.id] === 'saved' ? <p role="status" className="mt-1 flex items-center gap-1 text-[10px] font-bold text-emerald-300"><CheckCircle2 size={12} />Alterações salvas.</p> : saveStates[front.id] === 'error' ? <p role="alert" className="mt-1 flex items-center gap-1 text-[10px] font-bold text-red-300"><AlertCircle size={12} />Não foi possível salvar. Confira a conexão e tente novamente.</p> : null}</div><button type="button" disabled={savingFrontId === front.id || assignmentsLoading || assignmentsError} onClick={() => handleSaveProgress(front.id, assignment)} className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2 text-xs font-black text-white hover:bg-blue-400 disabled:opacity-50"><ClipboardList size={13} />{savingFrontId === front.id ? <><LoaderCircle size={13} className="animate-spin" />Salvando...</> : saveStates[front.id] === 'error' ? 'Tentar novamente' : 'Salvar atualização'}</button></div>
                </div>
              ) : null}
            </article>
          );
        })}
      </section>
      <section className="rounded-2xl border border-white/8 bg-black/15 p-4 text-xs leading-relaxed text-gray-400">As escolhas permanecem no seu plano até o fim do torneio. Você pode atualizar o próximo passo, o status e o que já avançou em cada frente.</section>
    </div>
  );
}
