import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Cog, Music2, Sparkles, Trophy } from 'lucide-react';
import { gearItem, resolveGearEquipment } from '../utils/gearShop';
import './GiroStudio.css';

export default function GearCelebration({ equipment, compact = false, onComplete }) {
  const [visible, setVisible] = useState(true);
  const variant = gearItem(resolveGearEquipment(equipment).animation).variant;
  useEffect(() => {
    const timer = window.setTimeout(() => { setVisible(false); onComplete?.(); }, 4400);
    return () => window.clearTimeout(timer);
  }, [onComplete]);
  if (!visible || variant === 'celebrate') return null;
  const Particle = variant === 'gears' ? Cog : variant === 'stage' ? Music2 : Sparkles;
  const content = <div className={`giro-celebration giro-celebration--${variant} ${compact ? 'giro-celebration--compact' : ''}`} aria-hidden="true">
    {Array.from({ length: compact ? 10 : 24 }, (_, index) => <span key={index} className="giro-celebration__particle" style={{ '--x': `${(index * 37 + 7) % 100}%`, '--delay': `${index % 7 * .09}s`, '--turn': `${index % 2 ? -280 : 320}deg`, '--size': `${16 + index % 4 * 6}px`, '--drift': `${index % 2 ? 60 : -60}px`, color: ['#67e8f9', '#a5b4fc', '#fcd34d', '#f0abfc'][index % 4] }}><Particle size="100%" /></span>)}
    {variant === 'stage' && <><div className="giro-celebration__beam giro-celebration__beam--left" /><div className="giro-celebration__beam giro-celebration__beam--right" /><div className="giro-celebration__banner"><Music2 />Giro em cena!</div></>}
    {variant === 'trophy' && <div className="giro-celebration__trophy"><Trophy strokeWidth={1.4} /><span>A equipe faz acontecer!</span></div>}
  </div>;
  return compact ? content : createPortal(content, document.body);
}
