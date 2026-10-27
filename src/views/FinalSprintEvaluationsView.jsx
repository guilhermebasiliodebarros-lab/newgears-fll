import { useMemo, useState } from 'react';
import { Check, ChevronDown, Save } from 'lucide-react';
import { buildEvaluationCalendar, FINAL_SPRINT_RANKING_CATEGORIES, PRESENTATION_EVALUATION_CRITERIA, WEEKLY_EVALUATION_CRITERIA, getFinalSprintEvaluationWeek, getFinalSprintEvaluationWeekForDate, getFinalSprintReportEvaluation, getFinalSprintTournamentRanking, parseFinalSprintReportScore } from '../utils/finalSprintEvaluations';
import useEvaluationDrafts from '../hooks/useEvaluationDrafts';
import EvaluationCalendar from '../components/EvaluationCalendar';
import StudentEvaluationProgress from '../components/StudentEvaluationProgress';

const SCORE_LABELS = ['Não demonstrou', 'Muito abaixo', 'Abaixo', 'Adequado', 'Bom', 'Excelente'];
const EMPTY_FEEDBACK = { strengths: '', improvement: '' };
const formatGrade = (value) => value === null ? 'Não lançada' : new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(value);
const formatRankPoints = (position) => `${position}º · ${position} ${position === 1 ? 'ponto' : 'pontos'}`;

const makeEmptyRatings = (criteria) => Object.fromEntries(criteria.map(({ id }) => [id, null]));
const getRatingTotal = (ratings, criteria) => {
  if (!ratings || !criteria.every(({ id }) => ratings[id] !== null && ratings[id] !== undefined && ratings[id] !== '')) return null;
  return criteria.reduce((total, { id }) => total + Number(ratings[id]), 0);
};

const RatingPicker = ({ criteria, ratings, onChange }) => (
  <div className="space-y-3">
    {criteria.map(({ id, label }) => (
      <div key={id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/5 bg-black/15 px-3 py-2.5">
        <span className="min-w-[155px] flex-1 text-xs font-bold text-gray-200">{label}</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4, 5].map((score) => (
            <button key={score} type="button" title={`${score} — ${SCORE_LABELS[score]}`} aria-label={`${label}: ${score} — ${SCORE_LABELS[score]}`} onClick={() => onChange(id, score)} className={`h-8 w-8 rounded-lg border text-xs font-black transition-colors ${Number(ratings?.[id]) === score && ratings?.[id] !== null && ratings?.[id] !== undefined ? 'border-amber-300 bg-amber-300 text-black' : 'border-white/10 bg-white/5 text-gray-300 hover:border-amber-300/40 hover:text-white'}`}>{score}</button>
          ))}
        </div>
      </div>
    ))}
  </div>
);

const FeedbackFields = ({ value, onChange, improvementRequired = true, maxLength = 600, rows = 3 }) => (
  <div className="grid gap-3 md:grid-cols-2">
    <label className="space-y-1 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">Ponto forte observado<textarea value={value.strengths || ''} onChange={(event) => onChange('strengths', event.target.value)} maxLength={maxLength} rows={rows} className="mt-1 w-full resize-y rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm font-normal normal-case leading-relaxed text-white outline-none focus:border-amber-300" placeholder="Uma atitude ou contribuição que merece ser reconhecida" /></label>
    <label className="space-y-1 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">Próximo ponto a melhorar{improvementRequired ? ' *' : ''}<textarea value={value.improvement || ''} onChange={(event) => onChange('improvement', event.target.value)} maxLength={maxLength} rows={rows} className="mt-1 w-full resize-y rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm font-normal normal-case leading-relaxed text-white outline-none focus:border-amber-300" placeholder="Uma orientação concreta para a próxima semana" /></label>
  </div>
);

