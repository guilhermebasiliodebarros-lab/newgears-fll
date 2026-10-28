import { useCallback, useEffect, useId, useState } from 'react';
import { Armchair, Hammer, LampDesk, Lightbulb, Paintbrush, Play, Sparkles, Trophy, Wrench } from 'lucide-react';
import GearMascot from './GearMascot';
import GearCelebration from './GearCelebration';
import { gearItem, resolveGearEquipment } from '../utils/gearShop';
import './GiroStudio.css';

export function GearWorkshopScene({ equipment, level = 1, compact = false, still = false, action = '', animationKey, lightOn = true, onInteract }) {
  const uid = useId();
  const selected = resolveGearEquipment(equipment);
  const room = gearItem(selected.room).variant;
  const bench = gearItem(selected.bench).variant;
  const light = gearItem(selected.light).variant;
  const decor = gearItem(selected.decor).variant;
  const color = { base: '#67e8f9', neon: '#22d3ee', solar: '#fcd34d', cosmic: '#c4b5fd' }[light];
  const moods = { work: 'work', decorate: decor === 'planet' ? 'spin' : 'wave', explore: 'wave', stage: 'stage', celebrate: 'celebrate' };
  return <div className={`giro-room giro-room--${room} ${compact ? 'giro-room--compact' : ''} ${lightOn ? '' : 'giro-room--dim'} ${action ? `giro-room--${action}` : ''}`} style={{ '--room-light': color }}>
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
      <g opacity={lightOn ? '1' : '.25'}><path d="M277 35H523L508 58H292Z" fill={color} fillOpacity=".65" /><path d="M290 61H510" stroke={color} strokeWidth="3" /><path d="M320 65 200 322H600L480 65Z" fill={color} fillOpacity=".035" /></g>
      <g className="giro-room__bench"><path d="M76 279 111 251H282L301 279 278 296H95Z" fill={`url(#${uid}-bench)`} stroke="#b5c9e044" strokeWidth="2" /><path d="M95 296H278V359H95Z" fill="#162436" stroke="#9aaeca44" /><path d="M108 358V380M268 358V380" stroke="#607691" strokeWidth="9" /><path d="M114 315H257m-143 23h143" stroke={bench === 'podium' ? '#fcd34d' : color} strokeOpacity=".35" strokeWidth="3" />{bench === 'holo' ? <g className="giro-room__hologram" stroke="#67e8f9" fill="#22d3ee11"><path d="m183 195 39 23v42l-39 22-39-22v-42Z" /><path d="m144 218 39 21 39-21m-39 21v43" /></g> : bench === 'engineer' ? <g stroke="#fb923c" strokeWidth="5" strokeLinecap="round"><path d="m122 274 30-12m74 12 28-10" /><path d="M163 267h35" stroke="#67e8f9" /></g> : bench === 'podium' ? <text x="183" y="339" textAnchor="middle" fill="#fde68a" fontSize="26" fontWeight="900">1</text> : null}</g>
      <g className={`giro-room__decoration ${action === 'decorate' ? 'giro-room__decoration--active' : ''}`}>
        <path d="M566 280H706V293H566Z" fill="#475b75" /><path d="M579 293V351m114-58v58" stroke="#24364c" strokeWidth="8" />
        {decor === 'tools' ? <g stroke="#fb923c" strokeWidth="8" strokeLinecap="round"><rect x="578" y="160" width="116" height="110" rx="7" fill="#18283d" stroke="#45566e" strokeWidth="2" /><path d="m604 191 15 16-21 28m17-47 11 9m31-11v49m-11-42h22" /></g>
          : decor === 'planet' ? <g className="giro-room__planet"><circle cx="637" cy="233" r="33" fill="#8b7bd9" /><ellipse cx="637" cy="233" rx="51" ry="13" transform="rotate(-24 637 233)" fill="none" stroke="#c4b5fd" strokeWidth="6" /><path d="M637 266v13" stroke="#94a3b8" strokeWidth="4" /></g>
            : decor === 'trophy' ? <g fill="#fcd34d" stroke="#fef3c7" strokeWidth="2"><path d="M610 189h54l-5 40a23 23 0 0 1-44 0Z" /><path d="M611 194h-15v13q0 22 23 22m43-35h15v13q0 22-23 22" fill="none" strokeWidth="6" /><path d="M634 246h7v21h-7m-19 1h45v11h-45Z" /></g>
              : <g><rect x="579" y="208" width="115" height="63" rx="8" fill="#132137" stroke="#67e8f966" /><text x="637" y="235" textAnchor="middle" fill="#a5f3fc" fontSize="13" fontWeight="900">NEW GEARS</text><text x="637" y="255" textAnchor="middle" fill="#7187a3" fontSize="10">NOSSA OFICINA</text></g>}
      </g>
      <ellipse cx="400" cy="383" rx="80" ry="13" fill="#020617" opacity=".45" />
    </svg>
    <div className="giro-room__resident"><GearMascot key={animationKey} equipment={selected} level={level} mood={moods[action] || 'idle'} decorative still={still} /></div>
    {!compact && <span className="giro-room__name">{gearItem(selected.room).name}</span>}
    {onInteract && !compact && <div className="giro-room__hotspots"><button type="button" className="giro-room__spot giro-room__spot--bench" aria-label="Trabalhar na bancada" onClick={() => onInteract('work')}><Hammer size={18} /></button><button type="button" className="giro-room__spot giro-room__spot--light" aria-label={lightOn ? 'Apagar luz da oficina' : 'Acender luz da oficina'} onClick={() => onInteract('light')}><Lightbulb size={18} /></button><button type="button" className="giro-room__spot giro-room__spot--decor" aria-label="Interagir com a decoração" onClick={() => onInteract('decorate')}><Sparkles size={18} /></button></div>}
  </div>;
}

