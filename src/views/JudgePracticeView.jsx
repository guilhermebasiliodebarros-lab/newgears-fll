import { useMemo, useState } from 'react';
import { BookOpenCheck, CircleHelp, Eye, EyeOff, MessageCircle, Shuffle, Sparkles } from 'lucide-react';

import { QUESTION_AREAS, QUESTION_BANK } from '../utils/judgeQuestions';
import JudgeTrainingSession from '../components/JudgeTrainingSession';

export default function JudgePracticeView({
  projectSummary,
  prototypeIterations = [],
  experts = [],
  expertContacts = [],
  outreachEvents = [],
  robotVersions = [],
  attachments = [],
  codeSnippets = [],
  activeCommandCode,
  rounds = [],
  scoreHistory = [],
  students = [],
}) {
  const [selectedArea, setSelectedArea] = useState('project');
  const [revealedAnswers, setRevealedAnswers] = useState({});
  const [drawnQuestionId, setDrawnQuestionId] = useState('');
  const [copiedQuestionId, setCopiedQuestionId] = useState('');

  const answerContext = useMemo(() => ({
    projectSummary,
    prototypeIterations: [...prototypeIterations].sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0)),
    experts,
    expertContacts,
    outreachEvents: [...outreachEvents].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)),
    robotVersions: [...robotVersions].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)),
    attachments,
    codeSnippets,
    activeCommandCode,
    rounds,
    scoreHistory,
    students,
  }), [projectSummary, prototypeIterations, experts, expertContacts, outreachEvents, robotVersions, attachments, codeSnippets, activeCommandCode, rounds, scoreHistory, students]);

  const visibleQuestions = QUESTION_BANK.filter((item) => item.area === selectedArea);
  const drawnQuestion = QUESTION_BANK.find((item) => item.id === drawnQuestionId);

  const handleDrawQuestion = () => {
    const candidates = visibleQuestions.filter((item) => item.id !== drawnQuestionId);
    const pool = candidates.length ? candidates : visibleQuestions;
    const nextQuestion = pool[Math.floor(Math.random() * pool.length)];
    setDrawnQuestionId(nextQuestion.id);
    setRevealedAnswers((current) => ({ ...current, [nextQuestion.id]: false }));
    requestAnimationFrame(() => document.getElementById(`judge-question-${nextQuestion.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  };

  const toggleAnswer = (questionId) => setRevealedAnswers((current) => ({ ...current, [questionId]: !current[questionId] }));

  const copySuggestedAnswer = async (question) => {
    try {
      await navigator.clipboard.writeText(question.answer(answerContext));
      setCopiedQuestionId(question.id);
      setTimeout(() => setCopiedQuestionId(''), 1800);
    } catch {
      setCopiedQuestionId('');
    }
  };

  return (
    <div className="space-y-6">
      <JudgeTrainingSession students={students} answerContext={answerContext} />
      <section className="newgears-major-panel rounded-[28px] border border-violet-400/20 bg-gradient-to-br from-[#201532] via-[#171722] to-[#111722] p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-3xl">
            <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-violet-200/80"><MessageCircle size={14} />Simulado da banca</p>
            <h2 className="mt-3 text-3xl font-black text-white">Treino de perguntas dos juízes</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-300">Pratiquem respondendo primeiro com as próprias palavras. Depois revelem um modelo baseado nos registros da equipe e completem os trechos que pedem exemplos reais.</p>
          </div>
          <button type="button" onClick={handleDrawQuestion} className="inline-flex items-center gap-2 rounded-xl bg-violet-300 px-4 py-3 text-sm font-black text-[#140d20] transition hover:bg-violet-200"><Shuffle size={16} />Sortear pergunta</button>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2 text-[10px] text-violet-100/70"><BookOpenCheck size={13} />Perguntas de treino adaptadas do roteiro oficial FIRST 2026–27. A banca pode fazer outras perguntas ou adaptar estas.</div>
        <a href="https://firstinspires.blob.core.windows.net/fll/challenge/2026-27/fll-challenge-bioglow-judging-session-script-questions.pdf" target="_blank" rel="noreferrer" className="mt-2 inline-flex text-[10px] font-bold text-violet-200 underline decoration-violet-200/40 underline-offset-2 hover:text-white">Ver roteiro oficial de perguntas da FIRST</a>
      </section>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Área de treino">
        {QUESTION_AREAS.map((area) => (
          <button key={area.id} type="button" role="tab" aria-selected={selectedArea === area.id} onClick={() => { setSelectedArea(area.id); setDrawnQuestionId(''); }} className={`rounded-xl border px-4 py-2.5 text-xs font-bold transition ${selectedArea === area.id ? area.tone : 'border-white/10 bg-white/[0.03] text-gray-400 hover:text-white'}`}>
            {area.label}<span className="ml-2 text-[9px] opacity-70">{area.duration}</span>
          </button>
        ))}
      </div>

      {drawnQuestion ? (
        <section className="rounded-[24px] border border-violet-300/20 bg-violet-300/5 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-violet-200">Pergunta sorteada · {drawnQuestion.stage}</p><h3 className="mt-2 text-lg font-black text-white">{drawnQuestion.question}</h3></div><button type="button" onClick={() => toggleAnswer(drawnQuestion.id)} className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-violet-200/20 px-3 py-2 text-xs font-bold text-violet-100 hover:bg-violet-300/10">{revealedAnswers[drawnQuestion.id] ? <><EyeOff size={14} />Esconder modelo</> : <><Eye size={14} />Ver resposta possível</>}</button></div>
          {revealedAnswers[drawnQuestion.id] ? <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4 text-sm leading-relaxed text-gray-200">{drawnQuestion.answer(answerContext)}</div> : <p className="mt-3 text-xs text-gray-400">Conversem e respondam antes de revelar uma sugestão.</p>}
        </section>
      ) : null}

      <section className="grid gap-3 xl:grid-cols-2">
        {visibleQuestions.map((question, index) => {
          const isRevealed = Boolean(revealedAnswers[question.id]);
          return (
            <article id={`judge-question-${question.id}`} key={question.id} className={`scroll-mt-24 rounded-[22px] border bg-[#141925] p-4 md:p-5 ${drawnQuestionId === question.id ? 'border-violet-300/40 ring-1 ring-violet-300/20' : 'border-white/10'}`}>
              <div className="flex items-start gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[10px] font-black text-gray-400">{String(index + 1).padStart(2, '0')}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap gap-2"><span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-gray-400">{question.stage}</span></div><h3 className="mt-3 text-sm font-bold leading-relaxed text-white">{question.question}</h3></div></div>
              <div className="mt-4 flex flex-wrap gap-2 border-t border-white/5 pt-3"><button type="button" onClick={() => toggleAnswer(question.id)} className="inline-flex items-center gap-1.5 rounded-lg border border-violet-300/20 bg-violet-300/5 px-3 py-2 text-[10px] font-bold text-violet-100 hover:bg-violet-300/10">{isRevealed ? <EyeOff size={12} /> : <Eye size={12} />}{isRevealed ? 'Esconder resposta possível' : 'Ver resposta possível'}</button>{isRevealed ? <button type="button" onClick={() => copySuggestedAnswer(question)} className="rounded-lg border border-white/10 px-3 py-2 text-[10px] font-bold text-gray-400 hover:text-white">{copiedQuestionId === question.id ? 'Copiada' : 'Copiar modelo'}</button> : null}</div>
              {isRevealed ? <div className="mt-3 rounded-xl border border-white/8 bg-black/20 p-3 text-xs leading-relaxed text-gray-300"><span className="mb-1 block text-[9px] font-black uppercase tracking-wide text-violet-200"><Sparkles size={11} className="mr-1 inline" />Resposta possível para adaptar</span>{question.answer(answerContext)}</div> : null}
            </article>
          );
        })}
      </section>

      <aside className="flex items-start gap-3 rounded-2xl border border-amber-400/15 bg-amber-400/5 p-4 text-xs leading-relaxed text-amber-50/80"><CircleHelp size={16} className="mt-0.5 shrink-0 text-amber-200" /><p><strong className="text-amber-100">Dica de treino:</strong> respondam em 30–45 segundos com uma ideia, uma evidência e o que aprenderam. As respostas-guia usam informações salvas no sistema; completem com as experiências reais de vocês.</p></aside>
    </div>
  );
}