export default function FinalSprintEvaluationsView({
  isTechnicalProfile = false,
  student,
  students = [],
  evaluations = [],
  selections = [],
  draftScope = 'legacy:technical',
  evaluationStartDate,
  pauseWeeks = [],
  selectionDraft,
  selectionReady = false,
  selectionLoadingError = false,
  onPublishSelection,
  onSaveWeekly,
  onSavePresentation,
  onSaveReport,
  onSaveSelection,
}) {
  const [section, setSection] = useState('weekly');
  const [selectedWeekId, setSelectedWeekId] = useState(() => getFinalSprintEvaluationWeek().id);
  const draftStorage = useEvaluationDrafts(isTechnicalProfile ? draftScope : `student:${draftScope}`);
  const { weekly: weeklyDrafts, presentation: presentationDrafts, report: reportDrafts } = draftStorage.drafts;
  const [calendarMonth, setCalendarMonth] = useState(() => getFinalSprintEvaluationWeek().id.slice(0, 7));
  const [onlyPendingStudents, setOnlyPendingStudents] = useState(false);
  const [progressStudentId, setProgressStudentId] = useState('');
  const [evaluationSaveStates, setEvaluationSaveStates] = useState({});
  const [reviewingPublication, setReviewingPublication] = useState(false);
  const [reportSaveStates, setReportSaveStates] = useState({});
  const [savingKey, setSavingKey] = useState('');
  const [selectionError, setSelectionError] = useState('');
  const currentWeek = getFinalSprintEvaluationWeek();
  const week = getFinalSprintEvaluationWeekForDate(selectedWeekId) || currentWeek;
  const previousWeek = getFinalSprintEvaluationWeek(-1);
  const previousWeekCount = new Set(evaluations.filter((item) => item.type === 'weekly' && item.weekId === previousWeek.id && item.status === 'complete').map((item) => String(item.studentId)));
  const previousPendingCount = students.filter((item) => item?.id && (!item.joinedAt || `${item.joinedAt}`.slice(0, 10) <= previousWeek.endDate) && !previousWeekCount.has(String(item.id))).length;
  const changeWeek = (value) => {
    const next = getFinalSprintEvaluationWeekForDate(value);
    if (next && next.id <= currentWeek.id) { setSelectedWeekId(next.id); setCalendarMonth(next.id.slice(0, 7)); }
  };
  const moveWeek = (offset) => changeWeek(getFinalSprintEvaluationWeek(offset, new Date(`${week.id}T12:00:00`)).id);

  const sortedStudents = useMemo(() => [...students].filter((item) => item?.id).sort((left, right) => `${left.name || ''}`.localeCompare(`${right.name || ''}`, 'pt-BR')), [students]);
  const weeklyEvaluations = evaluations.filter((item) => item.type === 'weekly');
  const presentationEvaluations = evaluations.filter((item) => item.type === 'presentation');
  const weeklyByStudent = new Map(weeklyEvaluations.filter((item) => item.weekId === week.id).map((item) => [String(item.studentId), item]));
  const presentationsByStudent = new Map(presentationEvaluations.map((item) => [String(item.studentId), item]));
  const selectionsByStudent = new Map(selections.map((item) => [String(item.studentId), item]));
  const reportsByStudent = new Map(evaluations.filter((item) => item.type === 'report').map((item) => [String(item.studentId), item]));
  const reportForStudent = (studentId) => getFinalSprintReportEvaluation(reportsByStudent.get(String(studentId)), selectionsByStudent.get(String(studentId)));
  const evaluatedReportCount = sortedStudents.filter((item) => parseFinalSprintReportScore(reportForStudent(item.id)?.total) !== null).length;
  const weeklyStudents = sortedStudents.filter((item) => !item.joinedAt || `${item.joinedAt}`.slice(0, 10) <= week.endDate);
  const completeWeeklyCount = weeklyStudents.filter((item) => weeklyByStudent.get(String(item.id))?.status === 'complete').length;
  const pendingWeeklyCount = weeklyStudents.length - completeWeeklyCount;
  const calendarWeeks = useMemo(() => buildEvaluationCalendar({ students, evaluations, startDate: evaluationStartDate, pauseWeeks, includeWeekId: selectedWeekId }), [students, evaluations, evaluationStartDate, pauseWeeks, selectedWeekId]);

  const weeklyDraftFor = (studentId, persisted) => weeklyDrafts[`${studentId}__${week.id}`] || {
    ratings: persisted?.ratings || makeEmptyRatings(WEEKLY_EVALUATION_CRITERIA),
    ...EMPTY_FEEDBACK,
    strengths: persisted?.strengths || '',
    improvement: persisted?.improvement || '',
  };
  const presentationDraftFor = (studentId, persisted) => presentationDrafts[studentId] || {
    ratings: persisted?.ratings || makeEmptyRatings(PRESENTATION_EVALUATION_CRITERIA),
    strengths: persisted?.strengths || '',
    improvement: persisted?.improvement || '',
    presentedAt: persisted?.presentedAt || new Date().toISOString().slice(0, 10),
  };
  const reportDraftFor = (studentId, persisted) => reportDrafts[studentId] || {
    score: persisted?.total ?? '',
    note: persisted?.note || '',
    strengths: persisted?.strengths || '',
    improvement: persisted?.improvement || '',
  };

  const updateWeeklyDraft = (studentId, update) => {
    const key = `${studentId}__${week.id}`;
    draftStorage.update('weekly', key, (current) => {
      const existing = current || weeklyDraftFor(studentId, weeklyByStudent.get(String(studentId)));
      return { ...existing, ...update, ...(update.ratings ? { ratings: { ...existing.ratings, ...update.ratings } } : {}) };
    });
    setEvaluationSaveStates((current) => ({ ...current, [key]: 'editing' }));
  };
  const updatePresentationDraft = (studentId, update) => {
    draftStorage.update('presentation', studentId, (current) => {
      const existing = current || presentationDraftFor(studentId, presentationsByStudent.get(String(studentId)));
      return { ...existing, ...update, ...(update.ratings ? { ratings: { ...existing.ratings, ...update.ratings } } : {}) };
    });
    setEvaluationSaveStates((current) => ({ ...current, [`presentation-${studentId}`]: 'editing' }));
  };
  const updateReportDraft = (studentId, field, value) => {
    draftStorage.update('report', studentId, (current) => ({ ...(current || reportDraftFor(studentId, reportForStudent(studentId))), [field]: value }));
    setReportSaveStates((current) => ({ ...current, [studentId]: 'editing' }));
  };

  const saveWeekly = async (studentItem) => {
    const draft = weeklyDraftFor(studentItem.id, weeklyByStudent.get(String(studentItem.id)));
    if (getRatingTotal(draft.ratings, WEEKLY_EVALUATION_CRITERIA) === null || !draft.improvement.trim()) return;
    const key = `weekly-${studentItem.id}`;
    setSavingKey(key);
    const draftKey = `${studentItem.id}__${week.id}`;
    try {
      const saved = await onSaveWeekly({ student: studentItem, week, draft });
      setEvaluationSaveStates((current) => ({ ...current, [draftKey]: saved === false ? 'error' : 'saved' }));
      if (saved !== false) draftStorage.remove('weekly', draftKey, draft);
    } catch { setEvaluationSaveStates((current) => ({ ...current, [draftKey]: 'error' })); }
    finally { setSavingKey(''); }
  };
  const savePresentation = async (studentItem) => {
    const draft = presentationDraftFor(studentItem.id, presentationsByStudent.get(String(studentItem.id)));
    if (getRatingTotal(draft.ratings, PRESENTATION_EVALUATION_CRITERIA) === null || !draft.improvement.trim()) return;
    const key = `presentation-${studentItem.id}`;
    setSavingKey(key);
    try {
      const saved = await onSavePresentation({ student: studentItem, draft });
      setEvaluationSaveStates((current) => ({ ...current, [key]: saved === false ? 'error' : 'saved' }));
      if (saved !== false) draftStorage.remove('presentation', studentItem.id, draft);
    } catch { setEvaluationSaveStates((current) => ({ ...current, [key]: 'error' })); }
    finally { setSavingKey(''); }
  };
  const saveReport = async (studentItem) => {
    const draft = reportDraftFor(studentItem.id, reportForStudent(studentItem.id));
    const score = parseFinalSprintReportScore(draft.score);
    if (score === null) {
      setReportSaveStates((current) => ({ ...current, [studentItem.id]: 'error' }));
      return;
    }
    setSavingKey(`report-${studentItem.id}`);
    try {
      const saved = await onSaveReport({ student: studentItem, draft: { ...draft, score } });
      setReportSaveStates((current) => ({ ...current, [studentItem.id]: saved === false ? 'error' : 'saved' }));
      if (saved !== false) draftStorage.remove('report', studentItem.id, draft);
    } catch {
      setReportSaveStates((current) => ({ ...current, [studentItem.id]: 'error' }));
    } finally { setSavingKey(''); }
  };
  const saveSelection = async (studentItem, changes = {}) => {
    const draft = { ...selectionsByStudent.get(String(studentItem.id)), ...changes };
    setSelectionError('');
    setSavingKey(`selection-${studentItem.id}`);
    try {
      const saved = await onSaveSelection({ student: studentItem, draft });
      if (saved === false) {
        setSelectionError('Não foi possível salvar. Confira a mensagem do sistema e tente novamente.');
      }
    } catch (error) {
      setSelectionError(error.message || 'Não foi possível salvar. Tente novamente.');
    } finally { setSavingKey(''); }
  };

  const continueDraft = ({ type, key }) => {
    const separator = type === 'weekly' ? key.lastIndexOf('__') : -1;
    const studentId = separator < 0 ? key : key.slice(0, separator);
    if (!sortedStudents.some((item) => String(item.id) === studentId)) return;
    setSection(type);
    setOnlyPendingStudents(false);
    if (type === 'weekly') changeWeek(key.slice(separator + 2));
    requestAnimationFrame(() => {
      const details = document.getElementById(`evaluation-${type}-${encodeURIComponent(key)}`);
      if (details) { details.open = true; details.scrollIntoView({ behavior: 'instant', block: 'center' }); }
    });
  };

  if (!isTechnicalProfile) {
    if (!student?.id) return <section className="rounded-2xl border border-white/10 bg-[#111722] p-8 text-center text-sm text-gray-400">Não foi possível localizar seu perfil.</section>;
    const ownWeekly = weeklyEvaluations.filter((item) => String(item.studentId) === String(student.id)).sort((left, right) => `${right.weekId || ''}`.localeCompare(`${left.weekId || ''}`));
    const ownPresentation = presentationEvaluations.find((item) => String(item.studentId) === String(student.id));
    const ownReport = reportForStudent(student.id);
    return <div className="space-y-5">
      <section className="newgears-major-panel rounded-[28px] border border-cyan-400/20 bg-gradient-to-br from-[#10232b] via-[#151922] to-[#111722] p-6 md:p-8"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200/75">Seu acompanhamento</p><h2 className="mt-3 text-3xl font-black text-white">Meu feedback</h2><p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-300">Veja as avaliações semanais, os pontos fortes e o próximo passo indicado pelo técnico.</p></section>
      <StudentEvaluationProgress key={student.id} studentId={student.id} studentName={student.name} evaluations={evaluations} />
      {ownReport?.status === 'complete' ? <ReportEvaluationResultCard record={ownReport} /> : <section className="rounded-2xl border border-white/10 bg-[#111722] p-5 text-sm text-gray-400">A nota e o feedback dos seus relatórios aparecerão aqui depois que forem registrados.</section>}
      {ownPresentation ? <EvaluationResultCard title="Apresentação final" subtitle={ownPresentation.presentedAt ? `Avaliada em ${new Intl.DateTimeFormat('pt-BR').format(new Date(`${ownPresentation.presentedAt}T12:00:00`))}` : 'Avaliação final'} criteria={PRESENTATION_EVALUATION_CRITERIA} record={ownPresentation} /> : <section className="rounded-2xl border border-white/10 bg-[#111722] p-5 text-sm text-gray-400">A avaliação da apresentação aparecerá aqui depois que for registrada.</section>}
      <section className="space-y-3"><div className="flex items-end justify-between"><div><h3 className="text-xl font-black text-white">Avaliações das semanas</h3><p className="mt-1 text-xs text-gray-400">Cada registro mostra a pontuação e o feedback daquela semana.</p></div><span className="text-xs text-gray-500">{ownWeekly.length} registro(s)</span></div>{ownWeekly.map((record) => <EvaluationResultCard key={record.id} title={record.weekLabel || `Semana de ${record.weekId}`} subtitle={record.updatedAt ? `Atualizado em ${new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(new Date(record.updatedAt))}` : ''} criteria={WEEKLY_EVALUATION_CRITERIA} record={record} />)}{ownWeekly.length === 0 ? <div className="rounded-2xl border border-white/10 bg-[#111722] p-8 text-center text-sm text-gray-400">Sua primeira avaliação semanal aparecerá aqui.</div> : null}</section>
    </div>;
  }

  const selectionRows = getFinalSprintTournamentRanking({ students: sortedStudents, evaluations, selections });
  const topSixRows = selectionRows.filter((row) => row.inTopSix);
  const hasCutoffTie = selectionRows.some((row) => row.inCutoffTie);
  const draftStudentIds = selectionDraft?.studentIds || selections.filter((item) => item.selectedForTournament === true).map((item) => String(item.studentId));
  const selectedCount = draftStudentIds.length;
  const publishedIds = selections.filter((item) => item.selectedForTournament === true).map((item) => String(item.studentId));
  const hasUnpublishedChanges = JSON.stringify([...draftStudentIds].sort()) !== JSON.stringify([...publishedIds].sort());
  const selectedNames = draftStudentIds.map((id) => sortedStudents.find((item) => String(item.id) === id) || { id, name: selectionsByStudent.get(id)?.studentName || 'Aluno indisponível' });
  const publishSelection = async () => {
    setSavingKey('publish'); setSelectionError('');
    try {
      const saved = await onPublishSelection({ studentIds: draftStudentIds, revision: selectionDraft?.revision || 0 });
      if (saved === false) setSelectionError('A convocação não foi divulgada. Confira a mensagem do sistema e tente novamente.');
      else setReviewingPublication(false);
    } catch (error) { setSelectionError(error.message || 'Não foi possível divulgar. Tente novamente.'); }
    finally { setSavingKey(''); }
  };
  const handleExportReadinessReport = () => {
    const escapeCsvCell = (value) => `"${`${value ?? ''}`.replaceAll('"', '""').replaceAll('\r\n', '\n').replaceAll('\r', '\n')}"`;
    const headers = ['Posição geral', 'Aluno', 'Nota do relatório /10', 'Análise dos relatórios', 'Pontos fortes dos relatórios', 'Melhorias dos relatórios', 'Posição no relatório', 'Soma das avaliações semanais', 'Semanas avaliadas', 'Posição nas semanais', 'Nota da apresentação final /35', 'Posição na apresentação final', 'XP atual (referência)', 'Posição no ranking XP', 'Soma das posições (menor é melhor)', 'Empate na classificação', 'Empate pela sexta vaga', 'Na lista em preparação', 'Convocação divulgada'];
    const rows = selectionRows.map((row) => [
      row.position,
      row.student.name || 'Aluno',
      row.values.report ?? '',
      row.reportEvaluation?.note || '',
      row.reportEvaluation?.strengths || '',
      row.reportEvaluation?.improvement || '',
      row.positions.report,
      row.values.weekly ?? '',
      row.weeklyCount,
      row.positions.weekly,
      row.values.presentation ?? '',
      row.positions.presentation,
      row.values.xp,
      row.positions.xp,
      row.score,
      row.tied ? 'Sim' : 'Não',
      row.inCutoffTie ? 'Sim' : 'Não',
      draftStudentIds.includes(String(row.student.id)) ? 'Sim' : 'Não',
      row.selection?.selectedForTournament === true ? 'Sim' : 'Não',
    ]);
    const csv = `\uFEFF${[headers, ...rows].map((row) => row.map(escapeCsvCell).join(';')).join('\r\n')}`;
    const objectUrl = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = `prontidao-torneio-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  };

  return <div className="space-y-5">
    <section className="newgears-major-panel rounded-[28px] border border-amber-400/20 bg-gradient-to-br from-[#241d12] via-[#171922] to-[#111722] p-6 md:p-8"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-200/75">Ciclo de avaliação</p><h2 className="mt-3 text-3xl font-black text-white">Acompanhamento da reta final</h2><p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-300">Registre o que observou, dê uma orientação concreta e acompanhe a prontidão para o torneio.</p></div><div className="rounded-2xl border border-amber-300/20 bg-black/20 px-4 py-3"><p className="text-[9px] font-bold uppercase tracking-[0.15em] text-amber-100/60">Avaliações da semana</p><p className="mt-1 text-2xl font-black text-white">{completeWeeklyCount}/{weeklyStudents.length}</p><p className="mt-1 text-[10px] text-gray-400">{week.label}</p><p className="mt-1 text-[10px] text-amber-100/70">{week.isFriday ? (pendingWeeklyCount ? `Hoje é sexta: faltam ${pendingWeeklyCount}.` : 'Sexta-feira: equipe avaliada.') : `${pendingWeeklyCount} pendente(s) na semana selecionada.`}</p></div></div></section>

    {draftStorage.storageError ? <p role="alert" className="rounded-xl border border-rose-300/25 bg-rose-300/10 p-4 text-xs text-rose-100">Não foi possível guardar o rascunho neste navegador. Mantenha esta página aberta e finalize em Salvar avaliação para não perder o preenchimento.</p> : <p role="status" className="text-xs text-gray-400">Rascunhos são guardados automaticamente neste navegador. As notas só entram no acompanhamento após salvar a avaliação.</p>}
    {Object.values(evaluationSaveStates).includes('error') ? <p role="alert" className="rounded-xl border border-rose-300/25 bg-rose-300/10 p-4 text-xs text-rose-100">Uma avaliação não foi enviada. Seu preenchimento foi mantido; tente salvar novamente.</p> : null}
    {draftStorage.restored.length ? <details open className="rounded-2xl border border-cyan-300/25 bg-cyan-300/5 p-4"><summary className="cursor-pointer text-sm font-black text-cyan-100">Rascunhos recuperados · {draftStorage.restored.length}</summary><div className="mt-3 flex flex-wrap gap-2">{draftStorage.restored.map((entry) => {
      const studentId = entry.type === 'weekly' ? entry.key.slice(0, entry.key.lastIndexOf('__')) : entry.key;
      const person = sortedStudents.find((item) => String(item.id) === studentId);
      const label = entry.type === 'weekly' ? `Semana de ${entry.key.slice(-10).split('-').reverse().join('/')}` : entry.type === 'report' ? 'Relatórios' : 'Apresentação';
      return <div key={`${entry.type}:${entry.key}`} className="rounded-xl border border-cyan-300/15 bg-black/20 p-3 text-xs text-gray-200"><p>{person?.name || 'Aluno indisponível'} · {label}</p><div className="mt-2 flex gap-3"><button type="button" disabled={!person} onClick={() => continueDraft(entry)} className="font-bold text-cyan-100 disabled:opacity-30">Continuar avaliação</button><button type="button" onClick={() => draftStorage.remove(entry.type, entry.key)} className="text-gray-400">Descartar rascunho</button></div></div>;
    })}</div></details> : null}

    <div className="flex flex-wrap gap-2">{[['weekly', 'Avaliação semanal'], ['report', 'Avaliação dos relatórios'], ['presentation', 'Apresentação final'], ['evolution', 'Evolução individual'], ['selection', 'Prontidão para o torneio']].map(([id, label]) => <button key={id} type="button" onClick={() => setSection(id)} className={`rounded-xl border px-4 py-2.5 text-xs font-black ${section === id ? 'border-amber-300 bg-amber-300 text-black' : 'border-white/10 bg-white/5 text-gray-300 hover:text-white'}`}>{label}</button>)}</div>

    {section === 'evolution' ? <div className="space-y-4"><label className="block text-xs font-bold text-gray-300">Aluno<select aria-label="Aluno da evolução individual" value={progressStudentId || sortedStudents[0]?.id || ''} onChange={(event) => setProgressStudentId(event.target.value)} className="mt-2 block w-full max-w-md rounded-xl border border-white/15 bg-[#111722] p-3 text-sm text-white">{sortedStudents.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>{sortedStudents.length ? <StudentEvaluationProgress key={progressStudentId || sortedStudents[0].id} studentId={progressStudentId || sortedStudents[0].id} studentName={sortedStudents.find((item) => String(item.id) === String(progressStudentId || sortedStudents[0].id))?.name} evaluations={evaluations} /> : <p className="text-sm text-gray-400">Cadastre alunos para acompanhar a evolução.</p>}</div> : null}

    {section === 'report' ? <div className="space-y-4">
      <section className="rounded-2xl border border-violet-300/20 bg-gradient-to-br from-violet-400/10 to-[#111722] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><h3 className="text-lg font-black text-white">Avaliação individual dos relatórios</h3><p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-300">Abra o nome de cada aluno para analisar os relatórios que você tem, registrar a nota e escrever um feedback detalhado sobre sua evolução.</p></div>
          <span className="rounded-xl border border-violet-300/20 bg-black/20 px-4 py-3 text-sm font-black text-violet-100">{evaluatedReportCount}/{sortedStudents.length} avaliados</span>
        </div>
        <p className="mt-3 text-xs text-gray-400">Ao salvar, a nota atualiza o ranking da prontidão e o aluno pode consultar a avaliação em Meu feedback.</p>
      </section>
      <div className="space-y-3">{sortedStudents.map((studentItem) => {
        const id = String(studentItem.id);
        const saved = reportForStudent(id);
        const draft = reportDraftFor(id, saved);
        const savedScore = parseFinalSprintReportScore(saved?.total);
        const score = parseFinalSprintReportScore(draft.score);
        const key = `report-${id}`;
        const saveState = reportSaveStates[id];
        return <details key={id} id={`evaluation-report-${encodeURIComponent(id)}`} className="group rounded-2xl border border-white/10 bg-[#111722] open:border-violet-300/30">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5">
            <div className="min-w-0"><p className="truncate text-sm font-black text-white">{studentItem.name || 'Aluno'}</p><p className="mt-1 text-[10px] text-gray-400">{savedScore === null ? 'Aguardando avaliação dos relatórios' : `Nota registrada: ${formatGrade(savedScore)}/10`}{saveState === 'editing' ? ' · alterações não salvas' : ''}</p></div>
            <div className="flex shrink-0 items-center gap-3">{savedScore === null ? <span className="rounded-full border border-violet-300/20 bg-violet-300/10 px-2 py-1 text-[9px] font-black uppercase text-violet-100">Avaliar</span> : <Check size={16} className="text-emerald-300" />}<ChevronDown size={15} className="text-gray-500 transition-transform group-open:rotate-180" /></div>
          </summary>
          <form onSubmit={(event) => { event.preventDefault(); saveReport(studentItem); }} className="border-t border-white/10 p-5">
            <fieldset disabled={Boolean(savingKey)} className="space-y-5 disabled:opacity-60">
              <DraftStatus draft={reportDrafts[id]} storageError={draftStorage.storageError} />
              <div className="flex flex-wrap items-start justify-between gap-4">
                <label className="block max-w-xs text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">Nota dos relatórios · de 0 a 10 *<input type="number" required min="0" max="10" step="0.01" value={draft.score} onChange={(event) => updateReportDraft(id, 'score', event.target.value)} placeholder="Ex.: 8,5" className="mt-2 w-full rounded-xl border border-violet-300/20 bg-black/25 px-4 py-3 text-xl font-black text-white outline-none focus:border-violet-300" /></label>
                <p className="max-w-md text-xs leading-relaxed text-gray-400">Considere o conjunto dos relatórios desse aluno. Use os campos abaixo para registrar exemplos, explicar a nota e orientar os próximos passos.</p>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">Análise dos relatórios e evolução do aluno<textarea value={draft.note} onChange={(event) => updateReportDraft(id, 'note', event.target.value)} maxLength={6000} rows={8} placeholder="Descreva o que o aluno realizou, como registrou os aprendizados, quais mudanças apareceram entre os relatórios e que evidências sustentam a nota." className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm font-normal normal-case leading-relaxed text-white outline-none focus:border-violet-300" /></label>
                <p className="mt-1 text-right text-[10px] text-gray-500">{draft.note.length}/6000 caracteres</p>
              </div>
              <FeedbackFields value={draft} onChange={(field, value) => updateReportDraft(id, field, value)} improvementRequired={false} maxLength={3000} rows={5} />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-gray-400">{saveState === 'saved' ? <p role="status" className="font-bold text-emerald-200">Avaliação e feedback salvos.</p> : saveState === 'error' ? <p role="alert" className="font-bold text-red-200">Não foi possível salvar. Sua escrita foi mantida; tente novamente.</p> : saveState === 'editing' ? <p>Alterações ainda não salvas.</p> : <p>A nota e o feedback serão disponibilizados ao aluno ao salvar.</p>}</div>
                <button type="submit" disabled={Boolean(savingKey) || score === null} className="inline-flex items-center gap-2 rounded-xl bg-violet-300 px-5 py-3 text-xs font-black text-black disabled:cursor-not-allowed disabled:opacity-40"><Save size={14} />{savingKey === key ? 'Salvando...' : 'Salvar avaliação dos relatórios'}</button>
              </div>
            </fieldset>
          </form>
        </details>;
      })}</div>
      {sortedStudents.length === 0 ? <p className="rounded-2xl border border-white/10 bg-[#111722] p-8 text-center text-sm text-gray-400">Cadastre os alunos para avaliar seus relatórios.</p> : null}
    </div> : null}

    {section === 'weekly' ? <div className="space-y-4">
      <EvaluationCalendar weeks={calendarWeeks} selectedWeekId={week.id} month={calendarMonth} onMonthChange={setCalendarMonth} onSelectWeek={changeWeek} />
      <section className="space-y-4 rounded-2xl border border-amber-300/20 bg-[#111722] p-4 md:p-5">
        <div><h3 className="text-lg font-black text-white">{week.isCurrent ? 'Avaliação desta semana' : 'Avaliação de semana anterior'}</h3><p className="mt-1 text-sm font-bold text-amber-100" aria-live="polite">{week.label} · {completeWeeklyCount}/{weeklyStudents.length} avaliados</p><p className="mt-2 text-xs leading-relaxed text-gray-400">Esqueceu de lançar uma nota? Escolha qualquer data da semana desejada. Você pode preencher ou corrigir as avaliações mesmo depois que a semana terminou.</p></div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-xs font-bold text-gray-300">Semana da avaliação<input type="date" value={week.id} max={currentWeek.endDate} disabled={Boolean(savingKey)} onChange={(event) => changeWeek(event.target.value)} className="mt-1 block rounded-xl border border-white/15 bg-black/25 px-3 py-2 text-sm text-white [color-scheme:dark]" /></label>
          <button type="button" disabled={Boolean(savingKey)} onClick={() => moveWeek(-1)} className="rounded-xl border border-white/15 px-3 py-2 text-xs font-bold text-gray-200 disabled:opacity-40">← Semana anterior</button>
          <button type="button" disabled={Boolean(savingKey) || week.isCurrent} onClick={() => moveWeek(1)} className="rounded-xl border border-white/15 px-3 py-2 text-xs font-bold text-gray-200 disabled:opacity-40">Próxima semana →</button>
          {!week.isCurrent ? <button type="button" disabled={Boolean(savingKey)} onClick={() => changeWeek(currentWeek.id)} className="rounded-xl border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-xs font-bold text-amber-100 disabled:opacity-40">Voltar à atual</button> : null}
        </div>
        {!week.isCurrent ? <p role="status" className="rounded-xl border border-amber-300/15 bg-amber-300/10 p-3 text-xs text-amber-100">As notas salvas aqui pertencem a {week.label.toLowerCase()}. As avaliações da semana atual continuam separadas.</p> : null}
        {week.isCurrent && previousPendingCount > 0 ? <button type="button" disabled={Boolean(savingKey)} onClick={() => changeWeek(previousWeek.id)} className="w-full rounded-xl border border-amber-300/25 bg-amber-300/10 p-3 text-left text-xs font-bold text-amber-100 disabled:opacity-40">Semana passada: {previousPendingCount} avaliação(ões) pendente(s). Clique para lançar →</button> : null}
        <label className="flex items-center gap-2 text-xs text-gray-300"><input type="checkbox" checked={onlyPendingStudents} onChange={(event) => setOnlyPendingStudents(event.target.checked)} />Mostrar somente alunos ainda não avaliados nesta semana</label>
        <p className="text-[10px] text-gray-500">5 critérios · máximo 25 pontos · rascunhos recuperados mesmo após fechar ou atualizar a página.</p>
      </section>
      <div className="grid gap-3 xl:grid-cols-2">{weeklyStudents.filter((item) => !onlyPendingStudents || weeklyByStudent.get(String(item.id))?.status !== 'complete').map((studentItem) => {
        const id = String(studentItem.id);
        const saved = weeklyByStudent.get(id);
        const draft = weeklyDraftFor(id, saved);
        const total = getRatingTotal(draft.ratings, WEEKLY_EVALUATION_CRITERIA);
        const isSaved = saved?.status === 'complete';
        const key = `weekly-${studentItem.id}`;
        return <details key={`${id}__${week.id}`} id={`evaluation-weekly-${encodeURIComponent(`${id}__${week.id}`)}`} className="group rounded-2xl border border-white/10 bg-[#111722] open:border-amber-300/25"><summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4"><div className="min-w-0"><p className="truncate text-sm font-black text-white">{studentItem.name || 'Aluno'}</p><p className="mt-1 text-[10px] text-gray-500">{isSaved ? `Avaliado · ${saved.total ?? total}/25` : 'Pendente nesta semana'}</p></div><div className="flex items-center gap-2">{isSaved ? <Check size={16} className="text-emerald-300" /> : <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2 py-1 text-[9px] font-black uppercase text-amber-100">Avaliar</span>}<ChevronDown size={15} className="text-gray-500 transition-transform group-open:rotate-180" /></div></summary><div className="space-y-4 border-t border-white/8 p-4"><DraftStatus draft={weeklyDrafts[`${id}__${week.id}`]} storageError={draftStorage.storageError} /><RatingPicker criteria={WEEKLY_EVALUATION_CRITERIA} ratings={draft.ratings} onChange={(criterion, score) => updateWeeklyDraft(id, { ratings: { [criterion]: score } })} /><FeedbackFields value={draft} onChange={(field, value) => updateWeeklyDraft(id, { [field]: value })} /><div className="flex items-center justify-between gap-3"><p className="text-xs font-black text-gray-300">Pontuação: {total === null ? '—' : `${total}/25`}</p><button type="button" disabled={savingKey === key || total === null || !draft.improvement.trim()} onClick={() => saveWeekly(studentItem)} className="inline-flex items-center gap-2 rounded-xl bg-amber-300 px-4 py-2.5 text-xs font-black text-black disabled:opacity-40"><Save size={13} />{savingKey === key ? 'Salvando...' : 'Salvar avaliação'}</button></div></div></details>;
      })}</div>
    </div> : null}

    {section === 'presentation' ? <div className="space-y-4"><section className="rounded-2xl border border-white/10 bg-[#111722] p-4"><h3 className="text-sm font-black text-white">Avaliação da apresentação para a escola</h3><p className="mt-1 text-xs text-gray-400">Registre uma avaliação final individual para cada aluno que participou.</p></section><div className="grid gap-3 xl:grid-cols-2">{sortedStudents.map((studentItem) => {
      const id = String(studentItem.id);
      const saved = presentationsByStudent.get(id);
      const draft = presentationDraftFor(id, saved);
      const total = getRatingTotal(draft.ratings, PRESENTATION_EVALUATION_CRITERIA);
      const key = `presentation-${studentItem.id}`;
      return <details key={id} id={`evaluation-presentation-${encodeURIComponent(id)}`} className="group rounded-2xl border border-white/10 bg-[#111722] open:border-cyan-300/25"><summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4"><div><p className="text-sm font-black text-white">{studentItem.name || 'Aluno'}</p><p className="mt-1 text-[10px] text-gray-500">{saved?.status === 'complete' ? `Avaliado · ${saved.total ?? total}/35` : 'Aguardando apresentação'}</p></div><ChevronDown size={15} className="text-gray-500 transition-transform group-open:rotate-180" /></summary><div className="space-y-4 border-t border-white/8 p-4"><label className="block max-w-xs space-y-1 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">Data da apresentação<input type="date" value={draft.presentedAt || ''} onChange={(event) => updatePresentationDraft(id, { presentedAt: event.target.value })} className="mt-1 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-white" /></label><DraftStatus draft={presentationDrafts[id]} storageError={draftStorage.storageError} /><RatingPicker criteria={PRESENTATION_EVALUATION_CRITERIA} ratings={draft.ratings} onChange={(criterion, score) => updatePresentationDraft(id, { ratings: { [criterion]: score } })} /><FeedbackFields value={draft} onChange={(field, value) => updatePresentationDraft(id, { [field]: value })} /><div className="flex items-center justify-between gap-3"><p className="text-xs font-black text-gray-300">Pontuação: {total === null ? '—' : `${total}/35`}</p><button type="button" disabled={savingKey === key || total === null || !draft.improvement.trim()} onClick={() => savePresentation(studentItem)} className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-4 py-2.5 text-xs font-black text-black disabled:opacity-40"><Save size={13} />{savingKey === key ? 'Salvando...' : 'Salvar apresentação'}</button></div></div></details>;
    })}</div></div> : null}

    {section === 'selection' ? <div className="space-y-4">
      <section className="space-y-4 rounded-2xl border border-cyan-300/25 bg-[#111722] p-5">
        <div><h3 className="text-lg font-black text-white">Lista em preparação</h3><p className="mt-2 text-xs leading-relaxed text-gray-300">Marcar ou retirar um aluno altera somente esta lista. A convocação oficial, o pop-up e os fogos só mudam depois de divulgar.</p></div>
        {selectionLoadingError ? <p role="alert" className="text-xs text-rose-200">Não foi possível carregar a lista em preparação. Recarregue a página para tentar novamente.</p> : !selectionReady ? <p role="status" className="text-xs text-gray-400">Carregando lista e convocação oficial…</p> : null}
        <div className="flex flex-wrap gap-2">{selectedNames.map((person) => <span key={person.id} className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 py-2 pl-3 pr-2 text-xs text-cyan-100">{person.name}<button type="button" aria-label={`Retirar ${person.name} da lista em preparação`} disabled={Boolean(savingKey) || !selectionReady} onClick={() => saveSelection(person, { selectedForTournament: false })} className="rounded-full px-2 font-black disabled:opacity-30">×</button></span>)}{!selectedCount ? <p className="text-xs text-gray-400">Escolha os integrantes na coluna Torneio abaixo.</p> : null}</div>
        <p className="text-xs text-gray-400">Convocação oficial: {publishedIds.length ? publishedIds.map((id) => sortedStudents.find((item) => String(item.id) === id)?.name || selectionsByStudent.get(id)?.studentName || 'Aluno').join(', ') : 'ainda não divulgada'}.</p>
        <div className="flex flex-wrap items-center gap-3"><button type="button" disabled={!selectionReady || Boolean(savingKey) || (!selectedCount && !publishedIds.length) || (!hasUnpublishedChanges && publishedIds.length > 0)} onClick={() => setReviewingPublication(true)} className="rounded-xl bg-cyan-300 px-5 py-3 text-xs font-black text-black disabled:cursor-not-allowed disabled:opacity-40">{selectedCount ? 'Divulgar convocação' : 'Retirar convocação oficial'}</button><span className="text-xs text-gray-400">{hasUnpublishedChanges ? 'Há alterações ainda não divulgadas.' : publishedIds.length ? 'A lista corresponde à convocação oficial.' : 'Nenhum aluno será avisado antes da divulgação.'}</span></div>
        {reviewingPublication ? <div className="space-y-3 rounded-xl border border-amber-300/30 bg-amber-300/10 p-4"><h4 className="text-sm font-black text-amber-100">Revise antes de divulgar</h4><p className="text-xs text-gray-200">{selectedCount ? `Participantes: ${selectedNames.map((person) => person.name).join(', ')}.` : 'A lista está vazia. Confirmar retira a convocação oficial de todos os participantes.'}</p><p className="text-xs text-gray-300">Ao confirmar, esta lista passa a ser oficial. Os novos convocados recebem a mensagem ao entrar ou enquanto estiverem conectados.</p><div className="flex flex-wrap gap-2"><button type="button" disabled={Boolean(savingKey) || !selectionReady || (!selectedCount && !publishedIds.length)} onClick={publishSelection} className="rounded-lg bg-amber-300 px-4 py-2 text-xs font-black text-black disabled:opacity-40">{savingKey === 'publish' ? 'Salvando…' : selectedCount ? 'Confirmar divulgação' : 'Confirmar retirada'}</button><button type="button" disabled={Boolean(savingKey)} onClick={() => setReviewingPublication(false)} className="rounded-lg border border-white/15 px-4 py-2 text-xs text-gray-200">Continuar preparando</button></div></div> : null}
      </section>
      <section className="rounded-2xl border border-white/10 bg-[#111722] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h3 className="text-sm font-black text-white">Prontidão e seleção do torneio</h3><p className="mt-1 text-xs text-gray-300">Some as posições de cada categoria. Quanto menos pontos, melhor a classificação.</p></div>
          <div className="flex flex-wrap items-center gap-2"><div className="rounded-xl border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-xs font-black text-amber-100">Selecionados: {selectedCount}/6</div><button type="button" onClick={handleExportReadinessReport} className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-bold text-emerald-100 hover:bg-emerald-400/20">Baixar relatório CSV</button></div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-bold text-amber-100">{FINAL_SPRINT_RANKING_CATEGORIES.map(({ id, label }, index) => <span key={id} className="inline-flex items-center gap-2">{index > 0 ? <span className="text-gray-500">+</span> : null}<span className="rounded-lg border border-amber-300/15 bg-amber-300/5 px-3 py-2">Posição · {label}</span></span>)}<span className="text-gray-500">=</span><span className="rounded-lg bg-amber-300 px-3 py-2 text-black">Total de pontos ↑</span></div>
        <p className="mt-3 text-xs leading-relaxed text-gray-300">Em cada categoria, o maior resultado fica em 1º e soma 1 ponto; o 2º soma 2 pontos, e assim por diante. Nas semanais, o resultado é a soma de todas as avaliações. No XP, entra a posição exibida no Ranking XP.</p>
        <p className="mt-2 text-[10px] leading-relaxed text-gray-400">Notas iguais compartilham a posição na categoria (1º, 1º, 3º). Sem nota lançada, o aluno recebe a última posição daquela categoria ({sortedStudents.length} pontos). Empates no total ficam para sua decisão; os nomes apenas organizam a exibição dos empatados.</p>
        <p className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-gray-300">Exemplo: 1º no XP + 2º nas semanais + 5º na apresentação + 3º no relatório = <strong className="text-white">11 pontos</strong>.</p>
      </section>
      {selectionError ? <p role="alert" className="rounded-xl border border-red-300/20 bg-red-300/10 p-3 text-xs text-red-100">{selectionError}</p> : null}
      {hasCutoffTie ? <p role="status" className="rounded-xl border border-amber-300/25 bg-amber-300/10 p-4 text-xs leading-relaxed text-amber-100">Há empate envolvendo a sexta vaga. Todos os envolvidos estão destacados abaixo; escolha quem vai ao torneio na coluna Torneio, respeitando o limite de seis alunos.</p> : null}
      <section className="rounded-2xl border border-emerald-300/20 bg-gradient-to-br from-emerald-400/10 to-[#111722] p-4 md:p-5" aria-labelledby="top-six-readiness-title">
        <h3 id="top-six-readiness-title" className="text-lg font-black text-white">Primeiras posições · 6 vagas para o torneio</h3>
        <p className="mt-1 text-xs text-gray-400">Do menor total para o maior, atualizado conforme as notas são salvas. Empatados na disputa por uma vaga aparecem juntos.</p>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {topSixRows.map((row) => <li key={row.student.id} className={`rounded-2xl border bg-black/20 p-4 ${row.inCutoffTie ? 'border-amber-300/40' : 'border-emerald-300/15'}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-[0.12em] text-emerald-200">{row.position}º lugar{row.tied ? ' · empate' : ''}</p><p className="mt-1 truncate text-sm font-black text-white" title={row.student.name}>{row.student.name || 'Aluno'}</p></div>
              <p className="shrink-0 text-xl font-black text-emerald-100">{row.score}<span className="text-[10px] font-normal text-gray-400"> pontos</span></p>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
              {FINAL_SPRINT_RANKING_CATEGORIES.map(({ id, label }) => <div key={id} className="flex justify-between gap-2"><dt className="text-gray-400">{label}</dt><dd className="font-bold text-gray-200">{row.positions[id]}º · {row.positions[id]} pts</dd></div>)}
            </dl>
            <p className="mt-3 text-[10px] font-bold text-gray-300">{FINAL_SPRINT_RANKING_CATEGORIES.map(({ id }) => row.positions[id]).join(' + ')} = {row.score} pontos</p>
            {row.inCutoffTie ? <p className="mt-2 text-[10px] font-bold text-amber-200">Empate pela vaga · decisão do técnico</p> : null}
          </li>)}
        </ol>
        {topSixRows.length === 0 ? <p className="mt-4 text-sm text-gray-400">Cadastre alunos para acompanhar o ranking.</p> : null}
      </section>
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#111722]">
        <table className="w-full min-w-[1000px] text-left text-xs">
          <thead className="bg-white/5 text-[9px] uppercase tracking-[0.12em] text-gray-400"><tr><th className="px-3 py-3">Pos. geral</th><th className="px-3 py-3">Aluno</th><th className="px-3 py-3">Relatório · nota /10</th><th className="px-3 py-3">Semanais · soma</th><th className="px-3 py-3">Apresentação final /35</th><th className="px-3 py-3">Ranking XP</th><th className="px-3 py-3" aria-sort="ascending">Soma das posições ↑</th><th className="px-3 py-3">Torneio</th></tr></thead>
          <tbody>{selectionRows.map((row) => {
            const id = String(row.student.id);

            const selected = draftStudentIds.includes(id);
            const isTopSix = row.inTopSix;
            return <tr key={id} className={`border-t border-white/5 ${row.inCutoffTie ? 'bg-amber-300/[0.07]' : isTopSix ? 'bg-emerald-400/[0.07]' : ''}`}>
              <td className={`px-3 py-3 font-black ${isTopSix ? 'text-emerald-200' : 'text-gray-400'}`}>{row.position}º{row.tied ? <span className="mt-1 block text-[9px] font-normal text-amber-200">Empate</span> : null}</td>
              <td className="px-3 py-3 font-bold text-white">{row.student.name || 'Aluno'}{row.inCutoffTie ? <span className="mt-1 block text-[9px] text-amber-200">Decidir vaga</span> : isTopSix ? <span className="ml-2 inline-block rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2 py-0.5 text-[9px] font-black text-emerald-100">Top 6</span> : null}</td>
              <td className="px-3 py-3">
                <p className="font-bold text-cyan-200">{formatRankPoints(row.positions.report)}</p>
                <p className="mt-1 text-[10px] text-gray-400">Nota: {formatGrade(row.values.report)}{row.values.report !== null ? '/10' : ''}</p>
              </td>
              <td className="px-3 py-3"><p className="font-bold text-cyan-200">{formatRankPoints(row.positions.weekly)}</p><p className="mt-1 text-[10px] text-gray-400">Soma das notas: {formatGrade(row.values.weekly)}</p><p className="mt-1 text-[9px] text-gray-500">{row.weeklyCount} semana(s) avaliada(s)</p></td>
              <td className="px-3 py-3"><p className="font-bold text-cyan-200">{formatRankPoints(row.positions.presentation)}</p><p className="mt-1 text-[10px] text-gray-400">Nota: {formatGrade(row.values.presentation)}{row.values.presentation !== null ? '/35' : ''}</p></td>
              <td className="px-3 py-3"><p className="font-bold text-cyan-200">{formatRankPoints(row.positions.xp)}</p><p className="mt-1 text-[10px] text-gray-400">{formatGrade(row.values.xp)} XP</p></td>
              <td className="px-3 py-3"><p className={`text-lg font-black ${isTopSix ? 'text-emerald-100' : 'text-white'}`}>{row.score} <span className="text-[10px] font-normal text-gray-400">pontos</span></p><p className="mt-1 text-[10px] text-gray-400">{FINAL_SPRINT_RANKING_CATEGORIES.map(({ id: categoryId }) => row.positions[categoryId]).join(' + ')}</p></td>
              <td className="px-3 py-3"><button type="button" disabled={!selectionReady || Boolean(savingKey) || (!selected && selectedCount >= 6)} onClick={() => saveSelection(row.student, { selectedForTournament: !selected })} className={`rounded-lg border px-3 py-2 text-[10px] font-black disabled:cursor-not-allowed disabled:opacity-30 ${selected ? 'border-emerald-300/30 bg-emerald-300/15 text-emerald-100' : 'border-white/10 text-gray-300 hover:text-white'}`}>{selected ? 'Na lista' : 'Marcar'}</button></td>
            </tr>;
          })}</tbody>
        </table>
      </div>
      <p className="text-[10px] text-gray-400">{sortedStudents.length} aluno(s) no ranking. Registre a nota e o feedback na aba Avaliação dos relatórios. Prepare os participantes na coluna Torneio, decida os empates e use Divulgar convocação quando a lista estiver pronta.</p>
    </div> : null}
  </div>;
}

