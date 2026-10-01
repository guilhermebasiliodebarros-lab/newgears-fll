import { useEffect, useMemo, useState } from 'react';
import { Bot, Check, ClipboardList, Flag, Lightbulb, Mic, Users, Wrench } from 'lucide-react';

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
  onToggleFront,
  onSaveProgress,
}) {
  const [drafts, setDrafts] = useState({});
  const [savingFrontId, setSavingFrontId] = useState(null);
  const [reportFrontFilter, setReportFrontFilter] = useState('all');
  const [reportStatusFilter, setReportStatusFilter] = useState('active');

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
  const activeAssignmentCount = assignments.filter((assignment) => assignment.active !== false).length;
  const activeStudentCount = new Set(assignments.filter((assignment) => assignment.active !== false).map((assignment) => String(assignment.studentId))).size;
  const completedAssignmentCount = assignments.filter((assignment) => assignment.active !== false && assignment.status === 'done').length;
  const filteredReportRows = assignments
    .filter((assignment) => reportFrontFilter === 'all' || assignment.frontId === reportFrontFilter)
    .filter((assignment) => reportStatusFilter === 'all' || (reportStatusFilter === 'active' ? assignment.active !== false : assignment.active === false))
    .sort((left, right) => {
      const byFront = FINAL_SPRINT_FRONTS.findIndex((front) => front.id === left.frontId) - FINAL_SPRINT_FRONTS.findIndex((front) => front.id === right.frontId);
      return byFront || `${left.studentName || ''}`.localeCompare(`${right.studentName || ''}`, 'pt-BR');
    });

  const handleExportReport = () => {
    const escapeCsvCell = (value) => `"${`${value ?? ''}`.replaceAll('"', '""').replaceAll('\r\n', '\n').replaceAll('\r', '\n')}"`;
    const headers = ['Aluno', 'Frente', 'Participacao', 'Status', 'Proximo passo', 'Atualizacao recente', 'Ultima alteracao'];
    const rows = filteredReportRows.map((assignment) => [
      assignment.studentName || 'Aluno',
      FINAL_SPRINT_FRONTS.find((front) => front.id === assignment.frontId)?.title || assignment.frontId,
      assignment.active === false ? 'Encerrada' : 'Ativa',
      STATUS_LABELS[assignment.status] || STATUS_LABELS.planned,
      assignment.commitment || '',
      assignment.progressNote || '',
      formatUpdatedAt(assignment.updatedAt || assignment.createdAt),
    ]);
    const csv = `\uFEFF${[headers, ...rows].map((row) => row.map(escapeCsvCell).join(';')).join('\r\n')}`;
    const objectUrl = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = `reta-final-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(objectUrl);
  };

  const updateDraft = (frontId, field, value, assignment) => {
    setDrafts((currentDrafts) => ({
      ...currentDrafts,
      [frontId]: { ...(currentDrafts[frontId] || getAssignmentDraft(assignment)), [field]: value },
    }));
  };

  const handleSaveProgress = async (frontId, assignment) => {
    const draft = drafts[frontId] || getAssignmentDraft(assignment);
    setSavingFrontId(frontId);
    try {
      await onSaveProgress(frontId, draft);
    } finally {
      setSavingFrontId(null);
    }
  };

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

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {FINAL_SPRINT_FRONTS.map((front) => {
            const FrontIcon = front.icon;
            const count = assignments.filter((assignment) => assignment.frontId === front.id && assignment.active !== false).length;
            return <div key={front.id} className={`rounded-2xl border p-4 ${front.tone}`}><div className="flex items-center justify-between"><FrontIcon size={18} /><span className="text-xl font-black">{count}</span></div><p className="mt-3 text-sm font-bold">{front.title}</p><p className="mt-1 text-[11px] opacity-75">aluno(s) nesta frente</p></div>;
          })}
        </section>

        <section className="overflow-hidden rounded-[24px] border border-white/10 bg-[#111722]">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/10 px-5 py-4">
            <div><h3 className="text-lg font-black text-white">Acompanhamento das frentes</h3><p className="mt-1 text-xs text-gray-400">Compromisso e atualização mais recente de cada participação.</p></div>
            <div className="flex flex-wrap gap-2">
              <select value={reportFrontFilter} onChange={(event) => setReportFrontFilter(event.target.value)} className="rounded-lg border border-white/10 bg-[#171d29] px-3 py-2 text-xs text-white"><option value="all">Todas as frentes</option>{FINAL_SPRINT_FRONTS.map((front) => <option key={front.id} value={front.id}>{front.title}</option>)}</select>
              <select value={reportStatusFilter} onChange={(event) => setReportStatusFilter(event.target.value)} className="rounded-lg border border-white/10 bg-[#171d29] px-3 py-2 text-xs text-white"><option value="active">Participações ativas</option><option value="all">Todas</option><option value="inactive">Participações encerradas</option></select>
              <button type="button" onClick={handleExportReport} className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-bold text-emerald-200 hover:bg-emerald-400/20">Baixar tabela CSV</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-xs">
              <thead className="bg-white/5 text-[10px] uppercase tracking-[0.14em] text-gray-400"><tr><th className="px-4 py-3">Aluno</th><th className="px-4 py-3">Frente</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Contribuição combinada</th><th className="px-4 py-3">Atualização</th><th className="px-4 py-3">Última alteração</th></tr></thead>
              <tbody>{filteredReportRows.map((assignment) => <tr key={assignment.id} className="border-t border-white/5 text-gray-300"><td className="px-4 py-3 font-bold text-white">{assignment.studentName || 'Aluno'}</td><td className="px-4 py-3">{FINAL_SPRINT_FRONTS.find((front) => front.id === assignment.frontId)?.title || assignment.frontId}</td><td className="px-4 py-3"><span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${assignment.active === false ? 'border-gray-500/20 bg-gray-500/10 text-gray-400' : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200'}`}>{assignment.active === false ? 'Encerrada' : STATUS_LABELS[assignment.status] || STATUS_LABELS.planned}</span></td><td className="max-w-[260px] whitespace-pre-wrap px-4 py-3">{assignment.commitment || 'Sem compromisso descrito'}</td><td className="max-w-[320px] whitespace-pre-wrap px-4 py-3">{assignment.progressNote || 'Sem atualização registrada'}</td><td className="px-4 py-3 text-gray-500">{formatUpdatedAt(assignment.updatedAt || assignment.createdAt)}</td></tr>)}</tbody>
            </table>
            {filteredReportRows.length === 0 ? <div className="p-10 text-center"><Users className="mx-auto text-gray-500" size={28} /><p className="mt-3 text-sm font-bold text-gray-300">Nenhuma participação neste filtro.</p><p className="mt-1 text-xs text-gray-500">As escolhas dos alunos aparecerão aqui.</p></div> : null}
          </div>
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
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200/75">Preparação para dezembro</p>
        <h2 className="mt-3 text-3xl font-black text-white">Reta final do torneio</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-300">Escolha uma ou mais frentes em que você pode contribuir agora. Combine um próximo passo, registre seu avanço e ajuste sua escolha se as prioridades mudarem.</p>
      </section>

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
                <button type="button" onClick={() => onToggleFront(front.id)} className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition-colors ${isActive ? 'border-white/10 bg-white/5 text-gray-300 hover:border-red-400/30 hover:bg-red-400/10 hover:text-red-200' : 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/20'}`}>
                  {isActive ? <><Check size={14} /> Estou participando</> : <><Flag size={14} /> Quero contribuir</>}
                </button>
              </div>
              <div className="mt-4 rounded-2xl border border-white/5 bg-black/20 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500">Ideias para começar</p>
                <ul className="mt-2 grid gap-2 text-xs text-gray-300 sm:grid-cols-2">{front.examples.map((example) => <li key={example} className="flex gap-2"><span className="text-blue-300">•</span>{example}</li>)}</ul>
              </div>

              {isActive ? (
                <div className="mt-4 space-y-3 border-t border-white/8 pt-4">
                  <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_190px]">
                    <label className="space-y-1 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">Meu próximo passo<input value={draft.commitment} onChange={(event) => updateDraft(front.id, 'commitment', event.target.value, assignment)} maxLength={240} className="mt-1 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm font-normal normal-case text-white outline-none focus:border-blue-400" placeholder="Uma entrega concreta para começar" /></label>
                    <label className="space-y-1 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">Status<select value={draft.status} onChange={(event) => updateDraft(front.id, 'status', event.target.value, assignment)} className="mt-1 w-full rounded-xl border border-white/10 bg-[#111722] px-3 py-2.5 text-sm font-normal normal-case text-white outline-none focus:border-blue-400">{STATUS_OPTIONS.map((status) => <option key={status.id} value={status.id}>{status.label}</option>)}</select></label>
                  </div>
                  <label className="block space-y-1 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">Atualização recente<textarea value={draft.progressNote} onChange={(event) => updateDraft(front.id, 'progressNote', event.target.value, assignment)} maxLength={1000} rows="3" className="mt-1 w-full resize-y rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm font-normal normal-case leading-relaxed text-white outline-none focus:border-blue-400" placeholder="O que você já fez, aprendeu ou precisa destravar?" /></label>
                  <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-[10px] text-gray-500">Atualizado: {formatUpdatedAt(assignment.updatedAt || assignment.createdAt)}</p><div className="flex gap-2"><button type="button" onClick={() => onToggleFront(front.id)} className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-gray-400 hover:text-white">Sair desta frente</button><button type="button" disabled={savingFrontId === front.id} onClick={() => handleSaveProgress(front.id, assignment)} className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2 text-xs font-black text-white hover:bg-blue-400 disabled:opacity-50"><ClipboardList size={13} />{savingFrontId === front.id ? 'Salvando...' : 'Salvar atualização'}</button></div></div>
                </div>
              ) : null}
            </article>
          );
        })}
      </section>
      <section className="rounded-2xl border border-white/8 bg-black/15 p-4 text-xs leading-relaxed text-gray-400">As prioridades podem mudar. Se você sair de uma frente, suas atualizações ficam guardadas.</section>
    </div>
  );
}
