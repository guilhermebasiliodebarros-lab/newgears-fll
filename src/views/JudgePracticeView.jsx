import { useMemo, useState } from 'react';
import { BookOpenCheck, CircleHelp, Eye, EyeOff, MessageCircle, Shuffle, Sparkles } from 'lucide-react';

const answerOrPrompt = (value, prompt) => value ? `Nosso registro mostra ${value}. Completem com um exemplo concreto do que a equipe fez e o que aprendeu.` : prompt;
const clean = (value) => `${value || ''}`.trim();
const listNames = (items, getter, limit = 3) => items.map(getter).map(clean).filter(Boolean).slice(0, limit).join(', ');

const QUESTION_AREAS = [
  { id: 'project', label: 'Projeto de Inovação', duration: '5 min de perguntas', tone: 'border-blue-400/20 bg-blue-400/10 text-blue-100' },
  { id: 'robot', label: 'Design do Robô', duration: '5 min de perguntas', tone: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100' },
  { id: 'values', label: 'Core Values e encerramento', duration: 'Conversa final', tone: 'border-rose-400/20 bg-rose-400/10 text-rose-100' },
];

const QUESTION_BANK = [
  { id: 'p1', area: 'project', stage: 'Identificar', question: 'Qual problema vocês escolheram resolver e como ele se conecta ao tema da temporada?', answer: (d) => answerOrPrompt(d.projectSummary?.problem, 'Comecem dizendo quem enfrenta o problema, em que situação ele acontece e qual relação vocês encontraram com o tema da temporada.') },
  { id: 'p2', area: 'project', stage: 'Identificar', question: 'Como pesquisaram o problema? Quais fontes ajudaram mais?', answer: (d) => d.experts.length || d.expertContacts.length ? `Nosso sistema registra contato com ${listNames([...d.experts, ...d.expertContacts], (item) => item.name || item.organization)}. Expliquem o que aprenderam com essas pessoas e citem também as fontes de pesquisa consultadas.` : 'Citem fontes específicas que a equipe consultou, o que cada uma ensinou e por que uma delas foi especialmente útil.' },
  { id: 'p3', area: 'project', stage: 'Planejar', question: 'Que passos a equipe seguiu para desenvolver o projeto?', answer: (d) => d.prototypeIterations.length ? `Registramos ${d.prototypeIterations.length} etapa(s) de evolução do protótipo. Usem dois marcos para contar a sequência: pesquisa, escolha da ideia, criação e melhoria.` : 'Contem a sequência real do trabalho: pesquisa, ideias consideradas, escolha da solução, protótipo e melhorias.' },
  { id: 'p4', area: 'project', stage: 'Planejar · Core Values', question: 'Como dividiram o trabalho e garantiram que todos pudessem contribuir?', answer: (d) => d.students.length ? `A equipe tem ${d.students.length} integrantes. Cada pessoa deve citar uma contribuição concreta sua e explicar como as ideias do grupo foram ouvidas e valorizadas.` : 'Cada integrante pode citar sua contribuição e explicar como a equipe organizou as tarefas e acolheu as ideias do grupo.' },
  { id: 'p5', area: 'project', stage: 'Criar', question: 'O que torna a solução de vocês inovadora ou diferente das alternativas que encontraram?', answer: (d) => answerOrPrompt(d.projectSummary?.solution, 'Descrevam a solução e comparem com pelo menos uma alternativa pesquisada. Mostrem o que vocês adaptaram ou criaram de diferente.') },
  { id: 'p6', area: 'project', stage: 'Criar', question: 'Como funciona o protótipo? O que cada parte representa?', answer: (d) => { const latest = d.prototypeIterations[0]; return latest ? `A etapa mais recente registrada é “${latest.focus || latest.version}”. Expliquem o que o protótipo demonstra, como cada parte funciona e o que ainda não representa.` : 'Apresentem o protótipo ou desenho e expliquem a função de cada parte e como ele representa a solução.'; } },
  { id: 'p7', area: 'project', stage: 'Iterar', question: 'Com quem compartilharam a solução e que feedback receberam?', answer: (d) => { const latest = d.prototypeIterations.find((item) => item.feedback); return latest ? `No registro “${latest.version || latest.focus}”, anotamos: “${latest.feedback}”. Expliquem quem ofereceu esse retorno e por que foi importante.` : 'Citem pessoas ou grupos reais que ouviram a proposta, o que disseram e como vocês registraram esse retorno.'; } },
  { id: 'p8', area: 'project', stage: 'Iterar', question: 'Que mudança fizeram depois do feedback e como isso melhorou a solução?', answer: (d) => { const latest = d.prototypeIterations.find((item) => item.improvement); return latest ? `A melhoria registrada em “${latest.version || latest.focus}” foi: ${latest.improvement}${latest.result ? ` Resultado anotado: ${latest.result}` : ''}` : 'Escolham uma melhoria real e contem a sequência: feedback recebido, mudança feita e resultado observado.'; } },
  { id: 'p9', area: 'project', stage: 'Comunicar · Impacto', question: 'Quem pode se beneficiar da solução e como vocês sabem que ela pode ajudar?', answer: (d) => { const event = d.outreachEvents[0]; return d.projectSummary?.impact ? `O impacto descrito no projeto é: ${d.projectSummary.impact}${event ? ` Também registramos uma ação com ${event.people || 0} pessoa(s).` : ''} Expliquem que evidência sustenta essa expectativa.` : answerOrPrompt('', 'Identifiquem quem se beneficiaria, como a solução ajudaria e qual teste, conversa ou dado sustenta essa ideia.'); } },
  { id: 'p10', area: 'project', stage: 'Comunicar · Fun', question: 'De qual parte do projeto vocês mais se orgulham e por quê?', answer: () => 'Cada integrante pode escolher um momento específico e explicar o que aprendeu, qual foi sua contribuição e por que aquele resultado importa para a equipe.' },
  { id: 'p11', area: 'project', stage: 'Próximos passos', question: 'Se tivessem mais tempo, o que fariam a seguir?', answer: (d) => { const latest = d.prototypeIterations[0]; return latest?.nextStep ? `O próximo passo registrado é: ${latest.nextStep}` : 'Escolham um próximo teste ou melhoria realista e expliquem o que esperam descobrir com ele.'; } },
  { id: 'r1', area: 'robot', stage: 'Identificar', question: 'Como decidiram quais missões tentar e quais priorizar?', answer: (d) => d.rounds.length ? `Há ${d.rounds.length} saída(s) planejada(s): ${listNames(d.rounds, (round) => round.name, 5)}. Expliquem os critérios de escolha, como pontos, tempo, confiança e dificuldade.` : 'Expliquem como compararam pontuação possível, tempo, consistência, dificuldade e habilidades da equipe.' },
  { id: 'r2', area: 'robot', stage: 'Identificar', question: 'Que recursos ajudaram vocês a construir e programar o robô?', answer: (d) => d.codeSnippets.length || d.robotVersions.length ? `O sistema registra ${d.robotVersions.length} versão(ões) do robô e ${d.codeSnippets.length} recurso(s) de código. Citem também os guias, vídeos ou orientações que realmente consultaram.` : 'Citem um recurso concreto — guia, vídeo, documentação ou orientação — e expliquem como ele ajudou uma decisão de construção ou programação.' },
  { id: 'r3', area: 'robot', stage: 'Planejar · Inclusão', question: 'Como fizeram para que todos pudessem compartilhar ideias sobre o robô?', answer: (d) => d.students.length ? `A equipe tem ${d.students.length} integrantes. Cada um deve relatar uma ideia que compartilhou, ouviu ou ajudou a desenvolver.` : 'Contem como coletaram as ideias, como decidiram entre opções e deem exemplos de contribuições de diferentes integrantes.' },
  { id: 'r4', area: 'robot', stage: 'Planejar · Inclusão', question: 'Como dividiram o trabalho e ajudaram todos a entender o robô e o código?', answer: () => 'Expliquem como organizaram construção, programação e testes. Cada integrante deve conseguir descrever uma parte do robô ou do código, mesmo que tenha uma especialidade.' },
  { id: 'r5', area: 'robot', stage: 'Criar', question: 'Como o robô e os anexos ajudam a completar as missões escolhidas?', answer: (d) => { const attachments = listNames(d.attachments, (item) => item.name, 4); return attachments ? `Anexos registrados: ${attachments}. Expliquem qual missão cada um atende, como se conecta ao robô e por que escolheram esse desenho.` : 'Escolham um anexo e expliquem sua forma, função, missão relacionada e como ele se conecta ao robô.'; } },
  { id: 'r6', area: 'robot', stage: 'Criar', question: 'Como o código e os sensores controlam o robô?', answer: (d) => d.activeCommandCode?.title ? `O código marcado como atual é “${d.activeCommandCode.title}”. Mostrem uma rotina ou sensor específico e expliquem qual comportamento ele controla.` : 'Escolham um trecho ou rotina de código e expliquem a entrada, a decisão que o programa toma e a ação do robô.' },
  { id: 'r7', area: 'robot', stage: 'Criar', question: 'O que vocês consideram original no desenho, nos anexos ou na programação?', answer: (d) => { const version = d.robotVersions[0]; return version?.changes ? `Na versão ${version.version || ''}, registraram: ${version.changes}. Expliquem qual necessidade levou a essa decisão e o que a torna adequada à estratégia.` : 'Apontem uma escolha de construção ou programação e expliquem o problema que ela resolve na estratégia da equipe.'; } },
  { id: 'r8', area: 'robot', stage: 'Iterar', question: 'Como testaram a consistência do robô em uma missão?', answer: (d) => { const runs = d.scoreHistory.filter((entry) => entry.practiceType === 'exit_practice'); return runs.length ? `Há ${runs.length} teste(s) de saída registrado(s). Usem uma saída como exemplo: quantas tentativas fizeram, quais resultados variaram e como decidiram se estava confiável.` : 'Expliquem quantas tentativas fizeram, o que contaram como sucesso e como repetiram o teste em condições parecidas.'; } },
  { id: 'r9', area: 'robot', stage: 'Iterar', question: 'O que mudaram no robô ou no código depois dos testes?', answer: (d) => { const test = d.scoreHistory.find((entry) => entry.practiceType === 'exit_practice' && (entry.adjustment || entry.learning)); return test ? `Em um teste da Saída ${test.exitNumber}, foi registrado: ${test.adjustment || test.learning}` : d.robotVersions[0]?.changes ? `A mudança da versão mais recente registrada foi: ${d.robotVersions[0].changes}` : 'Contem um ciclo real: resultado do teste, causa provável, alteração no robô ou código e novo resultado.'; } },
  { id: 'r10', area: 'robot', stage: 'Comunicar · Fun', question: 'O que aprenderam ao trabalhar juntos no design do robô?', answer: () => 'Liguem uma aprendizagem técnica — construção, programação ou teste — a uma aprendizagem de equipe, como ouvir ideias, dividir tarefas ou resolver um impasse.' },
  { id: 'r11', area: 'robot', stage: 'Próximos passos', question: 'Se tivessem mais tempo, o que melhorariam no robô?', answer: (d) => { const test = d.scoreHistory.find((entry) => entry.practiceType === 'exit_practice' && entry.learning); return test?.learning ? `Um próximo passo anotado nos testes foi: ${test.learning}` : 'Escolham uma melhoria específica, expliquem por que ela é prioridade e que teste usariam para avaliar o resultado.'; } },
  { id: 'c1', area: 'values', stage: 'Discovery', question: 'Qual foi o desafio mais difícil e como a equipe conseguiu superá-lo?', answer: () => 'Contem a situação, as opções que tentaram, como decidiram o que fazer e o que aprenderam. Cada pessoa pode descrever sua parte.' },
  { id: 'c2', area: 'values', stage: 'Teamwork', question: 'Como resolveram uma discordância ou conflito dentro da equipe?', answer: () => 'Escolham um exemplo real. Expliquem como cada pessoa foi ouvida, como chegaram a uma decisão e o que fariam de novo numa situação parecida.' },
  { id: 'c3', area: 'values', stage: 'Inclusion', question: 'Como garantiram que todas as pessoas participassem e fossem valorizadas?', answer: (d) => d.students.length ? `Pensem nos ${d.students.length} integrantes. Deem exemplos de como distribuíram oportunidades, escutaram ideias e ajudaram uns aos outros a aprender.` : 'Deem exemplos reais de como distribuíram oportunidades, escutaram ideias e ajudaram uns aos outros a aprender.' },
  { id: 'c4', area: 'values', stage: 'Innovation', question: 'Que ideia da equipe mudou depois de vocês descobrirem algo novo?', answer: (d) => { const latest = d.prototypeIterations.find((item) => item.feedback || item.improvement); return latest ? `O registro “${latest.version || latest.focus}” mostra uma mudança: ${latest.improvement || latest.feedback}. Contem o que vocês descobriram e como isso alterou a ideia.` : 'Escolham um exemplo real em que pesquisa, teste ou conversa fez a equipe rever uma decisão.'; } },
  { id: 'c5', area: 'values', stage: 'Impact · Fun', question: 'Do que mais se orgulham nesta temporada?', answer: (d) => d.projectSummary?.title ? `O projeto “${d.projectSummary.title}” pode ser um ponto de partida. Cada integrante deve escolher uma conquista real da equipe e explicar sua contribuição.` : 'Cada integrante deve citar uma conquista da temporada e explicar por que ela representa o trabalho da equipe.' },
  { id: 'c6', area: 'values', stage: 'Discovery · Teamwork', question: 'Como o técnico ajudou e que decisões continuaram sendo da equipe?', answer: () => 'Descrevam uma orientação útil do técnico e uma decisão que os alunos pesquisaram, discutiram e tomaram em conjunto.' },
];

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