export default function GearWorkshop({ account, student, level, onCustomize }) {
  const [lightOn, setLightOn] = useState(true);
  const [interaction, setInteraction] = useState(null);
  const [celebration, setCelebration] = useState(null);
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
    <div className="giro-studio-heading"><div><p className="giro-studio-eyebrow"><Wrench size={14} />Minha oficina</p><h2>O cantinho {student?.name ? `de ${student.name}` : 'do Giro'}</h2><p>Cada escolha transforma a oficina em um lugar com a sua cara.</p></div><button type="button" onClick={() => onCustomize('room')} className="giro-studio-button"><Paintbrush size={16} />Personalizar oficina</button></div>
    <div className="giro-workshop__stage"><GearWorkshopScene equipment={account.equipped} level={level} action={interaction?.action || ''} animationKey={interaction?.id} lightOn={lightOn} onInteract={interact} />{celebration && <GearCelebration key={celebration} equipment={account.equipped} compact onComplete={finishCelebration} />}</div>
    <div className="giro-workshop__controls"><button type="button" onClick={() => interact('work')}><Hammer size={16} />Trabalhar na bancada</button><button type="button" aria-pressed={lightOn} onClick={() => interact('light')}><LampDesk size={16} />{lightOn ? 'Apagar luz' : 'Acender luz'}</button><button type="button" onClick={() => interact('decorate')}><Sparkles size={16} />Explorar decoração</button><button type="button" onClick={celebrate}><Play size={16} />Testar comemoração</button></div>
    <p role="status" className="giro-workshop__status">{status}</p>
    <div className="giro-workshop__equipment">{[{ category: 'room', label: 'Cenário', icon: <Armchair size={17} /> }, { category: 'bench', label: 'Bancada', icon: <Hammer size={17} /> }, { category: 'light', label: 'Luz', icon: <Lightbulb size={17} /> }, { category: 'decor', label: 'Decoração', icon: <Trophy size={17} /> }].map(({ category, label, icon }) => <button type="button" key={category} onClick={() => onCustomize(category)}>{icon}<span><small>{label}</small><strong>{gearItem(account.equipped[category]).name}</strong></span><Paintbrush size={13} /></button>)}</div>
  </section>;
}
