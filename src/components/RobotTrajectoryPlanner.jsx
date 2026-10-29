import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { AlertTriangle, ArrowDown, ArrowUp, Copy, Download, Hand, Image as ImageIcon, MapPin, Pause, Play, Plus, RotateCcw, RotateCw, Save, Trash2, Undo2, Upload } from 'lucide-react';
import useGearShopContext from '../hooks/useGearShopContext';
import { canEditTrajectory, deleteTrajectory, saveTrajectory, subscribeTrajectories, trajectoryActorId, trajectoryError } from '../services/robotTrajectories';
import { analyzeTrajectory, importTrajectory, newTrajectory, normalizeHeading, TRAJECTORY_ACTIONS, TRAJECTORY_MAX_POINTS, trajectoriesForExit, trajectoryCollisions, trajectoryCommands, trajectoryDocument, trajectoryExitNumber, trajectoryNumber, trajectoryOutside, trajectoryPath, trajectoryPoint, trajectoryPose, trajectoryTimeline, validateTrajectory } from '../utils/robotTrajectory';
import TrajectorySetup from './TrajectorySetup';
import TrajectoryObstacles from './TrajectoryObstacles';
import TrajectoryRoundControls from './TrajectoryRoundControls';

const inputClass = 'mt-1 w-full min-w-0 rounded-xl border border-white/15 bg-slate-950 px-3 py-2.5 text-sm text-white';
const buttonClass = 'inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-xs font-bold text-slate-200 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40';
const makeId = () => crypto.randomUUID();
const freshDraft = () => ({ id: makeId(), revision: 0, ownerId: '', dirty: false, plan: newTrajectory() });

function restoreDraft(key) {
  try {
    const text = localStorage.getItem(key);
    if (text && text.length < 100000) {
      const draft = JSON.parse(text);
      if (/^[a-zA-Z0-9_-]{1,160}$/.test(draft.id) && Number.isSafeInteger(draft.revision) && draft.revision >= 0 && typeof draft.ownerId === 'string') {
        const plan = validateTrajectory(draft.plan, { allowEmpty: true });
        // Show the season table on the first visit after this update, preserving the route.
        if (!draft.bioglowBackgroundVersion && plan.settings.map === 'grid') {
          plan.settings.map = 'bioglow';
          return { ...draft, plan, dirty: Boolean(draft.dirty || draft.revision || plan.points.length || plan.title) };
        }
        return { ...draft, plan };
      }
    }
  } catch { /* An invalid local draft never replaces the shared plans. */ }
  return freshDraft();
}

