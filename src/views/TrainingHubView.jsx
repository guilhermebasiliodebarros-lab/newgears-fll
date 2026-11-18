import { useEffect, useReducer, useRef, useState } from 'react';
import { ArrowRight, BookOpen, Bot, Check, CheckCircle2, ChevronRight, CircleHelp, Clock3, Code2, Download, Flag, History, Lightbulb, MessageCircle, Pause, Play, Plus, Save, Target, Timer } from 'lucide-react';
import { EmptyState, InterfaceButton } from '../components/InterfacePrimitives';
import { browserStorage } from '../utils/browserStorage';
import { downloadBlob } from '../utils/download';
import { TRAINING_TRACKS, formatTrainingTime, readTrainingWorkspace, reduceTrainingWorkspace, remainingTrainingSeconds, trainingReport, trainingStorageKey, trainingTrack } from '../utils/trainingSession';
import './TrainingHubView.css';

const trackIcons = { robot: Bot, code: Code2, innovation: Lightbulb, presentation: MessageCircle };
const statusLabels = { ready: 'Pronto para começar', running: 'Foco no que importa', paused: 'Uma pausa para respirar', reflection: 'Tempo de registrar', completed: 'Mais um passo na evolução' };

export default function TrainingHubView({ scope, onNavigate }) {
  const storageKey = trainingStorageKey(scope);
  const [workspace, dispatch] = useReducer(reduceTrainingWorkspace, storageKey, (key) => readTrainingWorkspace(browserStorage.getItem(key)));
  const [now, setNow] = useState(Date.now);
  const [message, setMessage] = useState('');
  const goalField = useRef(null);
  const notesField = useRef(null);
  const { session, history } = workspace;
  const track = trainingTrack(session.trackId);
  const TrackIcon = trackIcons[track.id];
  const remaining = remainingTrainingSeconds(session, now);
  const finished = session.status === 'completed';
  const started = session.status !== 'ready';
  const elapsed = session.durationSeconds - remaining;
  const totalSeconds = history.reduce((sum, item) => sum + item.durationSeconds - item.remainingSeconds, 0);

  useEffect(() => { browserStorage.setItem(storageKey, JSON.stringify(workspace)); }, [storageKey, workspace]);
  useEffect(() => {
    if (session.status !== 'running') return;
    const tick = () => { const time = Date.now(); setNow(time); dispatch({ type: 'tick', now: time }); };
    tick();
    const interval = setInterval(tick, 1000);
    document.addEventListener('visibilitychange', tick);
    return () => { clearInterval(interval); document.removeEventListener('visibilitychange', tick); };
  }, [session.status]);
  useEffect(() => {
    if (session.status === 'reflection') notesField.current?.focus({ preventScroll: true });
  }, [session.status]);

  const send = (action) => { const time = Date.now(); setNow(time); setMessage(''); dispatch({ ...action, now: time }); };
  const start = () => {
    if (!session.goal.trim()) { setMessage('Escreva um objetivo para dar direção ao seu treino.'); goalField.current?.focus(); return; }
    send({ type: 'start' });
  };
  const exportSessions = () => {
    downloadBlob(new Blob([trainingReport(history)], { type: 'text/plain;charset=utf-8' }), 'new-gears-treinos.txt');
    setMessage('Histórico exportado. Você pode usar os aprendizados no diário da equipe.');
  };
  const step = finished || session.status === 'reflection' ? 3 : started ? 2 : 1;

  return <section className="ng-training" aria-labelledby="training-title">
    <header className="ng-training__heading"><div><p className="ng-eyebrow"><span className="ng-live-dot" />Da ideia à prática</p><h2 id="training-title">Um objetivo. Um treino.<br /><span>Uma nova descoberta.</span></h2><p>Escolha o foco, experimente com intenção e guarde o que aprendeu.</p></div><div className="ng-training__summary"><span><strong>{history.length}</strong>treinos registrados</span><span><strong>{Math.floor(totalSeconds / 60)}<small>min</small></strong>de foco registrado</span></div></header>

    <ol className="ng-training__steps" aria-label="Etapas do treino">{['Planejar', 'Experimentar', 'Registrar'].map((label, index) => <li key={label} aria-current={step === index + 1 ? 'step' : undefined} data-done={step > index + 1}><span>{step > index + 1 ? <Check size={13} /> : `0${index + 1}`}</span>{label}{index < 2 && <ChevronRight size={13} aria-hidden="true" />}</li>)}</ol>

    <fieldset className="ng-training__tracks" disabled={started}><legend>Qual frente vamos explorar?</legend>{TRAINING_TRACKS.map((item) => { const Icon = trackIcons[item.id]; return <button type="button" key={item.id} aria-pressed={track.id === item.id} onClick={() => send({ type: 'track', id: item.id })}><span className="ng-training__track-icon"><Icon size={21} /></span><span><strong>{item.label}</strong><small>{item.tag}</small></span><span className="ng-training__track-check">{track.id === item.id && <Check size={12} />}</span></button>; })}</fieldset>

    <div className="ng-training__layout">
      <div className="ng-training__workbench">
        <section className="ng-panel ng-training__plan" aria-labelledby="training-plan-title"><div className="ng-section-header"><div><p className="ng-eyebrow">01 · Dê uma direção</p><h3 id="training-plan-title">O que você quer descobrir?</h3></div><Target size={20} aria-hidden="true" /></div><p>{track.description}</p><label htmlFor="training-goal">Objetivo deste treino</label><textarea ref={goalField} id="training-goal" value={session.goal} disabled={finished} maxLength={180} placeholder={track.placeholder} onChange={(event) => send({ type: 'goal', value: event.target.value })} aria-describedby="training-goal-help" /><span id="training-goal-help" className="ng-training__field-help">Seja específico: o que vai mostrar que o teste deu certo?<span>{session.goal.length}/180</span></span><div className="ng-training__duration"><label htmlFor="training-duration"><Clock3 size={15} />Tempo reservado</label><select id="training-duration" value={session.durationSeconds / 60} disabled={started} onChange={(event) => send({ type: 'duration', minutes: Number(event.target.value) })}>{[10, 15, 25, 30, 45, 60].map((minutes) => <option key={minutes} value={minutes}>{minutes} minutos</option>)}</select></div></section>

        <section className="ng-panel ng-training__checklist" aria-labelledby="training-checklist-title"><div className="ng-section-header"><div><p className="ng-eyebrow">02 · Aprenda fazendo</p><h3 id="training-checklist-title">Pequenos passos, bons testes.</h3></div><span className="ng-badge">{session.checked.length}/{track.checks.length}</span></div><div className="ng-progress" role="progressbar" aria-label="Checklist do treino" aria-valuenow={session.checked.length} aria-valuemin={0} aria-valuemax={track.checks.length}><span style={{ width: `${session.checked.length / track.checks.length * 100}%` }} /></div><ul>{track.checks.map((item, index) => <li key={`${track.id}-${index}`}><label data-checked={session.checked.includes(index)}><input type="checkbox" checked={session.checked.includes(index)} disabled={finished} onChange={() => send({ type: 'check', index })} /><span>{item}</span></label></li>)}</ul></section>

        <section className="ng-panel ng-training__notes" aria-labelledby="training-notes-title"><div className="ng-section-header"><div><p className="ng-eyebrow">03 · Faça virar aprendizado</p><h3 id="training-notes-title">O que você leva deste treino?</h3></div><BookOpen size={20} aria-hidden="true" /></div><label htmlFor="training-notes">Resultado e próximo passo <span>(opcional)</span></label><textarea ref={notesField} id="training-notes" value={session.notes} maxLength={2000} disabled={finished} onChange={(event) => send({ type: 'notes', value: event.target.value })} placeholder="O que funcionou? O que você mudaria? Que teste vem agora?" /><p className="ng-training__save-hint"><Save size={13} />Rascunho salvo automaticamente neste dispositivo.</p></section>
      </div>

      <aside className="ng-training__sidebar" aria-label="Cronômetro e ferramentas do treino">
        <section className="ng-training__timer" data-status={session.status}>
          <div className="ng-training__timer-top"><span><TrackIcon size={16} />{track.label}</span><span>{session.status === 'running' ? <><span className="ng-live-dot" />Em andamento</> : session.status === 'paused' ? 'Pausado' : finished ? 'Registrado' : session.status === 'reflection' ? 'Tempo encerrado' : 'Seu momento de foco'}</span></div>
          <div className="ng-training__clock">
            <svg viewBox="0 0 220 220" aria-hidden="true"><circle cx="110" cy="110" r="97" className="ng-training__clock-track" /><circle cx="110" cy="110" r="97" className="ng-training__clock-progress" pathLength="100" strokeDasharray="100" strokeDashoffset={100 - remaining / session.durationSeconds * 100} /></svg>
            <div><Timer size={21} aria-hidden="true" /><span role="timer" aria-label={finished ? 'Tempo de foco registrado' : 'Tempo restante'} aria-live="off">{formatTrainingTime(finished ? elapsed : remaining)}</span><small>{finished ? 'de foco registrado' : `${session.durationSeconds / 60} minutos para explorar`}</small></div>
          </div>
          <h3>{statusLabels[session.status]}</h3>
          <p>{session.status === 'ready' ? 'Uma melhoria de cada vez já faz diferença.' : session.status === 'running' ? 'Você pode navegar pelo site. O tempo continua.' : session.status === 'paused' ? 'Retome quando estiver pronto para continuar.' : session.status === 'reflection' ? 'O cronômetro terminou. Conte o que descobriu e conclua o treino.' : 'Uma experiência para levar adiante. Qual será a próxima descoberta?'}</p>
          <div className="ng-training__timer-actions">
            {session.status === 'running' ? <InterfaceButton variant="primary" onClick={() => send({ type: 'pause' })}><Pause size={17} />Pausar treino</InterfaceButton> : ['ready', 'paused'].includes(session.status) ? <InterfaceButton variant="primary" onClick={start}><Play size={17} fill="currentColor" />{session.status === 'paused' ? 'Continuar treino' : 'Começar treino'}</InterfaceButton> : null}
            {started && !finished && <InterfaceButton onClick={() => send({ type: 'finish' })}><Flag size={16} />Concluir e registrar</InterfaceButton>}
            {finished && <InterfaceButton variant="primary" onClick={() => { send({ type: 'new' }); requestAnimationFrame(() => goalField.current?.focus()); }}><Plus size={17} />Planejar outro treino</InterfaceButton>}
          </div>
          <div className="ng-training__timer-note"><CircleHelp size={14} /><span>Este é o tempo de foco do encontro. Os cronômetros de round continuam na área do robô.</span></div>
        </section>

        <div className="ng-training__connections"><p className="ng-eyebrow">Continue construindo</p><button type="button" onClick={() => onNavigate(track.destination)}><span><TrackIcon size={18} /><strong>{track.destinationLabel}</strong></span><ArrowRight size={16} /></button><button type="button" onClick={() => onNavigate('logbook')}><span><BookOpen size={18} /><strong>Levar aprendizados ao diário</strong></span><ArrowRight size={16} /></button></div>
        <p className="ng-training__local-note"><Save size={14} />Seu planejamento e os últimos 20 treinos ficam neste navegador, separados por perfil e temporada. Exporte para guardar uma cópia.</p>
      </aside>
    </div>

    <div className="ng-training__status" role="status" aria-live="polite">{message || (finished ? <><CheckCircle2 size={17} />Treino registrado neste dispositivo. Cada descoberta conta!</> : session.status === 'reflection' ? 'Tempo encerrado. Registre seus aprendizados antes de concluir.' : '')}</div>

    <section className="ng-panel ng-training__history" aria-labelledby="training-history-title"><div className="ng-section-header"><div><p className="ng-eyebrow"><History size={13} />Um passo depois do outro</p><h3 id="training-history-title">Seu histórico de descobertas</h3></div><InterfaceButton disabled={!history.length} onClick={exportSessions}><Download size={15} />Exportar</InterfaceButton></div>{history.length ? <ul>{history.map((item) => { const itemTrack = trainingTrack(item.trackId); const Icon = trackIcons[itemTrack.id]; return <li key={item.id}><span className="ng-training__history-icon"><Icon size={19} /></span><div><strong>{item.goal}</strong><p>{itemTrack.label} · {new Date(item.completedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} · {formatTrainingTime(item.durationSeconds - item.remainingSeconds)} de foco</p>{item.notes && <details><summary>Ver aprendizado<ChevronRight size={13} /></summary><p>{item.notes}</p></details>}</div><span className="ng-badge"><Check size={12} />{item.checked.length}/{itemTrack.checks.length}</span></li>; })}</ul> : <EmptyState compact icon={<Lightbulb size={25} />} title="Seu primeiro registro começa com uma tentativa." description="Defina um objetivo acima e comece o treino. Suas descobertas vão aparecer aqui." />}</section>
  </section>;
}
