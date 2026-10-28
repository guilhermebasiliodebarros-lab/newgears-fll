import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Armchair, Hammer, LampDesk, Lightbulb, Move, Paintbrush, Play, RotateCcw, Save, Smile, Sparkles, Trophy, Wrench, X } from 'lucide-react';
import GearMascot from './GearMascot';
import GearCelebration from './GearCelebration';
import GearWorkshopCheers from './GearWorkshopCheers';
import { gearItem, resolveGearEquipment } from '../utils/gearShop';
import { clampWorkshopPoint, GIRO_EXPRESSIONS, resolveGearWorkshop, WORKSHOP_OBJECTS } from '../utils/gearWorkshop';
import './GiroStudio.css';

export function GearWorkshopScene({ equipment, level = 1, compact = false, still = false, action = '', animationKey, lightOn = true, onInteract, layout, expression = 'auto', editing = false, onLayoutChange }) {
  const uid = useId();
  const sceneRef = useRef(null);
  const dragRef = useRef(null);
  useEffect(() => () => dragRef.current?.cleanup(), []);
  useEffect(() => { if (!editing) dragRef.current?.cleanup(); }, [editing]);
  const positions = resolveGearWorkshop({ layout }).layout;
  const moveObject = (id, point) => onLayoutChange?.({ ...positions, [id]: clampWorkshopPoint(id, point) });
  const startDrag = (event, id) => {
    if (!onLayoutChange || event.button !== 0 || dragRef.current) return;
    event.preventDefault();
    const element = event.currentTarget;
    const pointerId = event.pointerId;
    const start = { x: event.clientX, y: event.clientY, point: positions[id], bounds: sceneRef.current.getBoundingClientRect() };
    const move = (pointer) => {
      if (pointer.pointerId !== pointerId) return;
      onLayoutChange({ ...positions, [id]: clampWorkshopPoint(id, { x: start.point.x + (pointer.clientX - start.x) / start.bounds.width * 800, y: start.point.y + (pointer.clientY - start.y) / start.bounds.height * 460 }) });
    };
    const cleanup = () => {
      window.removeEventListener('pointermove', move, true); window.removeEventListener('pointerup', finish, true); window.removeEventListener('pointercancel', cancel, true); window.removeEventListener('blur', abandon);
      if (element.hasPointerCapture(pointerId)) element.releasePointerCapture(pointerId);
      dragRef.current = null;
    };
    const finish = (pointer) => { if (pointer.pointerId === pointerId) cleanup(); };
    const abandon = () => { onLayoutChange({ ...positions }); cleanup(); };
    const cancel = (pointer) => { if (pointer.pointerId === pointerId) abandon(); };
    dragRef.current = { cleanup };
    window.addEventListener('pointermove', move, true); window.addEventListener('pointerup', finish, true); window.addEventListener('pointercancel', cancel, true); window.addEventListener('blur', abandon);
    element.setPointerCapture(pointerId);
    element.focus({ preventScroll: true });
  };
  const nudge = (event, id) => {
    const step = event.shiftKey ? 20 : 5;
    const delta = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[event.key];
    if (!delta) return;
    event.preventDefault();
    moveObject(id, { x: positions[id].x + delta[0], y: positions[id].y + delta[1] });
  };
  const selected = resolveGearEquipment(equipment);
  const room = gearItem(selected.room).variant;
  const bench = gearItem(selected.bench).variant;
  const light = gearItem(selected.light).variant;
  const decor = gearItem(selected.decor).variant;
  const color = { base: '#67e8f9', neon: '#22d3ee', solar: '#fcd34d', cosmic: '#c4b5fd' }[light];
  const moods = { work: 'work', decorate: decor === 'planet' ? 'discover' : 'wave', explore: 'wave', stage: 'stage', celebrate: 'celebrate' };
  const resident = editing ? positions.giro : action === 'work' ? clampWorkshopPoint('giro', { x: positions.bench.x + 95, y: positions.bench.y + 5 }) : action === 'decorate' ? clampWorkshopPoint('giro', { x: positions.decor.x - 85, y: positions.decor.y + 65 }) : positions.giro;
  const offset = (id) => `translate(${positions[id].x - WORKSHOP_OBJECTS[id].x} ${positions[id].y - WORKSHOP_OBJECTS[id].y})`;
  return <div ref={sceneRef} className={`giro-room giro-room--${room} ${compact ? 'giro-room--compact' : ''} ${lightOn ? '' : 'giro-room--dim'} ${editing ? 'giro-room--editing' : ''} ${action ? `giro-room--${action}` : ''}`} style={{ '--room-light': color }}>
    <svg viewBox="0 0 800 460" className="giro-room__architecture" role="img" aria-label={`${gearItem(selected.room).name}, ${gearItem(selected.bench).name} e ${gearItem(selected.decor).name}`}>
      <defs>
        <linearGradient id={`${uid}-wall`} x2="0" y2="1"><stop stopColor={room === 'arena' ? '#34261b' : room === 'neon' ? '#211938' : '#17263d'} /><stop offset="1" stopColor="#0b1325" /></linearGradient>
        <linearGradient id={`${uid}-floor`} x2="0" y2="1"><stop stopColor="#293b55" /><stop offset="1" stopColor="#0b1221" /></linearGradient>
        <radialGradient id={`${uid}-light`}><stop stopColor={color} stopOpacity={lightOn ? '.26' : '.02'} /><stop offset="1" stopColor={color} stopOpacity="0" /></radialGradient>
        <linearGradient id={`${uid}-bench`} x2="0" y2="1"><stop stopColor={bench === 'holo' ? '#22d3ee' : bench === 'podium' ? '#fcd34d' : '#7289a6'} stopOpacity=".7" /><stop offset="1" stopColor="#18273a" /></linearGradient>
      </defs>
      <path d="M0 0H800V460H0Z" fill={`url(#${uid}-wall)`} />
      <path d="M0 0 58 40V320L0 460m800-460-58 40v280l58 140" fill="#050c1d" fillOpacity=".5" />
      <path d="M58 40H742V320H58Z" fill="none" stroke="#ffffff10" />
      <path d="M0 460 58 320H742L800 460Z" fill={`url(#${uid}-floor)`} />
      {[120, 240, 360, 480, 600, 720].map((x) => <path key={x} d={`M${x} 320 ${400 + (x - 400) * 1.8} 460`} stroke="#94a3b81a" />)}
      <path d="M40 355H760M25 401H775" stroke="#94a3b81a" />
      <ellipse cx="400" cy="270" rx="330" ry="210" fill={`url(#${uid}-light)`} />
      {room === 'orbit' ? <g><rect x="268" y="73" width="264" height="153" rx="40" fill="#020617" stroke="#6b7da4" strokeWidth="9" /><circle cx="436" cy="152" r="46" fill="#7c83df" /><path d="M394 142c29 7 47 28 74 11M413 184l40-52" stroke="#c4b5fd" strokeWidth="12" opacity=".5" />{[0, 1, 2, 3, 4, 5, 6].map((i) => <circle key={i} cx={290 + (i * 47) % 210} cy={95 + (i * 37) % 100} r={i % 2 + 1} fill="#e0e7ff" />)}</g>
        : room === 'arena' ? <g><path d="M235 91H565V244H235Z" fill="#161b2d" stroke="#fcd34d44" strokeWidth="3" /><path d="M259 143H541M259 168H541M259 193H541M259 218H541" stroke="#fcd34d20" strokeWidth="9" /><path d="M275 88V46l42 18-42 15m250 9V46l-42 18 42 15" stroke="#fcd34d" fill="#fcd34d66" strokeWidth="3" /><text x="400" y="129" textAnchor="middle" fill="#fde68a" fontSize="18" fontWeight="800">NEW GEARS</text></g>
          : room === 'neon' ? <g fill="none" strokeWidth="3"><path d="M185 93H300L324 117H476L500 93H615M188 260H264L288 236H512L536 260H612" stroke="#22d3ee66" /><path d="M400 76 455 108V173L400 206 345 173V108Z" stroke="#d946ef88" /><circle cx="400" cy="141" r="27" stroke="#67e8f9" /><path d="M400 126v30m-15-15h30" stroke="#a5b4fc" /></g>
            : <g><rect x="270" y="93" width="260" height="134" rx="8" fill="#182738" stroke="#ffffff1c" /><path d="M285 112H510M285 135H480M285 158H504M285 181H463" stroke="#67e8f922" strokeWidth="2" /><text x="400" y="207" textAnchor="middle" fill="#a5c6e9" fontSize="15" letterSpacing="3">IDEIAS EM MOVIMENTO</text></g>}
      <g opacity={lightOn ? '1' : '.25'} transform={offset('light')}><path d="M277 35H523L508 58H292Z" fill={color} fillOpacity=".65" /><path d="M290 61H510" stroke={color} strokeWidth="3" /><path d="M320 65 200 322H600L480 65Z" fill={color} fillOpacity=".035" /></g>
      <g className="giro-room__bench" transform={offset('bench')}><path d="M76 279 111 251H282L301 279 278 296H95Z" fill={`url(#${uid}-bench)`} stroke="#b5c9e044" strokeWidth="2" /><path d="M95 296H278V359H95Z" fill="#162436" stroke="#9aaeca44" /><path d="M108 358V380M268 358V380" stroke="#607691" strokeWidth="9" /><path d="M114 315H257m-143 23h143" stroke={bench === 'podium' ? '#fcd34d' : color} strokeOpacity=".35" strokeWidth="3" />{bench === 'holo' ? <g className="giro-room__hologram" stroke="#67e8f9" fill="#22d3ee11"><path d="m183 195 39 23v42l-39 22-39-22v-42Z" /><path d="m144 218 39 21 39-21m-39 21v43" /></g> : bench === 'engineer' ? <g stroke="#fb923c" strokeWidth="5" strokeLinecap="round"><path d="m122 274 30-12m74 12 28-10" /><path d="M163 267h35" stroke="#67e8f9" /></g> : bench === 'podium' ? <text x="183" y="339" textAnchor="middle" fill="#fde68a" fontSize="26" fontWeight="900">1</text> : null}</g>
      <g className={`giro-room__decoration ${action === 'decorate' ? 'giro-room__decoration--active' : ''}`} transform={offset('decor')}>
        <path d="M566 280H706V293H566Z" fill="#475b75" /><path d="M579 293V351m114-58v58" stroke="#24364c" strokeWidth="8" />
        {decor === 'tools' ? <g stroke="#fb923c" strokeWidth="8" strokeLinecap="round"><rect x="578" y="160" width="116" height="110" rx="7" fill="#18283d" stroke="#45566e" strokeWidth="2" /><path d="m604 191 15 16-21 28m17-47 11 9m31-11v49m-11-42h22" /></g>
          : decor === 'planet' ? <g className="giro-room__planet"><circle cx="637" cy="233" r="33" fill="#8b7bd9" /><ellipse cx="637" cy="233" rx="51" ry="13" transform="rotate(-24 637 233)" fill="none" stroke="#c4b5fd" strokeWidth="6" /><path d="M637 266v13" stroke="#94a3b8" strokeWidth="4" /></g>
            : decor === 'trophy' ? <g fill="#fcd34d" stroke="#fef3c7" strokeWidth="2"><path d="M610 189h54l-5 40a23 23 0 0 1-44 0Z" /><path d="M611 194h-15v13q0 22 23 22m43-35h15v13q0 22-23 22" fill="none" strokeWidth="6" /><path d="M634 246h7v21h-7m-19 1h45v11h-45Z" /></g>
              : <g><rect x="579" y="208" width="115" height="63" rx="8" fill="#132137" stroke="#67e8f966" /><text x="637" y="235" textAnchor="middle" fill="#a5f3fc" fontSize="13" fontWeight="900">NEW GEARS</text><text x="637" y="255" textAnchor="middle" fill="#7187a3" fontSize="10">NOSSA OFICINA</text></g>}
      </g>
      <ellipse cx={resident.x} cy={383 + resident.y - WORKSHOP_OBJECTS.giro.y} rx="80" ry="13" fill="#020617" opacity=".45" />
    </svg>
    <div className="giro-room__resident" style={{ left: `${resident.x / 8 - 14.5}%`, top: `${resident.y / 4.6 - 35.7}%`, bottom: 'auto' }}><GearMascot key={animationKey} equipment={selected} level={level} mood={moods[action] || 'idle'} expression={expression} decorative still={still || editing} /></div>
    {!compact && <span className="giro-room__name">{gearItem(selected.room).name}</span>}
    {onInteract && !compact && !editing && <div className="giro-room__hotspots"><button type="button" className="giro-room__spot" style={{ left: `${positions.bench.x / 8 - 2.25}%`, top: `${(positions.bench.y - 25) / 4.6}%` }} aria-label="Trabalhar na bancada" onClick={() => onInteract('work')}><Hammer size={18} /></button><button type="button" className="giro-room__spot" style={{ left: `${positions.light.x / 8 - 2.25}%`, top: `${(positions.light.y - 18) / 4.6}%` }} aria-label={lightOn ? 'Apagar luz da oficina' : 'Acender luz da oficina'} onClick={() => onInteract('light')}><Lightbulb size={18} /></button><button type="button" className="giro-room__spot" style={{ left: `${positions.decor.x / 8 - 2.25}%`, top: `${(positions.decor.y - 18) / 4.6}%` }} aria-label="Interagir com a decoração" onClick={() => onInteract('decorate')}><Sparkles size={18} /></button></div>}
    {editing && <><p id={`${uid}-help`} className="sr-only">Arraste ou use as setas do teclado para mover. Segure Shift para mover mais rápido.</p>{Object.entries(WORKSHOP_OBJECTS).map(([id, object]) => <button key={id} type="button" className="giro-room__drag-handle" style={{ left: `${positions[id].x / 8}%`, top: `${positions[id].y / 4.6}%` }} aria-label={`Mover ${object.label}`} aria-describedby={`${uid}-help`} onPointerDown={(event) => startDrag(event, id)} onKeyDown={(event) => nudge(event, id)}><Move size={18} /><span>{object.label}</span></button>)}</>}
  </div>;
}

