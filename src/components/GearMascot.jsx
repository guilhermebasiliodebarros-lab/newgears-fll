import { useId } from 'react';
import { gearItem, resolveGearEquipment } from '../utils/gearShop';

const TEETH = Array.from({ length: 96 }, (_, index) => {
  const angle = index / 96 * Math.PI * 2 - Math.PI / 2;
  const radius = [48, 48, 57, 57, 57, 57, 48, 48][index % 8];
  return `${index ? 'L' : 'M'}${100 + Math.cos(angle) * radius},${108 + Math.sin(angle) * radius}`;
}).join(' ') + ' Z';

export default function GearMascot({ equipment, level = 1, mood = 'idle', speaking = false, className = '', label = 'Giro, a engrenagem da New Gears', decorative = false, still = false }) {
  const uid = useId();
  const selected = resolveGearEquipment(equipment);
  const colors = gearItem(selected.skin).colors;
  const frame = gearItem(selected.frame).variant;
  const accessory = gearItem(selected.accessory).variant;
  const tilt = (event) => {
    if (still || event.pointerType === 'touch' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
    const y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
    event.currentTarget.style.setProperty('--gear-yaw', `${x * 16}deg`);
    event.currentTarget.style.setProperty('--gear-pitch', `${-y * 10}deg`);
  };
  const resetTilt = (event) => { event.currentTarget.style.removeProperty('--gear-yaw'); event.currentTarget.style.removeProperty('--gear-pitch'); };
  return <svg viewBox="0 0 200 210" onPointerMove={tilt} onPointerLeave={resetTilt} role={decorative ? undefined : 'img'} aria-label={decorative ? undefined : label} aria-hidden={decorative || undefined} className={`gear-mascot gear-mascot--level-${level} gear-mascot--${mood} ${speaking ? 'gear-mascot--speaking' : ''} ${still ? 'gear-mascot--still' : ''} ${className}`}>
    <defs>
      <linearGradient id={`${uid}-body`} x1="15%" y1="0%" x2="90%" y2="100%"><stop stopColor="#e0faff" /><stop offset=".2" stopColor={colors[0]} /><stop offset=".55" stopColor={colors[1]} /><stop offset="1" stopColor={colors[2]} /></linearGradient>
      <linearGradient id={`${uid}-edge`} x1="0%" y1="0%" x2="100%" y2="100%"><stop stopColor={colors[1]} /><stop offset=".6" stopColor="#15223e" /><stop offset="1" stopColor={colors[2]} /></linearGradient>
      <radialGradient id={`${uid}-face`} cx="32%" cy="22%" r="85%"><stop stopColor="#30465f" /><stop offset=".55" stopColor="#15233b" /><stop offset="1" stopColor="#090f20" /></radialGradient>
      <linearGradient id={`${uid}-glass`} x1="0%" y1="0%" x2="60%" y2="100%"><stop stopColor="white" stopOpacity=".24" /><stop offset="1" stopColor="white" stopOpacity="0" /></linearGradient>
      <radialGradient id={`${uid}-eye`} cx="35%" cy="25%"><stop stopColor="white" /><stop offset="1" stopColor="#a5f3fc" /></radialGradient>
      <radialGradient id={`${uid}-halo`}><stop stopColor={colors[1]} stopOpacity="0.3" /><stop offset="1" stopColor={colors[1]} stopOpacity="0" /></radialGradient>
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
    <g className="gear-mascot__character">
      <g className="gear-mascot__leg gear-mascot__leg--left"><path d="M80 158v20" stroke="#45516e" strokeWidth="10" strokeLinecap="round" /><path d="M72 180h17" stroke={colors[0]} strokeWidth="11" strokeLinecap="round" /></g>
      <g className="gear-mascot__leg gear-mascot__leg--right"><path d="M120 158v20" stroke="#45516e" strokeWidth="10" strokeLinecap="round" /><path d="M111 180h17" stroke={colors[0]} strokeWidth="11" strokeLinecap="round" /></g>
      <g className="gear-mascot__arm"><path d="M49 113 30 113 23 95" fill="none" stroke={colors[1]} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" /><path d="m17 89 4-7m4 7 5-6" stroke={colors[0]} strokeWidth="6" strokeLinecap="round" /></g>
      <g className="gear-mascot__arm-right"><path d="m151 113 18 9 6-5" fill="none" stroke={colors[1]} strokeWidth="8" strokeLinecap="round" /><circle cx="178" cy="116" r="6" fill={colors[0]} /></g>
      <g className="gear-mascot__shell">
        <path className="gear-mascot__depth" d={TEETH} transform="translate(5 8)" fill={`url(#${uid}-edge)`} stroke="#111c32" strokeWidth="2.5" strokeLinejoin="round" />
        <path d={TEETH} transform="translate(2 4)" fill={`url(#${uid}-edge)`} stroke={colors[1]} strokeWidth="1" strokeLinejoin="round" />
        <path d={TEETH} fill={`url(#${uid}-body)`} stroke={colors[0]} strokeWidth="1.8" strokeLinejoin="round" className="gear-mascot__teeth" />
      </g>
      <circle cx="100" cy="108" r="44" fill="#0b1225" stroke="#e0faff" strokeOpacity=".25" strokeWidth="1" />
      <circle cx="100" cy="108" r="40" fill={`url(#${uid}-face)`} stroke={colors[0]} strokeWidth="1.5" />
      <ellipse cx="94" cy="89" rx="29" ry="19" fill={`url(#${uid}-glass)`} />
      <path d="M72 80a38 38 0 0 1 47-5" stroke="white" strokeOpacity="0.35" fill="none" strokeWidth="3" strokeLinecap="round" />
      <g className="gear-mascot__gaze"><g className="gear-mascot__eyes" fill={`url(#${uid}-eye)`}>{mood === 'celebrate' && !speaking ? <g fill="none" stroke="#e0faff" strokeWidth="4" strokeLinecap="round"><path d="m80 107 6-5 6 5m16 0 6-5 6 5" /></g> : <><ellipse cx="86" cy="105" rx="5.5" ry="7.5" /><ellipse cx="114" cy="105" rx="5.5" ry="7.5" /><circle cx="84" cy="102" r="2" fill="white" /><circle cx="112" cy="102" r="2" fill="white" /></>}</g></g>
      <ellipse cx="74" cy="117" rx="6" ry="3" fill={colors[2]} opacity="0.65" /><ellipse cx="126" cy="117" rx="6" ry="3" fill={colors[2]} opacity="0.65" />
      {level >= 4 ? <path d="m80 92 10-3m20 0 10 3" fill="none" stroke={colors[0]} strokeWidth="2.5" strokeLinecap="round" /> : null}
      <g className="gear-mascot__mouth">{speaking ? <><ellipse cx="100" cy="124" rx="9" ry="7" fill="#fda4af" stroke="#e0faff" strokeWidth="2" /><path d="M94 123h12" stroke="#fff" strokeWidth="3" strokeLinecap="round" /></> : <path d={mood === 'celebrate' ? 'M87 119Q100 140 113 119Z' : 'M90 121Q100 131 110 121'} fill={mood === 'celebrate' ? '#fda4af' : 'none'} stroke="#e0faff" strokeWidth="3" strokeLinecap="round" />}</g>
      <circle cx="100" cy="149" r="4" fill={colors[0]} stroke="#101a32" strokeWidth="2" />
      {accessory === 'antenna' ? <g><path d="M100 51V30m-8-5 8 5 8-5" fill="none" stroke={colors[0]} strokeWidth="4" strokeLinecap="round" /><circle cx="100" cy="23" r="7" fill={colors[2]} stroke={colors[0]} strokeWidth="2" /></g> : null}
      {accessory === 'crown' ? <path d="m76 56-6-25 20 12 10-22 10 22 20-12-6 25Z" fill="#fbbf24" stroke="#fef3c7" strokeWidth="2" /> : null}
      {accessory === 'visor' ? <g><rect x="72" y="94" width="56" height="23" rx="9" fill="#164e63" fillOpacity="0.9" stroke="#67e8f9" strokeWidth="2" /><path d="m79 100 8 5-8 5m42-10-8 5 8 5m-20-12-4 15" fill="none" stroke="#a5f3fc" strokeWidth="2" strokeLinecap="round" /></g> : null}
      {accessory === 'headphones' ? <g fill={colors[2]} stroke={colors[0]} strokeWidth="3"><path d="M53 104V95a47 47 0 0 1 94 0v9" fill="none" strokeWidth="7" /><rect x="46" y="97" width="13" height="28" rx="6" /><rect x="141" y="97" width="13" height="28" rx="6" /></g> : null}
      {accessory === 'helmet' ? <g><path d="M49 111V97a51 51 0 0 1 102 0v14" fill="#a5b4fc18" stroke="#e0e7ff" strokeWidth="5" /><path d="M61 76a43 43 0 0 1 51-20" fill="none" stroke="#ffffff99" strokeWidth="4" strokeLinecap="round" /><rect x="42" y="103" width="16" height="26" rx="5" fill="#818cf8" /><rect x="142" y="103" width="16" height="26" rx="5" fill="#818cf8" /><path d="M61 137q39 15 78 0" fill="none" stroke="#c7d2fe" strokeWidth="7" /></g> : null}
      {accessory === 'goggles' ? <g stroke="#fdba74" strokeWidth="3" fill="#164e63cc"><path d="M52 100h20m56 0h20" /><rect x="69" y="88" width="27" height="24" rx="10" /><rect x="104" y="88" width="27" height="24" rx="10" /><path d="M96 99h8m-27-4 10 9m25-9 10 9" fill="none" /></g> : null}
      {accessory === 'medal' ? <g><path d="m78 136 22 21 22-21" fill="none" stroke="#60a5fa" strokeWidth="8" /><circle cx="100" cy="160" r="13" fill="#fcd34d" stroke="#fef3c7" strokeWidth="2" /><path d="m100 151 3 6 6 1-5 4 1 6-5-3-5 3 1-6-5-4 6-1Z" fill="#b45309" /></g> : null}
    </g>
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