function ReportEvaluationResultCard({ record }) {
  return <article className="rounded-2xl border border-violet-300/20 bg-[#111722] p-5 md:p-6">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><h3 className="text-lg font-black text-white">Avaliação dos relatórios</h3><p className="mt-1 text-xs text-gray-400">Feedback do técnico sobre seus registros e sua evolução.</p></div>
      <span className="rounded-xl border border-violet-300/20 bg-violet-300/10 px-4 py-2 text-lg font-black text-violet-100">{formatGrade(parseFinalSprintReportScore(record.total))}/10</span>
    </div>
    <div className="mt-5 space-y-4">
      {record.note ? <section><h4 className="text-xs font-black uppercase tracking-[0.1em] text-violet-200">Análise dos relatórios</h4><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-200">{record.note}</p></section> : null}
      {record.strengths ? <section className="rounded-xl border border-emerald-300/10 bg-emerald-300/5 p-4"><h4 className="text-xs font-black text-emerald-100">Pontos fortes</h4><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-emerald-50">{record.strengths}</p></section> : null}
      {record.improvement ? <section className="rounded-xl border border-amber-300/10 bg-amber-300/5 p-4"><h4 className="text-xs font-black text-amber-100">Próximos passos e melhorias</h4><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-amber-50">{record.improvement}</p></section> : null}
    </div>
    {record.evaluatorName ? <p className="mt-4 text-[10px] text-gray-500">Avaliado por {record.evaluatorName}</p> : null}
  </article>;
}

function DraftStatus({ draft, storageError }) {
  if (!draft) return null;
  return <p role="status" className="rounded-xl border border-cyan-300/20 bg-cyan-300/5 p-3 text-xs text-cyan-100">{storageError ? 'Rascunho apenas nesta página. Finalize o envio antes de sair.' : 'Rascunho salvo neste navegador. Finalize em Salvar avaliação para registrar a nota.'}</p>;
}

function EvaluationResultCard({ title, subtitle, criteria, record }) {
  const total = record.total ?? getRatingTotal(record.ratings, criteria);
  return <article className="rounded-2xl border border-white/10 bg-[#111722] p-4 md:p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h4 className="text-sm font-black text-white">{title}</h4>{subtitle ? <p className="mt-1 text-[10px] text-gray-500">{subtitle}</p> : null}</div><span className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-sm font-black text-cyan-100">{total ?? '—'}/{criteria.length * 5}</span></div><div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{criteria.map(({ id, label }) => <div key={id} className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-black/15 px-3 py-2"><span className="text-xs text-gray-300">{label}</span><span className="text-xs font-black text-white">{record.ratings?.[id] ?? '—'}/5</span></div>)}</div>{record.strengths ? <p className="mt-4 rounded-xl border border-emerald-300/10 bg-emerald-300/5 p-3 text-xs leading-relaxed text-emerald-50"><strong>Ponto forte:</strong> {record.strengths}</p> : null}{record.improvement ? <p className="mt-2 rounded-xl border border-amber-300/10 bg-amber-300/5 p-3 text-xs leading-relaxed text-amber-50"><strong>Próximo ponto a melhorar:</strong> {record.improvement}</p> : null}</article>;
}