export default function GearWorkshop({ account, student, level, onCustomize, workshop, onSave, saving = false, loading = false, error = '', canSave = false }) {
  const [lightOn, setLightOn] = useState(true);
  const [interaction, setInteraction] = useState(null);
  const [celebration, setCelebration] = useState(null);
  const [editor, setEditor] = useState(null);
  const [savedNotice, setSavedNotice] = useState(false);
  const configuration = editor || resolveGearWorkshop(workshop);
  const startEditing = () => { setEditor(resolveGearWorkshop(workshop)); setSavedNotice(false); setInteraction(null); };
  const save = async () => { if (await onSave?.(editor)) { setEditor(null); setSavedNotice(true); } };
  const finishCelebration = useCallback(() => setCelebration(null), []);
  useEffect(() => {
    if (!interaction) return;
    const timer = window.setTimeout(() => setInteraction(null), 3600);
    return () => window.clearTimeout(timer);
  }, [interaction]);
  const interact = (action) => {
    if (action === 'light') { setLightOn((value) => !value); return; }
    setInteraction({ action, id: crypto.randomUUID() });
  };
  const celebrate = () => { setCelebration(crypto.randomUUID()); interact(gearItem(account.equipped.animation).variant === 'stage' ? 'stage' : 'celebrate'); };
  const status = interaction?.action === 'work' ? 'O Giro está preparando a próxima invenção na bancada.' : interaction?.action === 'decorate' ? 'O Giro foi explorar sua decoração favorita!' : 'Seu cantinho, do seu jeito. Toque nos objetos para brincar com o Giro.';
  return <section className="giro-workshop">
    <div className="giro-studio-heading"><div><p className="giro-studio-eyebrow"><Wrench size={14} />Minha oficina</p><h2>O cantinho {student?.name ? `de ${student.name}` : 'do Giro'}</h2><p>Cada escolha transforma a oficina em um lugar com a sua cara.</p></div><div className="flex flex-wrap gap-2">{!editor && <button type="button" disabled={loading} onClick={startEditing} className="giro-studio-button"><Move size={16} />Organizar oficina</button>}<button type="button" disabled={Boolean(editor)} onClick={() => onCustomize('room')} className="giro-studio-button"><Paintbrush size={16} />Comprar itens</button></div></div>
    {editor && <div className="giro-workshop-editor"><div className="giro-workshop-editor__toolbar"><div><strong>Organize do seu jeito</strong><p>Arraste os marcadores ou use as setas do teclado. As mudanças são aplicadas ao salvar.</p></div><div className="flex flex-wrap gap-2"><button type="button" disabled={saving} className="giro-studio-button" onClick={() => setEditor((value) => ({ ...value, layout: resolveGearWorkshop().layout }))}><RotateCcw size={14} />Posições iniciais</button><button type="button" disabled={saving} className="giro-studio-button" onClick={() => setEditor(null)}><X size={14} />Cancelar</button><button type="button" disabled={saving || loading || !canSave} className="giro-studio-button" onClick={save}><Save size={14} />{saving ? 'Salvando…' : 'Salvar oficina'}</button></div></div><div className="giro-expression-picker" aria-label="Expressão do Giro"><p><Smile size={15} />Expressão do Giro</p>{GIRO_EXPRESSIONS.map((entry) => <button type="button" key={entry.id} aria-label={entry.label} disabled={saving} aria-pressed={editor.expression === entry.id} title={entry.description} onClick={() => setEditor((value) => ({ ...value, expression: entry.id }))}><GearMascot expression={entry.id} still decorative /><span>{entry.label}</span></button>)}</div>{!canSave && <p className="giro-workshop__status">Você pode experimentar aqui. Entre no seu perfil de aluno para salvar sua oficina.</p>}</div>}
    {error && <p role="alert" className="giro-workshop-error">{error}</p>}
    {savedNotice && <p role="status" className="giro-workshop-success">Oficina e expressão salvas! Seus colegas já podem ver a personalização.</p>}
    <div className="giro-workshop__stage"><GearWorkshopScene equipment={account.equipped} level={level} action={editor ? '' : interaction?.action || ''} animationKey={interaction?.id} lightOn={lightOn} onInteract={interact} layout={configuration.layout} expression={configuration.expression} editing={Boolean(editor)} onLayoutChange={saving ? undefined : (layout) => setEditor((value) => ({ ...value, layout }))} />{celebration && <GearCelebration key={celebration} equipment={account.equipped} compact onComplete={finishCelebration} />}</div>
    {editor ? <div className="giro-workshop-editor-actions"><button type="button" disabled={saving} className="giro-studio-button" onClick={() => setEditor(null)}><X size={14} />Cancelar</button><button type="button" disabled={saving || loading || !canSave} className="giro-studio-button" onClick={save}><Save size={14} />{saving ? 'Salvando…' : 'Salvar oficina'}</button></div> : <div className="giro-workshop__controls"><button type="button" onClick={() => interact('work')}><Hammer size={16} />Trabalhar na bancada</button><button type="button" aria-pressed={lightOn} onClick={() => interact('light')}><LampDesk size={16} />{lightOn ? 'Apagar luz' : 'Acender luz'}</button><button type="button" onClick={() => interact('decorate')}><Sparkles size={16} />Explorar decoração</button><button type="button" onClick={celebrate}><Play size={16} />Testar comemoração</button></div>}
    <p role="status" className="giro-workshop__status">{editor ? 'Posicione os objetos e escolha a expressão do seu Giro.' : status}</p>
    <GearWorkshopCheers />
    <div className="giro-workshop__equipment">{[{ category: 'room', label: 'Cenário', icon: <Armchair size={17} /> }, { category: 'bench', label: 'Bancada', icon: <Hammer size={17} /> }, { category: 'light', label: 'Luz', icon: <Lightbulb size={17} /> }, { category: 'decor', label: 'Decoração', icon: <Trophy size={17} /> }].map(({ category, label, icon }) => <button type="button" key={category} onClick={() => onCustomize(category)}>{icon}<span><small>{label}</small><strong>{gearItem(account.equipped[category]).name}</strong></span><Paintbrush size={13} /></button>)}</div>
  </section>;
}
