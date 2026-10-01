import { useMemo, useState } from 'react';
import { Check, ChevronDown, Save } from 'lucide-react';
import { DEFAULT_FINAL_SPRINT_WEIGHTS, PRESENTATION_EVALUATION_CRITERIA, WEEKLY_EVALUATION_CRITERIA, getFinalSprintEvaluationWeek } from '../utils/finalSprintEvaluations';

const SCORE_LABELS = ['Não demonstrou', 'Muito abaixo', 'Abaixo', 'Adequado', 'Bom', 'Excelente'];
const EMPTY_FEEDBACK = { strengths: '', improvement: '' };
const EMPTY_DECISION = { historyScore: '', historyNote: '', viniciusScore: '', viniciusNote: '', selectedForTournament: false, selectionNote: '' };

const makeEmptyRatings = (criteria) => Object.fromEntries(criteria.map(({ id }) => [id, null]));
const getRatingTotal = (ratings, criteria) => {
  if (!ratings || !criteria.every(({ id }) => ratings[id] !== null && ratings[id] !== undefined && ratings[id] !== '')) return null;
  return criteria.reduce((total, { id }) => total + Number(ratings[id]), 0);
};
const toScoreOrNull = (value, max) => {
  if (value === '' || value === null || value === undefined) return null;
  const score = Number(value);
  return Number.isInteger(score) && score >= 0 && score <= max ? score : null;
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

const FeedbackFields = ({ value, onChange, improvementRequired = true }) => (
  <div className="grid gap-3 md:grid-cols-2">
    <label className="space-y-1 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">Ponto forte observado<textarea value={value.strengths || ''} onChange={(event) => onChange('strengths', event.target.value)} maxLength={600} rows={3} className="mt-1 w-full resize-y rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm font-normal normal-case leading-relaxed text-white outline-none focus:border-amber-300" placeholder="Uma atitude ou contribuição que merece ser reconhecida" /></label>
    <label className="space-y-1 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">Próximo ponto a melhorar{improvementRequired ? ' *' : ''}<textarea value={value.improvement || ''} onChange={(event) => onChange('improvement', event.target.value)} maxLength={600} rows={3} className="mt-1 w-full resize-y rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm font-normal normal-case leading-relaxed text-white outline-none focus:border-amber-300" placeholder="Uma orientação concreta para a próxima semana" /></label>
  </div>
);

const WeightEditor = ({ weights, onSave, saving }) => {
  const key = Object.entries(weights).map(([name, value]) => `${name}:${value}`).join('|');
  return <WeightEditorDraft key={key} weights={weights} onSave={onSave} saving={saving} />;
};

const WeightEditorDraft = ({ weights, onSave, saving }) => {
  const [draft, setDraft] = useState(weights);
  const [open, setOpen] = useState(false);
  const total = Object.values(draft).reduce((sum, value) => sum + (Number(value) || 0), 0);
  const labels = { weekly: 'Semanal', presentation: 'Apresentação', history: 'Histórico', vinicius: 'Relatório Vinicius', xp: 'XP' };

  return (
    <section className="rounded-2xl border border-white/10 bg-[#111722] p-4">
      <button type="button" onClick={() => setOpen((value) => !value)} className="flex w-full items-center justify-between gap-3 text-left"><span><span className="block text-sm font-black text-white">Pesos da nota de prontidão</span><span className="mt-1 block text-xs text-gray-400">Semanal {weights.weekly} · Apresentação {weights.presentation} · Histórico {weights.history} · Vinicius {weights.vinicius} · XP {weights.xp} (total 100)</span></span><ChevronDown size={16} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} /></button>
      {open ? <div className="mt-4 border-t border-white/10 pt-4"><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{Object.entries(labels).map(([key, label]) => <label key={key} className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">{label}<input type="number" min="0" max="100" value={draft[key]} onChange={(event) => setDraft((current) => ({ ...current, [key]: event.target.value }))} className="mt-1 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-white" /></label>)}</div><div className="mt-3 flex flex-wrap items-center justify-between gap-3"><p className={`text-xs font-bold ${total === 100 ? 'text-emerald-200' : 'text-amber-200'}`}>Total dos pesos: {total}/100</p><button type="button" disabled={total !== 100 || saving} onClick={() => onSave(Object.fromEntries(Object.entries(draft).map(([key, value]) => [key, Number(value)])))} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-black text-black disabled:cursor-not-allowed disabled:opacity-40"><Save size={13} />{saving ? 'Salvando...' : 'Salvar pesos'}</button></div></div> : null}
    </section>
  );
};

export default function FinalSprintEvaluationsView({
  isTechnicalProfile = false,
  student,
  students = [],
  evaluations = [],
  selections = [],
  weights = DEFAULT_FINAL_SPRINT_WEIGHTS,
  pendingWeeklyCount = 0,
  onSaveWeekly,
  onSavePresentation,
  onSaveSelection,
  onSaveWeights,
}) {
  const [section, setSection] = useState('weekly');
  const [weekOffset, setWeekOffset] = useState(0);
  const [weeklyDrafts, setWeeklyDrafts] = useState({});
  const [presentationDrafts, setPresentationDrafts] = useState({});
  const [selectionDrafts, setSelectionDrafts] = useState({});
  const [savingKey, setSavingKey] = useState('');
  const [savingWeights, setSavingWeights] = useState(false);
  const week = getFinalSprintEvaluationWeek(weekOffset);

  const sortedStudents = useMemo(() => [...students].filter((item) => item?.id).sort((left, right) => `${left.name || ''}`.localeCompare(`${right.name || ''}`, 'pt-BR')), [students]);
  const weeklyEvaluations = evaluations.filter((item) => item.type === 'weekly');
  const presentationEvaluations = evaluations.filter((item) => item.type === 'presentation');
  const weeklyByStudent = new Map(weeklyEvaluations.filter((item) => item.weekId === week.id).map((item) => [String(item.studentId), item]));
  const presentationsByStudent = new Map(presentationEvaluations.map((item) => [String(item.studentId), item]));
  const selectionsByStudent = new Map(selections.map((item) => [String(item.studentId), item]));
  const maxXp = Math.max(0, ...students.map((item) => Number(item.xp) || 0));
  const completeWeeklyCount = sortedStudents.filter((item) => weeklyByStudent.get(String(item.id))?.status === 'complete').length;

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
  const selectionDraftFor = (studentId, persisted) => selectionDrafts[studentId] || {
    ...EMPTY_DECISION,
    ...persisted,
    historyScore: persisted?.historyScore ?? '',
    viniciusScore: persisted?.viniciusScore ?? '',
  };

  const updateWeeklyDraft = (studentId, update) => setWeeklyDrafts((current) => {
    const key = `${studentId}__${week.id}`;
    const existing = weeklyDraftFor(studentId, weeklyByStudent.get(String(studentId)));
    return { ...current, [key]: { ...existing, ...update } };
  });
  const updatePresentationDraft = (studentId, update) => setPresentationDrafts((current) => ({ ...current, [studentId]: { ...presentationDraftFor(studentId, presentationsByStudent.get(String(studentId))), ...update } }));
  const updateSelectionDraft = (studentId, update) => setSelectionDrafts((current) => ({ ...current, [studentId]: { ...selectionDraftFor(studentId, selectionsByStudent.get(String(studentId))), ...update } }));

  const saveWeekly = async (studentItem) => {
    const draft = weeklyDraftFor(studentItem.id, weeklyByStudent.get(String(studentItem.id)));
    if (getRatingTotal(draft.ratings, WEEKLY_EVALUATION_CRITERIA) === null || !draft.improvement.trim()) return;
    const key = `weekly-${studentItem.id}`;
    setSavingKey(key);
    try { await onSaveWeekly({ student: studentItem, week, draft }); } finally { setSavingKey(''); }
  };
  const savePresentation = async (studentItem) => {
    const draft = presentationDraftFor(studentItem.id, presentationsByStudent.get(String(studentItem.id)));
    if (getRatingTotal(draft.ratings, PRESENTATION_EVALUATION_CRITERIA) === null || !draft.improvement.trim()) return;
    const key = `presentation-${studentItem.id}`;
    setSavingKey(key);
    try { await onSavePresentation({ student: studentItem, draft }); } finally { setSavingKey(''); }
  };
  const saveSelection = async (studentItem) => {
    const draft = selectionDraftFor(studentItem.id, selectionsByStudent.get(String(studentItem.id)));
    const historyScore = toScoreOrNull(draft.historyScore, 10);
    const viniciusScore = toScoreOrNull(draft.viniciusScore, 10);
    if (historyScore === null || viniciusScore === null) return;
    const key = `selection-${studentItem.id}`;
    setSavingKey(key);
    try { await onSaveSelection({ student: studentItem, draft: { ...draft, historyScore, viniciusScore } }); } finally { setSavingKey(''); }
  };

  if (!isTechnicalProfile) {
    if (!student?.id) return <section className="rounded-2xl border border-white/10 bg-[#111722] p-8 text-center text-sm text-gray-400">Não foi possível localizar seu perfil.</section>;
    const ownWeekly = weeklyEvaluations.filter((item) => String(item.studentId) === String(student.id)).sort((left, right) => `${right.weekId || ''}`.localeCompare(`${left.weekId || ''}`));
    const ownPresentation = presentationEvaluations.find((item) => String(item.studentId) === String(student.id));
    return <div className="space-y-5">
      <section className="newgears-major-panel rounded-[28px] border border-cyan-400/20 bg-gradient-to-br from-[#10232b] via-[#151922] to-[#111722] p-6 md:p-8"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200/75">Seu acompanhamento</p><h2 className="mt-3 text-3xl font-black text-white">Meu feedback</h2><p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-300">Veja as avaliações semanais, os pontos fortes e o próximo passo indicado pelo técnico.</p></section>
      {ownPresentation ? <EvaluationResultCard title="Apresentação para a escola" subtitle={ownPresentation.presentedAt ? `Avaliada em ${new Intl.DateTimeFormat('pt-BR').format(new Date(`${ownPresentation.presentedAt}T12:00:00`))}` : 'Avaliação final'} criteria={PRESENTATION_EVALUATION_CRITERIA} record={ownPresentation} /> : <section className="rounded-2xl border border-white/10 bg-[#111722] p-5 text-sm text-gray-400">A avaliação da apresentação aparecerá aqui depois que for registrada.</section>}
      <section className="space-y-3"><div className="flex items-end justify-between"><div><h3 className="text-xl font-black text-white">Avaliações das semanas</h3><p className="mt-1 text-xs text-gray-400">Cada registro mostra a pontuação e o feedback daquela semana.</p></div><span className="text-xs text-gray-500">{ownWeekly.length} registro(s)</span></div>{ownWeekly.map((record) => <EvaluationResultCard key={record.id} title={record.weekLabel || `Semana de ${record.weekId}`} subtitle={record.updatedAt ? `Atualizado em ${new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(new Date(record.updatedAt))}` : ''} criteria={WEEKLY_EVALUATION_CRITERIA} record={record} />)}{ownWeekly.length === 0 ? <div className="rounded-2xl border border-white/10 bg-[#111722] p-8 text-center text-sm text-gray-400">Sua primeira avaliação semanal aparecerá aqui.</div> : null}</section>
    </div>;
  }

  const selectionRows = sortedStudents.map((studentItem) => {
    const studentId = String(studentItem.id);
    const weeklyRecords = weeklyEvaluations.filter((item) => String(item.studentId) === studentId && item.status === 'complete');
    const weeklyAverage = weeklyRecords.length ? weeklyRecords.reduce((sum, item) => sum + Number(item.total || getRatingTotal(item.ratings, WEEKLY_EVALUATION_CRITERIA) || 0), 0) / weeklyRecords.length : null;
    const presentation = presentationsByStudent.get(studentId);
    const presentationTotal = presentation?.status === 'complete' ? Number(presentation.total || getRatingTotal(presentation.ratings, PRESENTATION_EVALUATION_CRITERIA)) : null;
    const selection = selectionsByStudent.get(studentId);
    const xp = Number(studentItem.xp) || 0;
    const hasCompleteInputs = weeklyAverage !== null && presentationTotal !== null && toScoreOrNull(selection?.historyScore, 10) !== null && toScoreOrNull(selection?.viniciusScore, 10) !== null;
    const breakdown = {
      weekly: weeklyAverage === null ? null : (weeklyAverage / 25) * Number(weights.weekly),
      presentation: presentationTotal === null ? null : (presentationTotal / 35) * Number(weights.presentation),
      history: toScoreOrNull(selection?.historyScore, 10) === null ? null : (Number(selection.historyScore) / 10) * Number(weights.history),
      vinicius: toScoreOrNull(selection?.viniciusScore, 10) === null ? null : (Number(selection.viniciusScore) / 10) * Number(weights.vinicius),
      xp: maxXp > 0 ? (Math.max(0, xp) / maxXp) * Number(weights.xp) : 0,
    };
    const score = hasCompleteInputs ? Object.values(breakdown).reduce((sum, value) => sum + (Number(value) || 0), 0) : null;
    return { student: studentItem, selection, weeklyAverage, presentationTotal, hasCompleteInputs, breakdown, score };
  }).sort((left, right) => (right.score ?? -1) - (left.score ?? -1) || `${left.student.name || ''}`.localeCompare(`${right.student.name || ''}`, 'pt-BR'));
  const completeRows = selectionRows.filter((row) => row.hasCompleteInputs);
  const selectedCount = selections.filter((item) => item.selectedForTournament === true).length;
  const handleExportReadinessReport = () => {
    const escapeCsvCell = (value) => `"${`${value ?? ''}`.replaceAll('"', '""').replaceAll('\r\n', '\n').replaceAll('\r', '\n')}"`;
    const headers = ['Posição', 'Aluno', 'XP atual', 'Média semanal /25', `Semanal /${weights.weekly}`, 'Apresentação /35', `Apresentação /${weights.presentation}`, `Histórico /${weights.history}`, 'Observação do histórico', `Relatório Vinicius /${weights.vinicius}`, 'Observação do relatório', `XP /${weights.xp}`, 'Nota final /100', 'Avaliação completa', 'Selecionado para o torneio'];
    const rows = selectionRows.map((row) => [
      row.score === null ? '' : completeRows.indexOf(row) + 1,
      row.student.name || 'Aluno',
      Number(row.student.xp) || 0,
      row.weeklyAverage === null ? '' : row.weeklyAverage.toFixed(2),
      row.breakdown.weekly === null ? '' : row.breakdown.weekly.toFixed(2),
      row.presentationTotal === null ? '' : row.presentationTotal,
      row.breakdown.presentation === null ? '' : row.breakdown.presentation.toFixed(2),
      row.selection?.historyScore ?? '',
      row.selection?.historyNote || '',
      row.selection?.viniciusScore ?? '',
      row.selection?.viniciusNote || '',
      row.breakdown.xp.toFixed(2),
      row.score === null ? '' : row.score.toFixed(2),
      row.hasCompleteInputs ? 'Sim' : 'Não',
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
    <section className="newgears-major-panel rounded-[28px] border border-amber-400/20 bg-gradient-to-br from-[#241d12] via-[#171922] to-[#111722] p-6 md:p-8"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-200/75">Ciclo de avaliação</p><h2 className="mt-3 text-3xl font-black text-white">Acompanhamento da reta final</h2><p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-300">Registre o que observou, dê uma orientação concreta e acompanhe a prontidão para o torneio.</p></div><div className="rounded-2xl border border-amber-300/20 bg-black/20 px-4 py-3"><p className="text-[9px] font-bold uppercase tracking-[0.15em] text-amber-100/60">Avaliações da semana</p><p className="mt-1 text-2xl font-black text-white">{completeWeeklyCount}/{sortedStudents.length}</p><p className="mt-1 text-[10px] text-amber-100/70">{week.isFriday ? (pendingWeeklyCount ? `Hoje é sexta: faltam ${pendingWeeklyCount}.` : 'Sexta-feira: equipe avaliada.') : `${pendingWeeklyCount} pendente(s) nesta semana.`}</p></div></div></section>

    <div className="flex flex-wrap gap-2">{[['weekly', 'Avaliação semanal'], ['presentation', 'Apresentação da escola'], ['selection', 'Prontidão para o torneio']].map(([id, label]) => <button key={id} type="button" onClick={() => setSection(id)} className={`rounded-xl border px-4 py-2.5 text-xs font-black ${section === id ? 'border-amber-300 bg-amber-300 text-black' : 'border-white/10 bg-white/5 text-gray-300 hover:text-white'}`}>{label}</button>)}</div>

    {section === 'weekly' ? <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#111722] p-4"><div><h3 className="text-sm font-black text-white">{week.isCurrent ? 'Avaliação desta semana' : 'Editar avaliação semanal'}</h3><p className="mt-1 text-xs text-gray-400">{week.label} · 5 critérios · máximo 25 pontos</p></div><div className="flex items-center gap-2"><button type="button" disabled={weekOffset <= -12} onClick={() => setWeekOffset((value) => Math.max(-12, value - 1))} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-300 disabled:opacity-40">Semana anterior</button>{weekOffset < 0 ? <button type="button" onClick={() => setWeekOffset(0)} className="rounded-lg border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-xs font-bold text-amber-100">Voltar à atual</button> : null}</div></div>
      <div className="grid gap-3 xl:grid-cols-2">{sortedStudents.map((studentItem) => {
        const id = String(studentItem.id);
        const saved = weeklyByStudent.get(id);
        const draft = weeklyDraftFor(id, saved);
        const total = getRatingTotal(draft.ratings, WEEKLY_EVALUATION_CRITERIA);
        const isSaved = saved?.status === 'complete';
        const key = `weekly-${studentItem.id}`;
        return <details key={id} className="group rounded-2xl border border-white/10 bg-[#111722] open:border-amber-300/25"><summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4"><div className="min-w-0"><p className="truncate text-sm font-black text-white">{studentItem.name || 'Aluno'}</p><p className="mt-1 text-[10px] text-gray-500">{isSaved ? `Avaliado · ${saved.total ?? total}/25` : 'Pendente nesta semana'}</p></div><div className="flex items-center gap-2">{isSaved ? <Check size={16} className="text-emerald-300" /> : <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2 py-1 text-[9px] font-black uppercase text-amber-100">Avaliar</span>}<ChevronDown size={15} className="text-gray-500 transition-transform group-open:rotate-180" /></div></summary><div className="space-y-4 border-t border-white/8 p-4"><RatingPicker criteria={WEEKLY_EVALUATION_CRITERIA} ratings={draft.ratings} onChange={(criterion, score) => updateWeeklyDraft(id, { ratings: { ...draft.ratings, [criterion]: score } })} /><FeedbackFields value={draft} onChange={(field, value) => updateWeeklyDraft(id, { [field]: value })} /><div className="flex items-center justify-between gap-3"><p className="text-xs font-black text-gray-300">Pontuação: {total === null ? '—' : `${total}/25`}</p><button type="button" disabled={savingKey === key || total === null || !draft.improvement.trim()} onClick={() => saveWeekly(studentItem)} className="inline-flex items-center gap-2 rounded-xl bg-amber-300 px-4 py-2.5 text-xs font-black text-black disabled:opacity-40"><Save size={13} />{savingKey === key ? 'Salvando...' : 'Salvar avaliação'}</button></div></div></details>;
      })}</div>
    </div> : null}

    {section === 'presentation' ? <div className="space-y-4"><section className="rounded-2xl border border-white/10 bg-[#111722] p-4"><h3 className="text-sm font-black text-white">Avaliação da apresentação para a escola</h3><p className="mt-1 text-xs text-gray-400">Registre uma avaliação final individual para cada aluno que participou.</p></section><div className="grid gap-3 xl:grid-cols-2">{sortedStudents.map((studentItem) => {
      const id = String(studentItem.id);
      const saved = presentationsByStudent.get(id);
      const draft = presentationDraftFor(id, saved);
      const total = getRatingTotal(draft.ratings, PRESENTATION_EVALUATION_CRITERIA);
      const key = `presentation-${studentItem.id}`;
      return <details key={id} className="group rounded-2xl border border-white/10 bg-[#111722] open:border-cyan-300/25"><summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4"><div><p className="text-sm font-black text-white">{studentItem.name || 'Aluno'}</p><p className="mt-1 text-[10px] text-gray-500">{saved?.status === 'complete' ? `Avaliado · ${saved.total ?? total}/35` : 'Aguardando apresentação'}</p></div><ChevronDown size={15} className="text-gray-500 transition-transform group-open:rotate-180" /></summary><div className="space-y-4 border-t border-white/8 p-4"><label className="block max-w-xs space-y-1 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">Data da apresentação<input type="date" value={draft.presentedAt || ''} onChange={(event) => updatePresentationDraft(id, { presentedAt: event.target.value })} className="mt-1 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-white" /></label><RatingPicker criteria={PRESENTATION_EVALUATION_CRITERIA} ratings={draft.ratings} onChange={(criterion, score) => updatePresentationDraft(id, { ratings: { ...draft.ratings, [criterion]: score } })} /><FeedbackFields value={draft} onChange={(field, value) => updatePresentationDraft(id, { [field]: value })} /><div className="flex items-center justify-between gap-3"><p className="text-xs font-black text-gray-300">Pontuação: {total === null ? '—' : `${total}/35`}</p><button type="button" disabled={savingKey === key || total === null || !draft.improvement.trim()} onClick={() => savePresentation(studentItem)} className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-4 py-2.5 text-xs font-black text-black disabled:opacity-40"><Save size={13} />{savingKey === key ? 'Salvando...' : 'Salvar apresentação'}</button></div></div></details>;
    })}</div></div> : null}

    {section === 'selection' ? <div className="space-y-4"><WeightEditor weights={weights} saving={savingWeights} onSave={async (nextWeights) => { setSavingWeights(true); try { await onSaveWeights(nextWeights); } finally { setSavingWeights(false); } }} /><section className="rounded-2xl border border-white/10 bg-[#111722] p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-sm font-black text-white">Prontidão e seleção do torneio</h3><p className="mt-1 text-xs text-gray-400">A nota ajuda a comparar evidências; a seleção final continua sendo sua decisão.</p></div><div className="flex items-center gap-2"><div className="rounded-xl border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-xs font-black text-amber-100">Selecionados: {selectedCount}/6</div><button type="button" onClick={handleExportReadinessReport} className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-bold text-emerald-100 hover:bg-emerald-400/20">Baixar relatório CSV</button></div></div><p className="mt-3 text-[10px] leading-relaxed text-gray-500">A semana usa a média das avaliações (máx. 25), convertida pelo peso configurado. O XP é proporcional ao maior XP da equipe e vale até {weights.xp} pontos.</p></section><div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#111722]"><table className="w-full min-w-[1100px] text-left text-xs"><thead className="bg-white/5 text-[9px] uppercase tracking-[0.12em] text-gray-400"><tr><th className="px-3 py-3">Pos.</th><th className="px-3 py-3">Aluno</th><th className="px-3 py-3">Semanal /{weights.weekly}</th><th className="px-3 py-3">Apresentação /{weights.presentation}</th><th className="px-3 py-3">Histórico /{weights.history}</th><th className="px-3 py-3">Vinicius /{weights.vinicius}</th><th className="px-3 py-3">XP /{weights.xp}</th><th className="px-3 py-3">Nota /100</th><th className="px-3 py-3">Torneio</th></tr></thead><tbody>{selectionRows.map((row) => {
        const id = String(row.student.id);
        const saved = row.selection;
        const draft = selectionDraftFor(id, saved);
        const selected = saved?.selectedForTournament === true;
        return <tr key={id} className={`border-t border-white/5 ${completeRows.indexOf(row) >= 0 && completeRows.indexOf(row) < 6 ? 'bg-emerald-400/[0.04]' : ''}`}><td className="px-3 py-3 font-black text-gray-400">{row.score === null ? '—' : completeRows.indexOf(row) + 1}</td><td className="px-3 py-3 font-bold text-white">{row.student.name || 'Aluno'}<div className="mt-1 text-[9px] font-normal text-gray-500">XP atual: {Number(row.student.xp) || 0} · {weeklyEvaluations.filter((item) => String(item.studentId) === id && item.status === 'complete').length} semana(s)</div></td><td className="px-3 py-3 text-gray-200">{row.breakdown.weekly === null ? 'Pendente' : row.breakdown.weekly.toFixed(1)}</td><td className="px-3 py-3 text-gray-200">{row.breakdown.presentation === null ? 'Pendente' : row.breakdown.presentation.toFixed(1)}</td><td className="px-3 py-3"><div className="flex items-center gap-1"><input type="number" min="0" max="10" value={draft.historyScore} onChange={(event) => updateSelectionDraft(id, { historyScore: event.target.value })} className="w-16 rounded-lg border border-white/10 bg-black/25 px-2 py-1.5 text-white" /><input value={draft.historyNote} onChange={(event) => updateSelectionDraft(id, { historyNote: event.target.value })} placeholder="Observação" className="w-28 rounded-lg border border-white/10 bg-black/25 px-2 py-1.5 text-white" /></div></td><td className="px-3 py-3"><div className="flex items-center gap-1"><input type="number" min="0" max="10" value={draft.viniciusScore} onChange={(event) => updateSelectionDraft(id, { viniciusScore: event.target.value })} className="w-16 rounded-lg border border-white/10 bg-black/25 px-2 py-1.5 text-white" /><input value={draft.viniciusNote} onChange={(event) => updateSelectionDraft(id, { viniciusNote: event.target.value })} placeholder="Observação" className="w-28 rounded-lg border border-white/10 bg-black/25 px-2 py-1.5 text-white" /></div></td><td className="px-3 py-3 text-gray-200">{row.breakdown.xp.toFixed(1)}</td><td className="px-3 py-3 font-black text-white">{row.score === null ? 'Incompleto' : row.score.toFixed(1)}</td><td className="px-3 py-3"><div className="flex items-center gap-2"><button type="button" onClick={() => saveSelection(row.student)} disabled={savingKey === `selection-${id}`} className="rounded-lg border border-white/10 px-2 py-1.5 text-[10px] font-bold text-gray-300 hover:text-white">{savingKey === `selection-${id}` ? 'Salvando' : 'Salvar'}</button><button type="button" disabled={!row.hasCompleteInputs || (!selected && selectedCount >= 6)} onClick={() => { const nextSelected = !selected; updateSelectionDraft(id, { selectedForTournament: nextSelected }); onSaveSelection({ student: row.student, draft: { ...draft, selectedForTournament: nextSelected } }); }} className={`rounded-lg border px-2 py-1.5 text-[10px] font-black disabled:cursor-not-allowed disabled:opacity-30 ${selected ? 'border-emerald-300/30 bg-emerald-300/15 text-emerald-100' : 'border-white/10 text-gray-400 hover:text-white'}`}>{selected ? 'Selecionado' : 'Marcar'}</button></div></td></tr>;
      })}</tbody></table></div><p className="text-[10px] text-gray-500">{completeRows.length} de {sortedStudents.length} avaliações completas. Itens sem nota semanal, apresentação ou fontes históricas aparecem como incompletos e não entram na ordem final.</p></div> : null}
  </div>;
}

function EvaluationResultCard({ title, subtitle, criteria, record }) {
  const total = record.total ?? getRatingTotal(record.ratings, criteria);
  return <article className="rounded-2xl border border-white/10 bg-[#111722] p-4 md:p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h4 className="text-sm font-black text-white">{title}</h4>{subtitle ? <p className="mt-1 text-[10px] text-gray-500">{subtitle}</p> : null}</div><span className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-sm font-black text-cyan-100">{total ?? '—'}/{criteria.length * 5}</span></div><div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{criteria.map(({ id, label }) => <div key={id} className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-black/15 px-3 py-2"><span className="text-xs text-gray-300">{label}</span><span className="text-xs font-black text-white">{record.ratings?.[id] ?? '—'}/5</span></div>)}</div>{record.strengths ? <p className="mt-4 rounded-xl border border-emerald-300/10 bg-emerald-300/5 p-3 text-xs leading-relaxed text-emerald-50"><strong>Ponto forte:</strong> {record.strengths}</p> : null}{record.improvement ? <p className="mt-2 rounded-xl border border-amber-300/10 bg-amber-300/5 p-3 text-xs leading-relaxed text-amber-50"><strong>Próximo ponto a melhorar:</strong> {record.improvement}</p> : null}</article>;
}
