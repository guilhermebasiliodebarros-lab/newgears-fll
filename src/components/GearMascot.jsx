import { useEffect, useId, useRef, useState } from 'react';
import useGiroMotion from '../hooks/useGiroMotion';
import './GiroLife.css';
import { equippedGearAccessories, gearItem, resolveGearEquipment } from '../utils/gearShop';
import { giroExpression } from '../utils/gearWorkshop';

const TEETH = Array.from({ length: 96 }, (_, index) => {
  const angle = index / 96 * Math.PI * 2 - Math.PI / 2;
  const radius = [48, 48, 57, 57, 57, 57, 48, 48][index % 8];
  return `${index ? 'L' : 'M'}${100 + Math.cos(angle) * radius},${108 + Math.sin(angle) * radius}`;
}).join(' ') + ' Z';

export default function GearMascot({ equipment, level = 1, mood = 'idle', expression = 'auto', speaking = false, className = '', label = 'Giro, a engrenagem da New Gears', decorative = false, still = false, heldItem = '' }) {
  const uid = useId();
  const mascot = useRef(null);
  const paused = useGiroMotion(mascot, still);
  const [touch, setTouch] = useState(null);
  useEffect(() => {
    if (!touch) return;
    const timer = setTimeout(() => setTouch(null), 1800);
    return () => clearTimeout(timer);
  }, [touch]);
  const selected = resolveGearEquipment(equipment);
  const colors = gearItem(selected.skin).colors;
  const frame = gearItem(selected.frame).variant;
  const accessories = new Set(equippedGearAccessories(selected).map((id) => gearItem(id).variant));
  const activeTouch = touch && ['idle', 'wave', 'greet', 'help'].includes(mood);
  const activeMood = activeTouch ? touch.mood : mood;
  const face = activeTouch ? 'happy' : giroExpression(activeMood, expression);
  const tilt = (event) => {
    if (paused || event.pointerType === 'touch' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
    const y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
    event.currentTarget.style.setProperty('--gear-yaw', `${x * 16}deg`);
    event.currentTarget.style.setProperty('--gear-pitch', `${-y * 10}deg`);
    event.currentTarget.style.setProperty('--gear-gaze-x', `${x * 3.5}px`);
    event.currentTarget.style.setProperty('--gear-gaze-y', `${y * 2}px`);
    event.currentTarget.dataset.tracking = 'true';
  };
  const resetTilt = (event) => { for (const property of ['--gear-yaw', '--gear-pitch', '--gear-gaze-x', '--gear-gaze-y']) event.currentTarget.style.removeProperty(property); delete event.currentTarget.dataset.tracking; };
  const reactToTouch = () => { if (!paused && ['idle', 'wave', 'greet', 'help'].includes(mood) && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) setTouch((previous) => ({ id: (previous?.id || 0) + 1, mood: previous?.mood === 'hop' ? 'wave' : 'hop' })); };
  return <svg ref={mascot} viewBox="0 0 200 210" onPointerMove={tilt} onPointerLeave={resetTilt} onPointerDown={reactToTouch} role={decorative ? undefined : 'img'} aria-label={decorative ? undefined : label} aria-hidden={decorative || undefined} data-expression={face} data-paused={paused || undefined} className={`gear-mascot gear-mascot--level-${level} gear-mascot--${activeMood} gear-mascot--expression-${face} ${speaking ? 'gear-mascot--speaking' : ''} ${still ? 'gear-mascot--still' : ''} ${className}`}>
    <defs>
      <linearGradient id={`${uid}-body`} x1="15%" y1="0%" x2="90%" y2="100%"><stop stopColor="#e0faff" /><stop offset=".2" stopColor={colors[0]} /><stop offset=".55" stopColor={colors[1]} /><stop offset="1" stopColor={colors[2]} /></linearGradient>
      <linearGradient id={`${uid}-edge`} x1="0%" y1="0%" x2="100%" y2="100%"><stop stopColor={colors[1]} /><stop offset=".6" stopColor="#15223e" /><stop offset="1" stopColor={colors[2]} /></linearGradient>
      <radialGradient id={`${uid}-face`} cx="32%" cy="22%" r="85%"><stop stopColor="#30465f" /><stop offset=".55" stopColor="#15233b" /><stop offset="1" stopColor="#090f20" /></radialGradient>
      <linearGradient id={`${uid}-glass`} x1="0%" y1="0%" x2="60%" y2="100%"><stop stopColor="white" stopOpacity=".24" /><stop offset="1" stopColor="white" stopOpacity="0" /></linearGradient>
      <radialGradient id={`${uid}-eye`} cx="35%" cy="25%"><stop stopColor="white" /><stop offset="1" stopColor="#a5f3fc" /></radialGradient>
      <radialGradient id={`${uid}-halo`}><stop stopColor={colors[1]} stopOpacity="0.3" /><stop offset="1" stopColor={colors[1]} stopOpacity="0" /></radialGradient>
      <radialGradient id={`${uid}-metal`} cx="25%" cy="15%" r="90%"><stop stopColor="#f0fdff" /><stop offset=".2" stopColor={colors[0]} /><stop offset=".55" stopColor={colors[1]} /><stop offset=".85" stopColor={colors[2]} /><stop offset="1" stopColor="#0c1730" /></radialGradient>
      <linearGradient id={`${uid}-rim`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#f0fdff" /><stop offset=".3" stopColor="#849eae" /><stop offset=".5" stopColor="#14213b" /><stop offset=".8" stopColor="#c1d8e0" /><stop offset="1" stopColor="#344563" /></linearGradient>
      <radialGradient id={`${uid}-dome`} cx="30%" cy="12%" r="90%"><stop stopColor="#a5f3fc" stopOpacity=".2" /><stop offset=".5" stopColor="#0c162a" stopOpacity="0" /><stop offset="1" stopColor="#020617" stopOpacity=".5" /></radialGradient>
    </defs>
    <circle className="gear-mascot__halo" cx="100" cy="106" r="90" fill={`url(#${uid}-halo)`} />
    <ellipse className="gear-mascot__shadow" cx="100" cy="190" rx="42" ry="7" fill="#020617" opacity="0.45" />
    {level >= 2 ? <circle className="gear-mascot__energy" cx="100" cy="108" r="70" fill="none" stroke={colors[0]} strokeWidth="1.5" strokeDasharray="5 9" opacity="0.6" /> : null}
    {level >= 4 ? <g className="gear-mascot__orbit" stroke="#c4b5fd" fill="none"><ellipse cx="100" cy="108" rx="87" ry="73" strokeOpacity="0.6" /><circle cx="100" cy="35" r="4" fill="#c4b5fd" /></g> : null}
    {level >= 5 ? <g className="gear-mascot__master-stars" fill="#fde68a"><path d="m29 37 3 8 8 3-8 3-3 8-3-8-8-3 8-3Zm142 6 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" /></g> : null}
    {frame === 'orbit' ? <g className="gear-mascot__orbit" fill="none" stroke={colors[0]}><ellipse cx="100" cy="108" rx="84" ry="66" strokeOpacity="0.65" transform="rotate(-22 100 108)" /><circle cx="24" cy="126" r="5" fill={colors[0]} stroke="none" /></g> : null}
    {frame === 'hex' ? <path d="M100 20 177 64 177 152 100 196 23 152 23 64Z" fill="none" stroke={colors[0]} strokeWidth="2" strokeDasharray="22 7" opacity="0.65" /> : null}
    {frame === 'champion' ? <g fill="none" stroke="#fcd34d" strokeWidth="3"><circle cx="100" cy="108" r="78" strokeOpacity="0.7" /><path d="m28 85-10-6 4 17m150-11 10-6-4 17M45 168l-12 5 5-13m117 8 12 5-5-13" strokeLinecap="round" /></g> : null}
    {frame === 'stars' ? <g fill="#fde68a"><path d="m29 49 3 8 8 3-8 3-3 8-3-8-8-3 8-3Zm139 74 3 8 8 3-8 3-3 8-3-8-8-3 8-3Zm-15-83 2 6 6 2-6 2-2 6-2-6-6-2 6-2Z" /></g> : null}
    {frame === 'leaves' && <g data-gear-art="leaves" fill="#a3e635" stroke="#ecfccb" strokeWidth="1">{Array.from({ length: 12 }, (_, index) => <path key={index} transform={`rotate(${index * 30} 100 108)`} d="M96 31q-10-12 4-22 14 12 4 22l-4 6Z" />)}</g>}
    {frame === 'circuit' && <g data-gear-art="circuit" fill="none" stroke="#22d3ee" strokeWidth="2">{[0, 90, 180, 270].map((angle) => <g key={angle} transform={`rotate(${angle} 100 108)`}><path d="M41 56V31h34l9-10h20" /><circle cx="104" cy="21" r="4" fill="#a5f3fc" /><path d="M29 83V64h12" /><circle cx="29" cy="83" r="3" fill="#a5f3fc" /></g>)}</g>}
    <g className="gear-mascot__character">
      <g className="gear-mascot__leg gear-mascot__leg--left"><path d="M80 158v20" stroke="#45516e" strokeWidth="10" strokeLinecap="round" /><path d="M72 180h17" stroke={colors[0]} strokeWidth="11" strokeLinecap="round" /></g>
      <g className="gear-mascot__leg gear-mascot__leg--right"><path d="M120 158v20" stroke="#45516e" strokeWidth="10" strokeLinecap="round" /><path d="M111 180h17" stroke={colors[0]} strokeWidth="11" strokeLinecap="round" /></g>
      <g className="gear-mascot__arm"><path d="M49 113 30 113 23 95" fill="none" stroke={colors[1]} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" /><path d="m17 89 4-7m4 7 5-6" stroke={colors[0]} strokeWidth="6" strokeLinecap="round" /></g>
      <g className="gear-mascot__arm-right"><path d="m151 113 18 9 6-5" fill="none" stroke={colors[1]} strokeWidth="8" strokeLinecap="round" /><circle cx="178" cy="116" r="6" fill={colors[0]} />
        {heldItem === 'wrench' && <g className="gear-mascot__held-item" fill="none" stroke="#cbd5e1" strokeWidth="5" strokeLinecap="round"><path d="m176 120 11-27m-5-11-1 9 7 4 8-5 1-8" /><path d="m177 119-3 8" stroke="#fb923c" /></g>}
        {heldItem === 'trophy' && <g className="gear-mascot__held-item" fill="#fcd34d" stroke="#fef3c7" strokeWidth="1.5"><path d="M164 83h28l-3 19q-11 14-22 0Z" /><path d="M176 110v10m-9 2h20m-23-35h-6v8q0 8 10 9m24-17h6v8q0 8-10 9" fill="none" strokeWidth="3" /></g>}
        {heldItem === 'flag' && <g className="gear-mascot__held-item"><path d="M178 120V77" stroke="#cbd5e1" strokeWidth="3" /><path d="M180 78h18v22h-18Z" fill="#f8fafc" /><path d="M180 78h9v7h-9m9 0h9v8h-9m-9 0h9v7h-9" fill="#111827" /></g>}
      </g>
      <g className="gear-mascot__shell">
        <path d={TEETH} transform="translate(6 11)" fill="#070e20" stroke="#070e20" strokeWidth="3" strokeLinejoin="round" />
        <path className="gear-mascot__depth" d={TEETH} transform="translate(5 8)" fill={`url(#${uid}-edge)`} stroke="#111c32" strokeWidth="2.5" strokeLinejoin="round" />
        <path d={TEETH} transform="translate(2 4)" fill={`url(#${uid}-edge)`} stroke={colors[1]} strokeWidth="1" strokeLinejoin="round" />
        <path d={TEETH} fill={`url(#${uid}-metal)`} stroke={colors[0]} strokeWidth="1.8" strokeLinejoin="round" className="gear-mascot__teeth" />
        <circle cx="100" cy="108" r="47" fill="none" stroke={`url(#${uid}-rim)`} strokeWidth="3" />
        {[45, 135, 225, 315].map((angle) => <g key={angle} transform={`rotate(${angle} 100 108)`}><circle cx="100" cy="58" r="2.6" fill="#16253b" stroke="#e0faff" strokeOpacity=".6" strokeWidth=".7" /><path d="m99 57 2 2" stroke="#d9eaf3" strokeWidth=".8" /></g>)}
      </g>
      <g className="gear-mascot__head">
      <circle cx="100" cy="108" r="44" fill="#0b1225" stroke="#e0faff" strokeOpacity=".25" strokeWidth="1" />
      <circle cx="100" cy="108" r="40" fill={`url(#${uid}-face)`} stroke={colors[0]} strokeWidth="1.5" />
      <circle cx="100" cy="108" r="39" fill={`url(#${uid}-dome)`} />
      <ellipse cx="94" cy="89" rx="29" ry="19" fill={`url(#${uid}-glass)`} />
      <path d="M72 80a38 38 0 0 1 47-5" stroke="white" strokeOpacity="0.35" fill="none" strokeWidth="3" strokeLinecap="round" />
      <g className="gear-mascot__gaze"><g className="gear-mascot__eyes" fill={`url(#${uid}-eye)`}>{['happy', 'excited'].includes(face) ? <g fill="none" stroke="#e0faff" strokeWidth="4" strokeLinecap="round"><path d="m80 107 6-5 6 5m16 0 6-5 6 5" /></g> : ['focused', 'thinking'].includes(face) ? <><path d="M79 102h14v7H79Zm28 0h14v7h-14Z" /><path d={face === 'thinking' ? 'm78 97 15-2m14-1 15 3' : 'm78 96 15 2m14 0 15-2'} stroke={colors[0]} strokeWidth="3" strokeLinecap="round" /></> : <><ellipse cx="86" cy="105" rx={face === 'surprised' ? 7 : 5.5} ry={face === 'surprised' ? 10 : 7.5} /><ellipse cx="114" cy="105" rx={face === 'surprised' ? 7 : 5.5} ry={face === 'curious' ? 10 : face === 'surprised' ? 10 : 7.5} /><circle cx="84" cy="102" r="2" fill="white" /><circle cx="112" cy="102" r="2" fill="white" />{face === 'curious' && <path d="m107 90 14-3" stroke={colors[0]} strokeWidth="3" strokeLinecap="round" />}</>}</g></g>
      <ellipse cx="74" cy="117" rx="6" ry="3" fill={colors[2]} opacity="0.65" /><ellipse cx="126" cy="117" rx="6" ry="3" fill={colors[2]} opacity="0.65" />
      {level >= 4 ? <path d="m80 92 10-3m20 0 10 3" fill="none" stroke={colors[0]} strokeWidth="2.5" strokeLinecap="round" /> : null}
      <g className="gear-mascot__mouth">{speaking ? <><ellipse cx="100" cy="124" rx="9" ry="7" fill="#fda4af" stroke="#e0faff" strokeWidth="2" /><path d="M94 123h12" stroke="#fff" strokeWidth="3" strokeLinecap="round" /></> : face === 'surprised' ? <ellipse cx="100" cy="126" rx="5" ry="7" fill="#0b1225" stroke="#e0faff" strokeWidth="2.5" /> : <path d={['happy', 'excited'].includes(face) ? 'M87 119Q100 140 113 119Z' : face === 'thinking' ? 'M94 126q6-4 12 0' : face === 'focused' ? 'M94 124h12' : face === 'curious' ? 'M94 124Q104 132 111 119' : 'M90 121Q100 131 110 121'} fill={['happy', 'excited'].includes(face) ? '#fda4af' : 'none'} stroke="#e0faff" strokeWidth="3" strokeLinecap="round" />}</g>
      <circle cx="100" cy="149" r="4" fill={colors[0]} stroke="#101a32" strokeWidth="2" />
      {accessories.has('antenna') ? <g data-gear-accessory="antenna"><path d="M100 51V30m-8-5 8 5 8-5" fill="none" stroke={colors[0]} strokeWidth="4" strokeLinecap="round" /><circle cx="100" cy="23" r="7" fill={colors[2]} stroke={colors[0]} strokeWidth="2" /></g> : null}
      {accessories.has('crown') ? <g data-gear-accessory="crown"><path d="m76 56-6-25 20 12 10-22 10 22 20-12-6 25Z" fill="#fbbf24" stroke="#fef3c7" strokeWidth="2" /></g> : null}
      {accessories.has('visor') ? <g data-gear-accessory="visor"><rect x="72" y="94" width="56" height="23" rx="9" fill="#164e63" fillOpacity="0.9" stroke="#67e8f9" strokeWidth="2" /><path d="m79 100 8 5-8 5m42-10-8 5 8 5m-20-12-4 15" fill="none" stroke="#a5f3fc" strokeWidth="2" strokeLinecap="round" /></g> : null}
      {accessories.has('headphones') ? <g data-gear-accessory="headphones" fill={colors[2]} stroke={colors[0]} strokeWidth="3"><path d="M53 104V95a47 47 0 0 1 94 0v9" fill="none" strokeWidth="7" /><rect x="46" y="97" width="13" height="28" rx="6" /><rect x="141" y="97" width="13" height="28" rx="6" /></g> : null}
      {accessories.has('helmet') ? <g data-gear-accessory="helmet"><path d="M49 111V97a51 51 0 0 1 102 0v14" fill="#a5b4fc18" stroke="#e0e7ff" strokeWidth="5" /><path d="M61 76a43 43 0 0 1 51-20" fill="none" stroke="#ffffff99" strokeWidth="4" strokeLinecap="round" /><rect x="42" y="103" width="16" height="26" rx="5" fill="#818cf8" /><rect x="142" y="103" width="16" height="26" rx="5" fill="#818cf8" /><path d="M61 137q39 15 78 0" fill="none" stroke="#c7d2fe" strokeWidth="7" /></g> : null}
      {accessories.has('goggles') ? <g data-gear-accessory="goggles" stroke="#fdba74" strokeWidth="3" fill="#164e63cc"><path d="M52 100h20m56 0h20" /><rect x="69" y="88" width="27" height="24" rx="10" /><rect x="104" y="88" width="27" height="24" rx="10" /><path d="M96 99h8m-27-4 10 9m25-9 10 9" fill="none" /></g> : null}
      {accessories.has('medal') ? <g data-gear-accessory="medal"><path d="m78 136 22 21 22-21" fill="none" stroke="#60a5fa" strokeWidth="8" /><circle cx="100" cy="160" r="13" fill="#fcd34d" stroke="#fef3c7" strokeWidth="2" /><path d="m100 151 3 6 6 1-5 4 1 6-5-3-5 3 1-6-5-4 6-1Z" fill="#b45309" /></g> : null}
      {accessories.has('leaf') && <g data-gear-accessory="leaf" data-gear-art="leaf" stroke="#d9f99d" strokeWidth="2"><path d="M100 53V25" fill="none" strokeWidth="4" /><path d="M99 38Q67 38 72 14q27-1 27 24Z" fill="#65a30d" /><path d="M101 30q0-24 25-24 3 23-25 24Z" fill="#a3e635" /></g>}
      {accessories.has('scientist') && <g data-gear-accessory="scientist" data-gear-art="scientist" fill="none" stroke="#e2e8f0" strokeWidth="3"><circle cx="83" cy="105" r="13" /><circle cx="117" cy="105" r="13" /><path d="M96 104h8m-46-2h12m60 0h12" /><path d="m100 143-13-7v15l13-8 13-7v15Z" fill="#f472b6" stroke="#fbcfe8" strokeWidth="1.5" /></g>}
      {accessories.has('pilot') && <g data-gear-accessory="pilot" data-gear-art="pilot"><path d="M65 65q0-36 35-36t35 36Z" fill="#ef4444" stroke="#fecaca" strokeWidth="2" /><path d="M60 65h86q7 9-5 11H72Z" fill="#1e293b" stroke="#e2e8f0" strokeWidth="2" /><path d="M85 39h14v14H85Zm14 0h14v14H99Z" fill="#fff" /><path d="M92 39h7v7h-7m7 0h7v7h-7" fill="#0f172a" /></g>}
      </g>
    </g>
    {['curious', 'surprised'].includes(face) && <g className="gear-mascot__expression-mark"><circle cx="164" cy="55" r="13" fill="#15233b" stroke={colors[0]} strokeOpacity=".65" /><text x="164" y="61" textAnchor="middle" fill={colors[0]} fontSize="18" fontWeight="900">{face === 'curious' ? '?' : '!'}</text></g>}
    {face === 'thinking' && <g className="gear-mascot__thought" fill={colors[0]}><circle cx="149" cy="71" r="3" /><circle cx="157" cy="62" r="4" /><g><rect x="155" y="34" width="35" height="23" rx="11" fill="#15233b" stroke={colors[0]} strokeOpacity=".65" />{[164, 173, 182].map((x, i) => <circle key={x} cx={x} cy="46" r="2" style={{ animationDelay: `${i * .18}s` }} />)}</g></g>}
    {face === 'excited' && <g className="gear-mascot__expression-mark" fill="#fde68a"><path d="m159 32 3 8 9 1-7 6 2 9-7-5-7 5 2-9-7-6 9-1Z" /></g>}
    {mood === 'celebrate' || level >= 3 ? <g className="gear-mascot__sparks" stroke={colors[0]} strokeWidth="3" strokeLinecap="round"><path d="m37 36 5 8m119-5-5 8M17 151l10-3m152 8-10-4M100 9v8" /><circle cx="47" cy="169" r="2" /><circle cx="157" cy="166" r="2" /></g> : null}
  </svg>;
}

export function GearAvatar({ student, equipment = student?.gearAppearance, className = '' }) {
  const selected = resolveGearEquipment(equipment);
  const skin = gearItem(selected.skin);
  const frame = gearItem(selected.frame).variant;
  return <div className={`gear-avatar gear-avatar--${frame} ${className}`} style={{ '--gear-accent': skin.colors[0], '--gear-secondary': skin.colors[2] }}>
    {student?.avatarImage ? <img src={student.avatarImage} alt={student.name || 'Avatar do aluno'} className="gear-avatar__picture" /> : <div className="gear-avatar__picture gear-avatar__initials" aria-label={student?.name || 'Seu avatar'}>{(student?.name || 'NG').split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}</div>}
  </div>;
}
