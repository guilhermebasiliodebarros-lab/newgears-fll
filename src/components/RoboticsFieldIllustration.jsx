import { useId } from 'react';

// A lightweight, season-independent drawing of the team's build → test → learn loop.
export default function RoboticsFieldIllustration({ className = '' }) {
  const id = useId().replace(/:/g, '');
  return <svg className={className} viewBox="0 0 580 330" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <defs>
      <pattern id={`${id}-grid`} width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" stroke="currentColor" strokeOpacity=".08" /></pattern>
      <linearGradient id={`${id}-body`} x1="230" y1="115" x2="345" y2="220" gradientUnits="userSpaceOnUse"><stop stopColor="#D4CBFF" /><stop offset="1" stopColor="#8570DE" /></linearGradient>
      <linearGradient id={`${id}-floor`} x1="45" y1="35" x2="530" y2="295" gradientUnits="userSpaceOnUse"><stop stopColor="#1F2B40" /><stop offset="1" stopColor="#111827" /></linearGradient>
    </defs>
    <rect x="25" y="25" width="530" height="280" rx="24" fill={`url(#${id}-floor)`} stroke="#B9AAFF" strokeOpacity=".24" />
    <rect x="39" y="39" width="502" height="252" rx="16" fill={`url(#${id}-grid)`} />
    <path d="M94 239V102Q94 81 117 81H420Q449 81 449 109V224Q449 246 424 246H360" stroke="#7BE0BF" strokeOpacity=".22" strokeWidth="25" strokeLinecap="round" />
    <path d="M94 239V102Q94 81 117 81H420Q449 81 449 109V224Q449 246 424 246H360" stroke="#7BE0BF" strokeWidth="2" strokeDasharray="5 9" strokeLinecap="round" />
    <circle cx="94" cy="239" r="27" fill="#122F2A" stroke="#7BE0BF" strokeOpacity=".4" /><circle cx="94" cy="239" r="10" fill="#7BE0BF" /><path d="m90 239 3 3 6-7" stroke="#122F2A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <g transform="translate(414 121)"><rect width="66" height="66" rx="13" fill="#28213E" stroke="#B9AAFF" strokeOpacity=".35" /><path d="m17 40 16-21 16 21H17Z" fill="#B9AAFF" fillOpacity=".18" stroke="#B9AAFF" strokeWidth="2" strokeLinejoin="round" /><path d="M33 27v9m0 5v1" stroke="#D9D1FF" strokeWidth="2" strokeLinecap="round" /></g>
    <g transform="translate(159 122)"><path d="M0 70V0h56v70" stroke="#E8C888" strokeWidth="3" strokeLinecap="round" /><path d="M0 0h56M0 20h56M0 40h56M0 60h56M0 0l56 60M56 0 0 60" stroke="#E8C888" strokeOpacity=".38" strokeWidth="2" /><rect x="-7" y="67" width="17" height="9" rx="3" fill="#E8C888" /><rect x="47" y="67" width="17" height="9" rx="3" fill="#E8C888" /></g>
    <ellipse cx="296" cy="227" rx="72" ry="15" fill="#000" fillOpacity=".23" />
    <g transform="rotate(-12 295 177)">
      <rect x="236" y="137" width="20" height="78" rx="8" fill="#070C15" stroke="#67758C" /><path d="M241 147h10m-10 13h10m-10 13h10m-10 13h10m-10 13h10" stroke="#67758C" strokeWidth="3" />
      <rect x="331" y="137" width="20" height="78" rx="8" fill="#070C15" stroke="#67758C" /><path d="M336 147h10m-10 13h10m-10 13h10m-10 13h10m-10 13h10" stroke="#67758C" strokeWidth="3" />
      <rect x="252" y="129" width="83" height="91" rx="15" fill={`url(#${id}-body)`} stroke="#E4DFFF" strokeWidth="1.5" />
      <rect x="266" y="148" width="55" height="43" rx="9" fill="#1A2133" />
      <path d="m279 164 6 5-6 5m14 0h12" stroke="#9AEBCF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="293" cy="205" r="5" fill="#F1EDFF" /><path d="M279 128v-17h29v17" stroke="#D4CBFF" strokeWidth="6" strokeLinejoin="round" />
      <rect x="271" y="100" width="45" height="16" rx="7" fill="#222D41" stroke="#AFA0EB" /><circle cx="282" cy="108" r="3" fill="#7BE0BF" /><circle cx="305" cy="108" r="3" fill="#7BE0BF" />
    </g>
    <path d="m366 233 14 13-14 13" stroke="#7BE0BF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <g fill="#A8B6CD" fillOpacity=".7"><circle cx="504" cy="69" r="2" /><circle cx="514" cy="69" r="2" /><circle cx="524" cy="69" r="2" /></g>
    <path d="M56 64V54h10m448 215h10v-10" stroke="#AFA0EB" strokeOpacity=".6" strokeWidth="2" strokeLinecap="round" />
  </svg>;
}