function downloadPlan(plan, commandsOnly = false) {
  const clean = validateTrajectory(plan);
  const body = commandsOnly
    ? [`${clean.title} — planejamento de trajeto`, `Campo: ${clean.settings.width} × ${clean.settings.height} cm. Orientação inicial: ${clean.settings.heading}°.`, 'X cresce para a direita; Y cresce para cima. 0° aponta para a direita.', 'Confira as medidas e calibre no robô real.', '', ...trajectoryCommands(clean).map((command, index) => `${index + 1}. ${command.label}${clean.points[command.point]?.note ? ` — ${clean.points[command.point].note}` : ''}`), '', clean.notes].join('\n')
    : trajectoryDocument(clean);
  const url = URL.createObjectURL(new Blob([body], { type: commandsOnly ? 'text/plain;charset=utf-8' : 'application/json' }));
  const link = document.createElement('a'); link.href = url; link.download = `trajeto-${clean.title.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 60)}.${commandsOnly ? 'txt' : 'json'}`;
  link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function RobotTrajectoryPlanner({ rounds = [], attachments = [], robotVersions = [], readonly = false }) {
  const { db, user, seasonId } = useGearShopContext();
  return <TrajectoryEditor key={`${seasonId}:${trajectoryActorId(user)}`} db={db} user={user} seasonId={seasonId} rounds={rounds} attachments={attachments} robotVersions={robotVersions} readonly={readonly} />;
}

function TrajectoryEditor({ db, user, seasonId, rounds, attachments, robotVersions, readonly }) {
  const storageKey = `newgears_robot_trajectory_v1:${encodeURIComponent(trajectoryActorId(user))}:${encodeURIComponent(seasonId)}`;
  const [draft, setDraft] = useState(() => restoreDraft(storageKey));
  const [library, setLibrary] = useState({ records: [], loading: true, error: '' });
  const [selectedPoint, setSelectedPoint] = useState('');
  const [mode, setMode] = useState('add');
  const [snap, setSnap] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [storageError, setStorageError] = useState(false);
  const [busy, setBusy] = useState(false);
  const saving = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const elapsedRef = useRef(0);
  const [speed, setSpeed] = useState(1);
  const [playbackRun, setPlaybackRun] = useState(0);
  const [roundSession, setRoundSession] = useState(null);
  const [selectedObstacle, setSelectedObstacle] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const exitDrafts = useRef(new Map());
  const drag = useRef(null);
  const history = useRef([]);
  const [undoCount, setUndoCount] = useState(0);
  const svg = useRef(null);
  const fileInput = useRef(null);
  const gridId = useId();
  const inRound = Boolean(roundSession); const roundIndex = roundSession?.index ?? -1;
  const plan = roundSession ? roundSession.entries[roundSession.index].plan : draft.plan;
  const settings = plan.settings;
  const currentExit = trajectoryExitNumber(plan, rounds);
  const draftExit = trajectoryExitNumber(draft.plan, rounds);
  const writable = !readonly && (!draft.ownerId || canEditTrajectory(user, draft));
  const editing = writable && !playing && !busy && !inRound;
  const commands = useMemo(() => trajectoryCommands(plan), [plan]);
  const timeline = useMemo(() => trajectoryTimeline(plan), [plan]);
  const duration = timeline.at(-1)?.end || 0;
  const pose = trajectoryPose(plan, timeline, elapsed);
  const outside = plan.points.length > 0 && trajectoryOutside(plan, pose);
  const collisions = plan.points.length ? trajectoryCollisions(plan, pose) : [];
  const pointIndex = plan.points.findIndex((point) => point.id === selectedPoint);
  const point = plan.points[pointIndex];
  const distance = commands.reduce((sum, command) => sum + (command.distance || 0), 0);

  useEffect(() => subscribeTrajectories({ db, seasonId, onData: (records) => setLibrary({ records, loading: false, error: '' }), onError: (issue) => setLibrary((current) => ({ ...current, loading: false, error: trajectoryError(issue) })) }), [db, seasonId]);
  useEffect(() => {
    const snapshot = { ...draft, bioglowBackgroundVersion: 1 };
    exitDrafts.current.set(draftExit, snapshot);
    try {
      localStorage.setItem(storageKey, JSON.stringify(snapshot));
      if (draftExit) localStorage.setItem(`${storageKey}:exit:${draftExit}`, JSON.stringify(snapshot));
    } catch { queueMicrotask(() => setStorageError(true)); }
  }, [draft, storageKey, draftExit]);
  useEffect(() => {
    if (!playing || !duration) return;
    const start = performance.now(); const initial = elapsedRef.current;
    let frame;
    const animate = (now) => {
      const next = Math.min(duration, initial + (now - start) * speed);
      elapsedRef.current = next; setElapsed(next);
      if (next < duration) frame = requestAnimationFrame(animate); else { setPlaying(false); if (inRound) setRoundSession((current) => current ? { ...current, waiting: true } : null); }
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [playing, duration, speed, playbackRun, inRound, roundIndex]);

  const resetPlayback = () => { setPlaying(false); setElapsed(0); elapsedRef.current = 0; };
  const updatePlan = (next, remember = true) => {
    if (!writable || saving.current || inRound) return;
    if (remember) { history.current = [...history.current.slice(-29), plan]; setUndoCount(history.current.length); }
    resetPlayback(); setError(''); setNotice(''); setAnalysis(null);
    setDraft((current) => ({ ...current, dirty: true, plan: next }));
  };
  const replaceDraft = (next, confirm = true) => {
    if (saving.current || inRound || (confirm && draft.dirty && !window.confirm('Trocar de trajeto e descartar as alterações ainda não salvas?'))) return false;
    resetPlayback(); history.current = []; setUndoCount(0); setSelectedPoint(''); setSelectedObstacle(''); setAnalysis(null); setDraft(next); setNotice(''); setError('');
    return true;
  };
  const openExit = (number) => {
    if (saving.current || inRound) return;
    exitDrafts.current.set(currentExit, draft);
    try { if (currentExit) localStorage.setItem(`${storageKey}:exit:${currentExit}`, JSON.stringify({ ...draft, bioglowBackgroundVersion: 1 })); } catch { setStorageError(true); }
    const records = trajectoriesForExit(library.records, number, rounds);
    let cached = exitDrafts.current.get(number);
    try { if (!cached && localStorage.getItem(`${storageKey}:exit:${number}`)) cached = restoreDraft(`${storageKey}:exit:${number}`); } catch { /* Session cache still works when storage is unavailable. */ }
    if (cached && trajectoryExitNumber(cached.plan, rounds) !== number) cached = null;
    try {
      let next;
      if (cached?.dirty || (cached && !cached.revision && !records.length)) next = cached;
      else {
        const record = records.find((item) => item.id === cached?.id) || records.find((item) => item.ownerId === trajectoryActorId(user)) || records[0];
        if (record) next = { id: record.id, revision: record.revision, ownerId: record.ownerId, dirty: false, plan: validateTrajectory(record) };
        else {
          const round = rounds.find((item) => trajectoryExitNumber({ roundId: item.id }, rounds) === number);
          next = { ...freshDraft(), plan: { ...newTrajectory(), title: `Saída ${number}`, exitNumber: number, roundId: round?.id || '', settings: { ...settings, heading: 0 }, obstacles: plan.obstacles.map((item) => ({ ...item })) } };
        }
      }
      replaceDraft(next, false);
    } catch (issue) { setError(issue.message); }
  };
  const startExitPreview = () => {
    resetPlayback(); setPlaybackRun((value) => value + 1); setPlaying(true);
  };
  const duplicate = () => { replaceDraft({ ...freshDraft(), dirty: true, plan: { ...plan, title: `${plan.title || 'Novo trajeto'} (cópia)`.slice(0, 100) } }, false); };
  const updatePoint = (changes) => updatePlan({ ...plan, points: plan.points.map((entry) => entry.id === selectedPoint ? { ...entry, ...changes } : entry) });
  const eventPosition = (event) => {
    const matrix = svg.current.getScreenCTM(); if (!matrix) return null;
    const cursor = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    const quantize = (value, max) => trajectoryNumber(Math.max(0, Math.min(max, snap ? Math.round(value / 5) * 5 : value)));
    return { x: quantize(cursor.x, settings.width), y: quantize(settings.height - cursor.y, settings.height) };
  };
  const addPoint = (position) => {
    if (!editing) return;
    if (plan.points.length >= TRAJECTORY_MAX_POINTS) { setError('Este trajeto já tem 80 pontos. Crie outro plano para continuar.'); return; }
    const next = trajectoryPoint({ id: makeId(), ...position, action: 'none', note: '' });
    updatePlan({ ...plan, points: [...plan.points, next] }); setSelectedPoint(next.id);
  };
  const reorderPoint = (direction) => {
    const nextIndex = pointIndex + direction;
    if (nextIndex < 0 || nextIndex >= plan.points.length) return;
    const points = [...plan.points]; [points[pointIndex], points[nextIndex]] = [points[nextIndex], points[pointIndex]];
    updatePlan({ ...plan, points });
  };
  const save = async () => {
    if (saving.current || !writable || inRound) return;
    saving.current = true; setBusy(true); setError(''); setNotice('');
    try {
      const result = await saveTrajectory({ db, user, seasonId, id: draft.id, expectedRevision: draft.revision, plan: { ...plan, exitNumber: currentExit } });
      setDraft({ id: result.id, revision: result.record.revision, ownerId: result.record.ownerId, dirty: false, plan: validateTrajectory(result.record) });
      setNotice('Trajeto salvo para a equipe.');
    } catch (issue) { setError(trajectoryError(issue)); }
    finally { saving.current = false; setBusy(false); }
  };
  const remove = async () => {
    const record = library.records.find((item) => item.id === draft.id);
    if (!record || saving.current || inRound || !window.confirm(`Excluir o trajeto “${record.title}” da equipe?`)) return;
    saving.current = true; setBusy(true); setError('');
    try { await deleteTrajectory({ db, user, seasonId, id: record.id, expectedRevision: record.revision }); if (draft.id === record.id) { resetPlayback(); exitDrafts.current.delete(currentExit); try { localStorage.removeItem(`${storageKey}:exit:${currentExit}`); } catch { setStorageError(true); } setDraft(freshDraft()); history.current = []; setUndoCount(0); setSelectedPoint(''); } setNotice('Trajeto excluído.'); }
    catch (issue) { setError(trajectoryError(issue)); }
    finally { saving.current = false; setBusy(false); }
  };
  const tryExport = (text) => { try { downloadPlan(plan, text); setError(''); } catch (issue) { setError(issue.message); } };
  const selectedRecord = library.records.find((record) => record.id === draft.id);
  const roundPlans = Array.from({ length: 8 }, (_, index) => {
    const number = index + 1; const records = trajectoriesForExit(library.records, number, rounds);
    const record = records.find((item) => item.ownerId === trajectoryActorId(user)) || records[0];
    return record ? { number, record } : null;
  }).filter(Boolean);
  const startRound = (order) => {
    try {
      const entries = order.map((number) => { const source = roundPlans.find((item) => item.number === number); return { number, plan: validateTrajectory(source.record) }; });
      if (entries.some((entry) => !trajectoryTimeline(entry.plan).length)) throw new Error('Cada saída do round precisa ter movimentos ou ações registrados.');
      resetPlayback(); setAnalysis(null); setRoundSession({ entries, index: 0, waiting: false }); setPlaybackRun((value) => value + 1); setPlaying(true); setError('');
    } catch (issue) { setError(issue.message); }
  };
  const scale = settings.width / 240;

  return <section aria-label="Simulador de trajetos" className="space-y-5 rounded-[28px] border border-cyan-300/20 bg-[#101827] p-4 text-slate-100 md:p-6">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-200">Planeje · visualize · teste</p><h3 className="mt-2 text-2xl font-black">Simulador de trajetos</h3><p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-300">Marque os pontos do percurso e as ações da garra. Veja o robô percorrer o plano antes de levar a ideia à mesa.</p></div>
      <span className="rounded-full border border-cyan-200/25 bg-cyan-200/5 px-3 py-1.5 text-xs font-bold text-cyan-100">Prévia de planejamento em 2D</span>
    </div>
    <p className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs leading-relaxed text-slate-300">As distâncias seguem as medidas informadas. A verificação de contato usa as áreas marcadas, o corpo e a garra na vista de cima. A prévia não calcula atrito, sensores ou tempo real; calibre os movimentos no robô.</p>
    <TrajectoryRoundControls available={roundPlans.map((entry) => entry.number)} session={roundSession} disabled={busy || library.loading} onStart={startRound} onNext={() => { resetPlayback(); setRoundSession((current) => ({ ...current, index: current.index + 1, waiting: false })); setPlaybackRun((value) => value + 1); setPlaying(true); }} onEnd={() => { resetPlayback(); setRoundSession(null); setAnalysis(null); }} />

    <div className="space-y-3 rounded-2xl border border-violet-300/20 bg-violet-300/5 p-3 md:p-4">
      <div><h4 className="text-sm font-black">Saídas do simulador</h4><p className="mt-1 text-xs leading-relaxed text-slate-300">Escolha uma saída para carregar seu percurso e a orientação de largada. Registre para compartilhar com a equipe; os rascunhos ficam separados neste navegador.</p></div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">{Array.from({ length: 8 }, (_, index) => {
        const number = index + 1; const records = trajectoriesForExit(library.records, number, rounds);
        return <button key={number} type="button" aria-label={`Abrir Saída ${number}`} aria-pressed={currentExit === number} disabled={busy || inRound || library.loading || (readonly && !records.length)} onClick={() => openExit(number)} className={`rounded-xl border p-3 text-left disabled:opacity-40 ${currentExit === number ? 'border-violet-200 bg-violet-300/15 text-white' : 'border-white/10 bg-black/15 text-slate-300 hover:bg-white/5'}`}><strong className="block text-sm">Saída {number}</strong><span className="mt-1 block text-[10px]">{records.length ? `${records.length} plano(s) registrado(s)` : 'Novo percurso'}</span></button>;
      })}</div>
      {currentExit > 0 && <div className="flex flex-wrap items-center gap-2"><span className="mr-1 text-xs font-bold text-violet-100">Saída {currentExit} · largada {settings.heading}°</span>{!readonly && <button className={buttonClass} disabled={!editing || !draft.dirty || plan.points.length < 2} onClick={save}><Save size={14} />{draft.revision ? `Salvar Saída ${currentExit}` : `Registrar Saída ${currentExit}`}</button>}<button className={buttonClass} disabled={busy || inRound || !duration} onClick={startExitPreview}><Play size={14} />Reproduzir Saída {currentExit}</button></div>}
    </div>

    <div className="flex flex-wrap items-center gap-2">
      {!readonly && <><button className={buttonClass} disabled={busy || inRound} onClick={() => replaceDraft(freshDraft())}><Plus size={15} />Novo</button><button className={buttonClass} disabled={busy || inRound || !plan.points.length} onClick={duplicate}><Copy size={15} />Duplicar</button><button className={buttonClass} disabled={busy || inRound || !selectedRecord || !canEditTrajectory(user, selectedRecord)} onClick={remove}><Trash2 size={15} />Excluir plano</button></>}
      {selectedRecord && <button className={buttonClass} disabled={busy || inRound} onClick={() => { try { replaceDraft({ id: selectedRecord.id, revision: selectedRecord.revision, ownerId: selectedRecord.ownerId, dirty: false, plan: validateTrajectory(selectedRecord) }); } catch (issue) { setError(issue.message); } }}><RotateCcw size={15} />Recarregar versão salva</button>}
    </div>
    {library.error && <p role="alert" className="text-sm text-amber-200">{library.error} Você pode continuar planejando e exportar o arquivo.</p>}
    {!writable && !readonly && <p className="text-sm text-cyan-200">Este plano é de outro integrante. Use <strong>Duplicar</strong> para preparar sua própria versão.</p>}
    <div className="grid gap-3 md:grid-cols-[2fr,1fr,1fr]">
      <label className="min-w-0 text-xs text-slate-300">Nome do trajeto<input maxLength={100} value={plan.title} disabled={!editing} onChange={(event) => updatePlan({ ...plan, title: event.target.value })} placeholder="Ex.: Saída 1 — coleta e retorno" className={inputClass} /></label>
      <label className="min-w-0 text-xs text-slate-300">Vincular à saída<select aria-label="Vincular à saída" value={plan.roundId} disabled={!editing} onChange={(event) => updatePlan({ ...plan, roundId: event.target.value })} className={inputClass}><option value="">Plano independente</option>{plan.roundId && !rounds.some((round) => round.id === plan.roundId) && <option value={plan.roundId}>Saída indisponível — escolha outra</option>}{rounds.map((round) => <option key={round.id} value={round.id}>{round.name}</option>)}</select></label>
      <label className="min-w-0 text-xs text-slate-300">Identificação no simulador<select aria-label="Número da saída" value={plan.exitNumber} disabled={!editing} onChange={(event) => { const number = Number(event.target.value); updatePlan({ ...plan, exitNumber: number, title: plan.title || (number ? `Saída ${number}` : '') }); }} className={inputClass}><option value="0">Pelo nome ou vínculo</option>{Array.from({ length: 8 }, (_, index) => <option key={index} value={index + 1}>Saída {index + 1}</option>)}</select></label>
    </div>

    <TrajectorySetup key={JSON.stringify(settings)} settings={settings} attachments={attachments} robotVersions={robotVersions} disabled={!editing} onChange={(nextSettings) => { try { const next = validateTrajectory({ ...plan, settings: nextSettings }, { allowEmpty: true }); updatePlan(next); } catch (issue) { setError(issue.message); } }} />
    <details className="rounded-2xl border border-white/10 bg-black/15 p-3">
      <summary className="cursor-pointer text-sm font-bold">Medidas e orientação · {settings.width} × {settings.height} cm · início {settings.heading}°</summary>
      <form key={JSON.stringify(settings)} className="mt-4 space-y-3" onSubmit={(event) => {
        event.preventDefault(); if (!editing) return;
        const values = new FormData(event.currentTarget);
        const nextSettings = { ...settings, map: values.get('map'), ...Object.fromEntries(['width', 'height', 'robotWidth', 'robotLength', 'heading'].map((key) => [key, Number(values.get(key))])) };
        const next = { ...plan, settings: nextSettings, points: plan.points.map((entry) => ({ ...entry, x: trajectoryNumber(entry.x / settings.width * nextSettings.width), y: trajectoryNumber(entry.y / settings.height * nextSettings.height), controlX: trajectoryNumber(entry.controlX / settings.width * nextSettings.width), controlY: trajectoryNumber(entry.controlY / settings.height * nextSettings.height) })), obstacles: plan.obstacles.map((entry) => ({ ...entry, x: trajectoryNumber(entry.x / settings.width * nextSettings.width), y: trajectoryNumber(entry.y / settings.height * nextSettings.height) })) };
        try { validateTrajectory(next, { allowEmpty: true }); updatePlan(next); } catch (issue) { setError(issue.message); }
      }}>
        <fieldset disabled={!editing} className="grid gap-3 sm:grid-cols-3">
          {[['width', 'Largura do campo (cm)', 50, 500], ['height', 'Altura do campo (cm)', 50, 500], ['heading', 'Orientação inicial (graus)', -180, 180], ['robotLength', 'Comprimento do robô (cm)', 5, 50], ['robotWidth', 'Largura do robô (cm)', 5, 50]].map(([name, label, min, max]) => <label key={name} className="text-xs text-slate-300">{label}<input name={name} type="number" min={min} max={max} step="0.1" required defaultValue={settings[name]} className={inputClass} /></label>)}
          <label className="text-xs text-slate-300">Fundo do campo<select aria-label="Fundo do campo" name="map" defaultValue={settings.map} className={inputClass}><option value="grid">Grade de planejamento</option><option value="bioglow">Mesa Bioglow</option></select></label>
        </fieldset>
        <p className="text-xs text-slate-400">0° aponta à direita; 90° aponta para cima. Alterar as medidas reposiciona os pontos proporcionalmente. Ajuste a escala ao campo que você usa.</p>
        <button type="submit" className={buttonClass} disabled={!editing}>Aplicar medidas</button>
      </form>
    </details>

    <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr),320px]">
      <div className="min-w-0 space-y-3">
        <fieldset disabled={!editing} className="space-y-3 rounded-2xl border border-cyan-300/20 bg-cyan-300/5 p-3">
          <legend className="px-1 text-sm font-bold text-cyan-100">Girar robô na largada{currentExit ? ` · Saída ${currentExit}` : ''}</legend>
          <div className="flex flex-wrap items-center gap-2"><button type="button" className={buttonClass} onClick={() => updatePlan({ ...plan, settings: { ...settings, heading: normalizeHeading(settings.heading + 90) } })}><RotateCcw size={15} />Girar 90° à esquerda</button><button type="button" className={buttonClass} onClick={() => updatePlan({ ...plan, settings: { ...settings, heading: normalizeHeading(settings.heading - 90) } })}><RotateCw size={15} />Girar 90° à direita</button><label className="flex items-center gap-2 text-xs text-slate-300">Ângulo inicial<input aria-label="Ângulo inicial do robô" type="number" min="-180" max="180" step="1" value={settings.heading} onChange={(event) => { const value = Number(event.target.value); if (Number.isFinite(value) && value >= -180 && value <= 180) updatePlan({ ...plan, settings: { ...settings, heading: value } }); }} className="w-24 rounded-lg border border-white/15 bg-slate-950 p-2 text-white" />°</label></div>
          <label className="block text-xs text-slate-300">Ajustar rotação<input aria-label="Ajustar rotação inicial" type="range" min="-180" max="180" step="1" value={settings.heading} onChange={(event) => updatePlan({ ...plan, settings: { ...settings, heading: Number(event.target.value) } })} className="mt-2 block w-full accent-cyan-300" /></label>
          <div className="flex flex-wrap gap-2">{[[0, 'Direita →'], [90, 'Cima ↑'], [-90, 'Baixo ↓'], [180, 'Esquerda ←']].map(([heading, label]) => <button type="button" key={heading} aria-pressed={settings.heading === heading} onClick={() => updatePlan({ ...plan, settings: { ...settings, heading } })} className={`${buttonClass} ${settings.heading === heading ? '!border-cyan-200 !text-cyan-100' : ''}`}>{label}</button>)}</div>
          <p className="text-xs leading-relaxed text-slate-400">Define para onde a frente do robô aponta no ponto 1. Em cada trecho, escolha frente ou ré e reta ou curva suave.</p>
        </fieldset>
        <div className="flex flex-wrap items-center gap-2">
          <button aria-pressed={settings.map === 'bioglow'} disabled={!editing} onClick={() => updatePlan({ ...plan, settings: { ...settings, map: 'bioglow' } })} className={`${buttonClass} ${settings.map === 'bioglow' ? '!border-emerald-300/60 !text-emerald-200' : ''}`}><ImageIcon size={15} />Mesa Bioglow</button>
          <button aria-pressed={settings.map === 'grid'} disabled={!editing} onClick={() => updatePlan({ ...plan, settings: { ...settings, map: 'grid' } })} className={`${buttonClass} ${settings.map === 'grid' ? '!border-cyan-300/60 !text-cyan-200' : ''}`}>Somente grade</button>
          <button aria-pressed={mode === 'add'} disabled={!editing} onClick={() => setMode('add')} className={`${buttonClass} ${mode === 'add' ? '!border-cyan-300/60 !text-cyan-200' : ''}`}><MapPin size={15} />Adicionar pontos</button>
          <button aria-pressed={mode === 'move'} disabled={!editing} onClick={() => setMode('move')} className={`${buttonClass} ${mode === 'move' ? '!border-cyan-300/60 !text-cyan-200' : ''}`}><Hand size={15} />Mover pontos</button>
          <button className={buttonClass} disabled={!editing || !undoCount} onClick={() => { const previous = history.current.pop(); setUndoCount(history.current.length); if (previous) updatePlan(previous, false); }}><Undo2 size={15} />Desfazer</button>
          <button className={`${buttonClass} !border-rose-300/30 !text-rose-200`} disabled={!editing || !plan.points.length} onClick={() => { updatePlan({ ...plan, points: [] }); setSelectedPoint(''); setNotice('Pontos resetados. Use Desfazer para recuperar. A saída registrada só muda quando você salvar o novo percurso.'); }}><Trash2 size={15} />Resetar pontos</button>
          <label className="flex items-center gap-2 text-xs text-slate-300"><input type="checkbox" checked={snap} onChange={(event) => setSnap(event.target.checked)} />Encaixar a cada 5 cm</label>
        </div>
        <p className="text-xs text-slate-400">Clique ou toque no campo para adicionar pontos. Arraste para ajustar. Para usar ré, selecione o ponto de chegada do trecho e escolha Marcha à ré no painel de pontos.</p>
        <div className="overflow-hidden rounded-2xl border border-cyan-200/25 bg-slate-950 p-2">
          <svg ref={svg} viewBox={`0 0 ${settings.width} ${settings.height}`} role="img" aria-label="Campo interativo do trajeto" className="block max-h-[580px] w-full touch-none select-none" onPointerDown={(event) => { if (mode === 'add' && editing && event.button === 0) { const position = eventPosition(event); if (position) addPoint(position); } }} onPointerMove={(event) => {
            if (!drag.current || !editing) return;
            const position = eventPosition(event); if (!position) return;
            if (drag.current.kind === 'obstacle') updatePlan({ ...plan, obstacles: plan.obstacles.map((entry) => entry.id === drag.current.id ? { ...entry, ...position } : entry) }, false);
            else updatePlan({ ...plan, points: plan.points.map((entry) => entry.id === drag.current.id ? { ...entry, ...(drag.current.kind === 'control' ? { controlX: position.x, controlY: position.y } : position) } : entry) }, false);
          }} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}>
            <title>Trajeto planejado: {plan.title || 'novo plano'}</title>
            <defs><pattern id={gridId} width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="#334155" strokeWidth="0.25" /></pattern></defs>
            <rect width={settings.width} height={settings.height} fill="#0b1424" />
            {settings.map === 'bioglow' && <image href="/Bioglow.png" width={settings.width} height={settings.height} preserveAspectRatio="none" />}
            <rect width={settings.width} height={settings.height} fill={`url(#${gridId})`} opacity={settings.map === 'bioglow' ? 0.25 : 1} />
            <rect x="0.4" y="0.4" width={settings.width - 0.8} height={settings.height - 0.8} fill="none" stroke="#64748b" strokeWidth="0.8" />
            <text x="3" y={settings.height - 3} fill="#94a3b8" fontSize={3 * scale}>0,0 · X → · Y ↑</text>
            {plan.obstacles.map((entry) => <g key={entry.id} role="button" tabIndex="0" aria-label={`Objeto: ${entry.name}`} transform={`translate(${entry.x} ${settings.height - entry.y}) rotate(${-entry.heading})`} onClick={() => setSelectedObstacle(entry.id)} onKeyDown={(event) => { if (event.key === 'Enter') setSelectedObstacle(entry.id); }} onPointerDown={(event) => { event.stopPropagation(); setSelectedObstacle(entry.id); if (editing) { history.current = [...history.current.slice(-29), plan]; setUndoCount(history.current.length); drag.current = { kind: 'obstacle', id: entry.id }; svg.current.setPointerCapture(event.pointerId); } }} className="cursor-move"><rect x={-entry.width / 2} y={-entry.height / 2} width={entry.width} height={entry.height} rx="1" fill={entry.type === 'mission' ? '#fbbf2438' : '#fb718538'} stroke={selectedObstacle === entry.id ? '#ffffff' : entry.type === 'mission' ? '#fbbf24' : '#fb7185'} strokeWidth={0.7 * scale} /><text y={1.5 * scale} textAnchor="middle" fill="#fff" fontSize={3 * scale} paintOrder="stroke" stroke="#0f172a" strokeWidth={0.8 * scale}>{entry.name}</text></g>)}
            <path d={trajectoryPath(plan)} fill="none" stroke="#020617" strokeOpacity="0.8" strokeWidth={2.2 * scale} strokeLinecap="round" strokeLinejoin="round" pointerEvents="none" />
            <path data-testid="trajectory-line" d={trajectoryPath(plan)} fill="none" stroke="#22d3ee" strokeWidth={1.1 * scale} strokeLinecap="round" strokeLinejoin="round" pointerEvents="none" />
            {plan.points.map((entry, index) => index > 0 && entry.path === 'curve' ? <g key={`control-${entry.id}`}><path d={`M ${plan.points[index - 1].x} ${settings.height - plan.points[index - 1].y} L ${entry.controlX} ${settings.height - entry.controlY} L ${entry.x} ${settings.height - entry.y}`} fill="none" stroke="#c4b5fd" strokeWidth={0.5 * scale} strokeDasharray="2 2" pointerEvents="none" /><circle role="button" tabIndex="0" aria-label={`Controle da curva até o ponto ${index + 1}`} cx={entry.controlX} cy={settings.height - entry.controlY} r={3 * scale} fill="#8b5cf6" stroke="#ede9fe" strokeWidth={0.5 * scale} onKeyDown={(event) => { if (event.key === 'Enter') setSelectedPoint(entry.id); }} onPointerDown={(event) => { event.stopPropagation(); setSelectedPoint(entry.id); if (editing) { history.current = [...history.current.slice(-29), plan]; setUndoCount(history.current.length); drag.current = { kind: 'control', id: entry.id }; svg.current.setPointerCapture(event.pointerId); } }} /></g> : null)}
            {plan.points.map((entry, index) => <g key={entry.id} role="button" tabIndex="0" aria-label={`Ponto ${index + 1}: X ${entry.x}, Y ${entry.y}`} onKeyDown={(event) => { if (['Enter', ' '].includes(event.key)) { event.preventDefault(); setSelectedPoint(entry.id); } }} onPointerDown={(event) => {
              event.stopPropagation(); setSelectedPoint(entry.id);
              if (editing && event.button === 0) { event.preventDefault(); history.current = [...history.current.slice(-29), plan]; setUndoCount(history.current.length); drag.current = { kind: 'point', id: entry.id }; svg.current.setPointerCapture(event.pointerId); }
            }} onClick={() => setSelectedPoint(entry.id)} className="cursor-pointer">
              <circle cx={entry.x} cy={settings.height - entry.y} r={5 * scale} fill="transparent" />
              <circle cx={entry.x} cy={settings.height - entry.y} r={(selectedPoint === entry.id ? 3.4 : 2.8) * scale} fill={index === 0 ? '#34d399' : entry.action !== 'none' ? '#fbbf24' : '#0891b2'} stroke={selectedPoint === entry.id ? '#ffffff' : '#0f172a'} strokeWidth={0.6 * scale} />
              <text x={entry.x} y={settings.height - entry.y + 1.1 * scale} fontSize={3.2 * scale} fontWeight="900" textAnchor="middle" fill="#fff" pointerEvents="none">{index + 1}</text>
            </g>)}
            {plan.points.length > 0 && <g data-testid="trajectory-robot" transform={`translate(${pose.x} ${settings.height - pose.y}) rotate(${-pose.heading})`} pointerEvents="none">
              {settings.gripperLength > 0 && <g data-testid="trajectory-gripper"><rect x={settings.gripperX - settings.gripperLength / 2} y={-settings.gripperY - settings.gripperWidth / 2} width={settings.gripperLength} height={settings.gripperWidth} fill="#fbbf2460" stroke="#fbbf24" strokeWidth="0.7" /><path d={`M ${settings.gripperX + settings.gripperLength / 2} ${-settings.gripperY - settings.gripperWidth / 3} l 3 ${pose.action === 'open' ? -2 : 2} M ${settings.gripperX + settings.gripperLength / 2} ${-settings.gripperY + settings.gripperWidth / 3} l 3 ${pose.action === 'open' ? 2 : -2}`} stroke="#fbbf24" strokeWidth="1" /></g>}
              <rect x={-settings.robotLength / 2} y={-settings.robotWidth / 2} width={settings.robotLength} height={settings.robotWidth} rx="2" fill={outside ? '#fb7185' : '#e2e8f0'} fillOpacity="0.88" stroke="#020617" strokeWidth="0.6" />
              <rect x={-settings.robotLength / 3} y={-settings.robotWidth / 2 - 1} width={settings.robotLength * 0.55} height="2" rx="0.5" fill="#020617" /><rect x={-settings.robotLength / 3} y={settings.robotWidth / 2 - 1} width={settings.robotLength * 0.55} height="2" rx="0.5" fill="#020617" />
              <path d={`M ${settings.robotLength / 2 - 1} 0 l -4 -3 v 6 z`} fill="#0891b2" />
              <path d={`M ${settings.robotLength / 2} -3 l 4 ${pose.action === 'open' ? -3 : pose.action === 'raise' ? -1 : 1} M ${settings.robotLength / 2} 3 l 4 ${pose.action === 'open' ? 3 : pose.action === 'raise' ? 1 : -1}`} stroke={pose.action === 'none' ? '#94a3b8' : '#fbbf24'} strokeWidth="1.3" fill="none" />
            </g>}
          </svg>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className={`${buttonClass} !border-cyan-300/40 !bg-cyan-300/10 !text-cyan-100`} disabled={!duration || busy || Boolean(roundSession?.waiting)} onClick={() => { if (elapsedRef.current >= duration) { elapsedRef.current = 0; setElapsed(0); } setPlaying((current) => !current); }}>{playing ? <Pause size={15} /> : <Play size={15} />}{playing ? 'Pausar prévia' : 'Reproduzir trajeto'}</button>
          <button className={buttonClass} disabled={!plan.points.length} onClick={resetPlayback}><RotateCcw size={15} />Reiniciar prévia</button>
          <label className="text-xs text-slate-300">Velocidade da prévia<select aria-label="Velocidade da prévia" value={speed} onChange={(event) => setSpeed(Number(event.target.value))} className="ml-2 rounded-lg border border-white/15 bg-slate-950 p-2"><option value="0.5">0,5×</option><option value="1">1×</option><option value="2">2×</option></select></label>
        </div>
        <label className="block text-xs text-slate-400">Posição da prévia<input aria-label="Posição da prévia" type="range" min="0" max={duration || 1} step="1" value={elapsed} disabled={!duration || inRound} onChange={(event) => { setPlaying(false); elapsedRef.current = Number(event.target.value); setElapsed(elapsedRef.current); }} className="mt-2 block w-full accent-cyan-300" /></label>
        {collisions.length > 0 && <p role="alert" className="rounded-xl border border-rose-300/30 bg-rose-300/10 p-3 text-xs text-rose-100">Contato na posição atual: {collisions.map((item) => `${item.name} (${item.part === 'gripper' ? 'garra' : 'corpo'})`).join(', ')}.</p>}
        <button className={buttonClass} disabled={playing || plan.points.length < 2} onClick={() => setAnalysis(analyzeTrajectory(plan))}>Analisar percurso completo</button>
        {analysis && <div role="status" className="rounded-xl border border-amber-300/20 p-3 text-xs text-amber-100"><p>{analysis.contacts.length ? `Contatos encontrados: ${analysis.contacts.map((item) => `${item.name} (${item.part === 'gripper' ? 'garra' : 'corpo'})`).join(', ')}.` : 'Nenhum contato encontrado nas áreas marcadas.'}</p>{analysis.outside && <p className="mt-1">O robô ou a garra ultrapassa a borda durante o percurso.</p>}<p className="mt-1 text-slate-400">Verificação por amostras da projeção em 2D. Confirme na mesa real.</p></div>}
        <p role="status" className="min-h-5 text-xs text-cyan-100">{playing || elapsed > 0 ? commands[pose.commandIndex]?.label || 'Pronto para começar' : plan.points.length ? 'Início no ponto 1. Use Reproduzir trajeto para visualizar.' : 'Adicione o ponto inicial para começar.'}</p>
        {outside && <p className="flex items-start gap-2 rounded-xl border border-amber-300/25 bg-amber-300/5 p-3 text-xs text-amber-100"><AlertTriangle size={15} className="shrink-0" />Nesta posição, parte do robô ultrapassa o limite do campo. Ajuste o caminho ou as medidas.</p>}
        <div className="grid grid-cols-3 gap-2 text-center text-xs"><div className="rounded-xl bg-white/5 p-3"><strong className="block text-lg text-white">{plan.points.length}</strong>pontos</div><div className="rounded-xl bg-white/5 p-3"><strong className="block text-lg text-white">{trajectoryNumber(distance)} cm</strong>percurso</div><div className="rounded-xl bg-white/5 p-3"><strong className="block text-lg text-white">{commands.filter((command) => command.type === 'gripper').length}</strong>ações da garra</div></div>
      </div>

      <aside className="min-w-0 space-y-4">
        <TrajectoryObstacles plan={plan} selectedId={selectedObstacle} onSelect={setSelectedObstacle} disabled={!editing} onChange={(obstacles) => updatePlan({ ...plan, obstacles })} />
        <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
          <div className="flex items-center justify-between gap-2"><h4 className="text-sm font-bold">Pontos do caminho</h4><button className={buttonClass} disabled={!editing} onClick={() => addPoint({ x: settings.width / 2, y: settings.height / 2 })} aria-label="Adicionar ponto pelo formulário"><Plus size={15} /></button></div>
          <div className="mt-3 flex max-h-36 flex-wrap gap-2 overflow-y-auto">{plan.points.map((entry, index) => <button key={entry.id} className={`rounded-lg border px-2.5 py-2 text-xs font-bold ${selectedPoint === entry.id ? 'border-cyan-200 bg-cyan-200/15 text-cyan-100' : 'border-white/15 text-slate-300'}`} onClick={() => setSelectedPoint(entry.id)}>P{index + 1}{entry.action !== 'none' ? ' · garra' : ''}</button>)}{!plan.points.length && <p className="text-xs leading-relaxed text-slate-400">Clique no campo ou use + e informe X e Y.</p>}</div>
          {point && <fieldset disabled={!editing} className="mt-4 space-y-3 border-t border-white/10 pt-3">
            <legend className="pt-3 text-xs font-bold text-cyan-200">Ponto {pointIndex + 1}{pointIndex === 0 ? ' · partida' : ''}</legend>
            {pointIndex > 0 && <div className="space-y-3"><label className="block text-xs">Direção até este ponto<select aria-label="Direção do trecho" value={point.direction} onChange={(event) => updatePoint({ direction: event.target.value })} className={inputClass}><option value="forward">Para frente</option><option value="reverse">Marcha à ré</option></select></label><label className="block text-xs">Formato do trecho<select aria-label="Formato do trecho" value={point.path} onChange={(event) => { const previous = plan.points[pointIndex - 1]; updatePoint({ path: event.target.value, controlX: Math.max(0, Math.min(settings.width, (previous.x + point.x) / 2 - (point.y - previous.y) / 4)), controlY: Math.max(0, Math.min(settings.height, (previous.y + point.y) / 2 + (point.x - previous.x) / 4)) }); }} className={inputClass}><option value="line">Reta</option><option value="curve">Curva suave</option></select></label>{point.path === 'curve' && <div className="grid grid-cols-2 gap-2">{[['controlX', 'X do controle da curva', settings.width], ['controlY', 'Y do controle da curva', settings.height]].map(([key, label, max]) => <label key={key} className="text-xs">{label}<input type="number" min="0" max={max} step="0.1" value={point[key]} onChange={(event) => { const value = Number(event.target.value); if (Number.isFinite(value) && value >= 0 && value <= max) updatePoint({ [key]: value }); }} className={inputClass} /></label>)}</div>}</div>}
            <div className="grid grid-cols-2 gap-2">{[['x', settings.width], ['y', settings.height]].map(([axis, max]) => <label key={axis} className="text-xs text-slate-300">{axis.toUpperCase()} (cm)<input aria-label={`${axis.toUpperCase()} do ponto`} type="number" min="0" max={max} step="0.1" value={point[axis]} onChange={(event) => { const value = Number(event.target.value); if (Number.isFinite(value) && value >= 0 && value <= max) updatePoint({ [axis]: value }); }} className={inputClass} /></label>)}</div>
            <label className="block text-xs text-slate-300">Ação neste ponto<select aria-label="Ação neste ponto" value={point.action} onChange={(event) => updatePoint({ action: event.target.value })} className={inputClass}>{Object.entries(TRAJECTORY_ACTIONS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label className="block text-xs text-slate-300">Objetivo / missão<input maxLength={200} value={point.note} onChange={(event) => updatePoint({ note: event.target.value })} className={inputClass} placeholder="Ex.: coletar o modelo" /></label>
            <div className="flex flex-wrap gap-2"><button className={buttonClass} disabled={!editing || pointIndex === 0} aria-label="Antecipar ponto" onClick={() => reorderPoint(-1)}><ArrowUp size={15} /></button><button className={buttonClass} disabled={!editing || pointIndex === plan.points.length - 1} aria-label="Adiar ponto" onClick={() => reorderPoint(1)}><ArrowDown size={15} /></button><button className={buttonClass} onClick={() => { updatePlan({ ...plan, points: plan.points.filter((entry) => entry.id !== selectedPoint) }); setSelectedPoint(''); }}><Trash2 size={15} />Remover ponto</button></div>
          </fieldset>}
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-3"><h4 className="text-sm font-bold">Sequência para programar</h4><p className="mt-1 text-xs leading-relaxed text-slate-400">Giros, avanços, marcha à ré e curvas suaves. Use a sequência como referência para montar seus blocos.</p><ol className="mt-3 max-h-80 space-y-2 overflow-y-auto pr-1">{commands.map((command, index) => <li key={index} className={`rounded-xl border p-2.5 text-xs ${pose.commandIndex === index && (playing || elapsed > 0) ? 'border-cyan-300/60 bg-cyan-300/10 text-cyan-100' : 'border-white/10 text-slate-300'}`}><span className="mr-2 font-mono text-slate-500">{index + 1}.</span>{command.label}{plan.points[command.point]?.note && <p className="mt-1 text-slate-400">{plan.points[command.point].note}</p>}</li>)}{!commands.length && <li className="text-xs text-slate-400">Marque o percurso para gerar a sequência.</li>}</ol></div>
      </aside>
    </div>
    <label className="block text-xs text-slate-300">Observações do plano<textarea aria-label="Observações do plano" maxLength={2000} rows="2" value={plan.notes} disabled={!editing} onChange={(event) => updatePlan({ ...plan, notes: event.target.value })} placeholder="O que precisa ser conferido na mesa real?" className={inputClass} /></label>
    <div className="flex flex-wrap items-center gap-2">
      {!readonly && <button className={`${buttonClass} !bg-cyan-300 !text-slate-950`} disabled={!editing || !draft.dirty} onClick={save}><Save size={15} />{busy ? 'Salvando…' : 'Salvar para a equipe'}</button>}
      <button className={buttonClass} disabled={busy || inRound} onClick={() => tryExport(false)}><Download size={15} />Exportar trajeto</button><button className={buttonClass} disabled={busy || inRound} onClick={() => tryExport(true)}><Download size={15} />Baixar sequência</button>
      {!readonly && <><button className={buttonClass} disabled={busy || inRound} onClick={() => fileInput.current.click()}><Upload size={15} />Importar trajeto</button><input ref={fileInput} type="file" accept=".json,application/json" hidden onChange={async (event) => { const file = event.target.files?.[0]; event.target.value = ''; if (!file) return; try { if (file.size > 100000) throw new Error('Use um arquivo de até 100 KB.'); const next = importTrajectory(await file.text()); replaceDraft({ ...freshDraft(), dirty: true, plan: next }); } catch (issue) { setError(issue.message); } }} /></>}
      <p className="text-xs text-slate-400">{draft.dirty ? 'Alterações no rascunho deste navegador.' : draft.revision ? `Versão ${draft.revision} salva.` : 'Novo plano.'}</p>
    </div>
    {storageError && <p role="alert" className="text-sm text-amber-200">O navegador não conseguiu guardar o rascunho. Salve para a equipe ou exporte antes de sair.</p>}
    {error && <p role="alert" className="text-sm text-rose-200">{error}</p>}
    {notice && <p role="status" className="text-sm text-emerald-200">{notice}</p>}
  </section>;
}
