import { useContext, useEffect, useRef, useState } from 'react';
import { Copy, Download, Pause, Play, Save, Volume2 } from 'lucide-react';
import { GearShopContext } from '../hooks/useGearShopContext';
import GearMascot from './GearMascot';
import useGiroSpeech from '../hooks/useGiroSpeech';
import { appendTrainingResult, questionById, readTrainingHistory, TRAINING_AREAS, TRAINING_RATINGS, trainingDeck, trainingSeconds, trainingSummary, validateTrainingResult } from '../utils/judgeTraining';
import { downloadBlob } from '../utils/download';
import './TeamLearning.css';

const time = (seconds) => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;
export default function JudgeTrainingSession({ students = [], answerContext }) {
  const experience = useContext(GearShopContext);
  const historyKey = `newgears_judge_training_v1:${encodeURIComponent(experience?.draftScope || 'local')}`;
  const people = students.filter((person) => person?.id).map((person) => ({ id: String(person.id), name: String(person.name || 'Integrante').slice(0, 120) }));
  const [history, setHistory] = useState(() => { try { return readTrainingHistory(localStorage, historyKey); } catch { return []; } });
  const [area, setArea] = useState('all');
  const [mode, setMode] = useState(experience?.isStudent ? 'individual' : 'team');
  const [selected, setSelected] = useState(() => experience?.student?.id || '');
  const [teamIds, setTeamIds] = useState([]);
  const [limit, setLimit] = useState(90);
  const [count, setCount] = useState(3);
  const [session, setSession] = useState(null);
  const [clock, setClock] = useState(() => Date.now());
  const [rating, setRating] = useState(null);
  const [note, setNote] = useState('');
  const [helped, setHelped] = useState(false);
  const [message, setMessage] = useState('');
  const running = session && session.startedAt !== null;
  const question = session ? questionById(session.deck[session.answers.length]) : null;
  const seconds = session ? trainingSeconds(session, clock) : 0;
  const speech = useGiroSpeech(question?.question || '', question?.id, experience?.account?.studentId || 'tecnico');
  const active = useRef(session); useEffect(() => { active.current = session; }, [session]);
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setClock(Date.now()), 250);
    return () => clearInterval(timer);
  }, [running]);
  useEffect(() => {
    const beforeUnload = (event) => { if (active.current) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, []);
  const start = () => {
    try {
      const participants = mode === 'individual' ? people.filter((person) => person.id === selected) : people.filter((person) => teamIds.includes(person.id));
      if (!participants.length) throw Error('Escolha um participante antes de iniciar.');
      if (participants.length > 40) throw Error('Escolha até 40 participantes por treino.');
      const now = Date.now();
      setSession({ id: crypto.randomUUID(), mode, area, participants, deck: trainingDeck(area, count), answers: [], elapsed: 0, startedAt: now, limit });
      setClock(now); setRating(null); setNote(''); setHelped(false); setMessage('');
    } catch (error) { setMessage(error.message); }
  };
  const pause = () => {
    const now = Date.now(); speech.stop();
    setSession((current) => ({ ...current, elapsed: trainingSeconds(current, now), startedAt: current.startedAt === null ? now : null }));
    setClock(now);
  };
  const finish = (answers) => {
    speech.stop();
    let record;
    try { record = validateTrainingResult({ version: 1, id: session.id, mode: session.mode, area: session.area, participants: session.participants, answers, finishedAt: new Date().toISOString() }); }
    catch (error) { setMessage(error.message); return; }
    try { setHistory(appendTrainingResult(localStorage, historyKey, record)); setMessage('Simulação salva no histórico deste navegador.'); }
    catch { setHistory((current) => [...current.filter((item) => item.id !== record.id), record].slice(-50)); setMessage('O navegador não conseguiu guardar o histórico. O resultado está nesta aba; baixe o resumo antes de sair.'); }
    setSession(null); setRating(null); setNote(''); setHelped(false);
  };
  const handleRegister = (now) => {
    if (rating === null) return;
    const answer = { questionId: question.id, rating, note, helped, seconds: Math.min(3600, trainingSeconds(session, now)) };
    const answers = [...session.answers, answer];
    if (answers.length === session.deck.length) return finish(answers);
    speech.stop();
    setSession((current) => ({ ...current, answers, elapsed: 0, startedAt: null })); setClock(now); setRating(null); setNote(''); setHelped(false);
  };
  const copy = async (record) => { try { await navigator.clipboard.writeText(trainingSummary(record)); setMessage('Resumo copiado. Você pode incluir no diário ou no relatório.'); } catch { setMessage('Não foi possível copiar; use Baixar resumo.'); } };
  return <section className="learning-panel" aria-label="Simulador de juízes cronometrado">
    <header className="learning-header"><div><p className="ng-eyebrow">Giro apresenta</p><h3>Simulação cronometrada</h3><p>Perguntas de treino, sem nota oficial ou XP automático. O histórico fica neste navegador, por conta e temporada.</p></div><div className="learning-giro"><GearMascot equipment={experience?.account?.equipped} mood={session ? running ? 'thinking' : 'help' : 'greet'} decorative /></div></header>
    {!session ? <div className="learning-form-grid">
      <label>Categoria<select aria-label="Categoria" value={area} onChange={(event) => setArea(event.target.value)}>{TRAINING_AREAS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
      <label>Participação<select aria-label="Participação" value={mode} onChange={(event) => setMode(event.target.value)}><option value="individual">Individual</option><option value="team">Coletiva · equipe cadastrada</option></select></label>
      {mode === 'team' && <fieldset><legend>Quem participou de verdade?</legend><button type="button" className="ng-button" onClick={() => setTeamIds(people.map((person) => person.id))}>Selecionar equipe cadastrada</button>{people.map((person) => <label key={person.id} className="mt-2"><span><input type="checkbox" checked={teamIds.includes(person.id)} onChange={(event) => setTeamIds((current) => event.target.checked ? [...current, person.id] : current.filter((id) => id !== person.id))} /> {person.name}</span></label>)}</fieldset>}
      {mode === 'individual' && <label>Quem responde<select aria-label="Quem responde" value={selected} onChange={(event) => setSelected(event.target.value)}><option value="">Escolha um integrante</option>{people.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}</select></label>}
      <label>Perguntas<select aria-label="Perguntas" value={count} onChange={(event) => setCount(Number(event.target.value))}>{[1, 3, 5].map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
      <label>Meta por resposta<select aria-label="Meta por resposta" value={limit} onChange={(event) => setLimit(Number(event.target.value))}>{[30, 60, 90, 120, 180].map((value) => <option key={value} value={value}>{value} segundos · meta interna</option>)}</select></label>
      <button type="button" className="ng-button ng-button--primary" onClick={start}><Play size={16} />Iniciar simulação</button>
    </div> : <div className="learning-session">
      <div className="learning-row"><p>Pergunta {session.answers.length + 1}/{session.deck.length} · {session.mode === 'individual' ? session.participants[0].name : 'Resposta coletiva'}</p><span className={seconds > session.limit ? 'text-amber-200' : 'text-cyan-200'} role="timer" aria-label="Tempo desta resposta">{time(seconds)} / {time(session.limit)}</span></div>
      <h4>{question.question}</h4><p className="learning-muted">{question.area === 'game' ? 'Pergunta interna da equipe, sem origem em rubrica oficial.' : 'Pergunta de treino adaptada do roteiro de juízes. Responda com suas palavras.'} {session.mode === 'individual' && 'Explique sua contribuição e o que aprendeu com a equipe.'}</p>
      <div className="learning-actions"><button type="button" className="ng-button" onClick={pause}>{running ? <Pause size={14} /> : <Play size={14} />}{running ? 'Pausar cronômetro' : 'Retomar cronômetro'}</button>{speech.supported && <button type="button" className="ng-button" onClick={speech.playing ? speech.stop : speech.speak}><Volume2 size={14} />{speech.playing ? 'Parar leitura' : 'Ouvir pergunta'}</button>}<button type="button" className="ng-button" onClick={() => setHelped(true)}>Consultar orientação</button></div>
      {helped && <p className="learning-hint">{question.answer(answerContext)} A consulta ficará marcada no resultado.</p>}
      <fieldset><legend>Como foi a resposta? · autoavaliação interna</legend><div className="learning-actions">{TRAINING_RATINGS.map((item) => <button type="button" key={item.id} className="ng-button" aria-pressed={rating === item.id} onClick={() => setRating(item.id)}>{item.label}</button>)}</div></fieldset>
      <label>Aprendizado ou próximo passo<textarea aria-label="Aprendizado ou próximo passo" value={note} maxLength={1200} rows={2} onChange={(event) => setNote(event.target.value)} placeholder="Que exemplo ou evidência precisamos preparar?" /></label>
      <div className="learning-actions"><button type="button" disabled={rating === null} className="ng-button ng-button--primary" onClick={() => handleRegister(Date.now())}><Save size={15} />{session.answers.length + 1 === session.deck.length ? 'Registrar e concluir' : 'Registrar e próxima pergunta'}</button>{session.answers.length > 0 && <button type="button" className="ng-button" onClick={() => finish(session.answers)}>Encerrar com respostas já registradas</button>}<button type="button" className="ng-button" onClick={() => { if (window.confirm('Sair sem salvar as respostas desta simulação?')) { speech.stop(); setSession(null); } }}>Descartar treino em andamento</button></div>
      <p className="learning-muted">O cronômetro conta o tempo enquanto estiver ativo, inclusive em outra aba. A meta não encerra sua fala. Treino em andamento não é recuperado ao fechar ou trocar de página.</p>
    </div>}
    {message && <p role="status" className="learning-hint">{message}</p>}
    <details className="learning-history"><summary>Histórico neste navegador · {history.length} simulação(ões), até 50</summary>{[...history].reverse().map((record) => <article key={record.id}><strong>{new Date(record.finishedAt).toLocaleString('pt-BR')} · {record.participants.map((person) => person.name).join(', ')}</strong><p>{record.answers.length} resposta(s) · {record.answers.filter((answer) => answer.rating >= 2).length} claras ou com evidência · critério interno</p><div className="learning-actions"><button type="button" className="ng-button" onClick={() => copy(record)}><Copy size={14} />Copiar resumo</button><button type="button" className="ng-button" onClick={() => downloadBlob(new Blob([trainingSummary(record)], { type: 'text/plain;charset=utf-8' }), `simulacao-${record.finishedAt.slice(0, 10)}.txt`)}><Download size={14} />Baixar resumo</button></div><details><summary>Ver respostas e próximos passos</summary><pre className="learning-pre">{trainingSummary(record)}</pre></details></article>)}</details>
  </section>;
}
