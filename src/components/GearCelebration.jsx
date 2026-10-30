import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Cog, Leaf, Music2, Rocket, Sparkles, Trophy } from 'lucide-react';
import { gearItem, resolveGearEquipment } from '../utils/gearShop';
import GearMascot from './GearMascot';
import useReducedMotion from '../hooks/useReducedMotion';
import './GiroStudio.css';
import './GiroEnhancements.css';

export default function GearCelebration({ equipment, compact = false, calm = false, onComplete }) {
  const reducedMotion = useReducedMotion();
  const quiet = calm || reducedMotion;
  const [visible, setVisible] = useState(true);
  const variant = gearItem(resolveGearEquipment(equipment).animation).variant;
  useEffect(() => {
    const timer = window.setTimeout(() => { setVisible(false); onComplete?.(); }, 4400);
    return () => window.clearTimeout(timer);
  }, [onComplete]);
  if (!visible) return null;
  const Particle = variant === 'gears' ? Cog : variant === 'stage' ? Music2 : variant === 'fireflies' ? Leaf : Sparkles;
  const content = <div className={`giro-celebration giro-celebration--${variant} ${compact ? 'giro-celebration--compact' : ''} ${quiet ? 'giro-celebration--calm' : ''}`} aria-hidden="true">
    <div className="giro-celebration__scene"><div className="giro-celebration__floor" /><div className="giro-celebration__ring giro-celebration__ring--one" /><div className="giro-celebration__ring giro-celebration__ring--two" /><div className="giro-celebration__hero"><GearMascot equipment={equipment} still={quiet} mood={variant === 'stage' ? 'stage' : variant === 'gears' ? 'spin' : 'celebrate'} heldItem={variant === 'trophy' ? 'trophy' : ''} decorative /></div><p>{variant === 'stage' ? 'Solta o ritmo, Giro!' : variant === 'gears' ? 'As ideias estão girando!' : variant === 'trophy' ? 'Essa conquista é da equipe!' : 'Mais uma conquista juntos!'}</p></div>
    {Array.from({ length: quiet ? 0 : compact ? 10 : 24 }, (_, index) => <span key={index} className="giro-celebration__particle" style={{ '--x': `${(index * 37 + 7) % 100}%`, '--delay': `${index % 7 * .09}s`, '--turn': `${index % 2 ? -280 : 320}deg`, '--size': `${16 + index % 4 * 6}px`, '--drift': `${index % 2 ? 60 : -60}px`, color: ['#67e8f9', '#a5b4fc', '#fcd34d', '#f0abfc'][index % 4] }}><Particle size="100%" /></span>)}
    {variant === 'stage' && <><div className="giro-celebration__beam giro-celebration__beam--left" /><div className="giro-celebration__beam giro-celebration__beam--right" /><div className="giro-celebration__banner"><Music2 />Giro em cena!</div></>}
    {variant === 'trophy' && <div className="giro-celebration__trophy"><Trophy strokeWidth={1.4} /><span>A equipe faz acontecer!</span></div>}
    {variant === 'fireflies' && <div className="giro-celebration__nature">Bioglow · descobertas que brilham!</div>}
    {variant === 'rocket' && <div className="giro-celebration__rocket"><Rocket size="100%" /><span>Ideias em decolagem!</span></div>}
  </div>;
  return compact ? content : createPortal(content, document.body);
}
