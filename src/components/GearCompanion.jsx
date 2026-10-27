import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { Music2, ShoppingBag, Square, Volume2, X } from 'lucide-react';
import useGearShopContext from '../hooks/useGearShopContext';
import useGiroSpeech from '../hooks/useGiroSpeech';
import GearMascot from './GearMascot';

const INTRO_TITLE = 'Toda contribuição faz a equipe girar!';
const INTRO_MESSAGE = 'Sou o Giro! Vou acompanhar suas descobertas e comemorar seus registros. Na loja, você pode escolher meu visual e personalizar seu perfil.';

function rewardMessage(reaction) {
  switch (reaction?.status) {
    case 'earned': return reaction.coins > 0 ? `+${reaction.coins} Gears conquistados!` : '';
    case 'pending': return 'Registro salvo. Confirmando seus Gears…';
    case 'retry': return 'Seu registro está salvo. Os Gears ficaram pendentes; você pode tentar novamente pela loja.';
    case 'capped': return 'O limite de Gears para hoje foi alcançado. Sua contribuição continua fazendo diferença!';
    case 'duplicate': return 'Os Gears deste registro já foram contabilizados.';
    default: return '';
  }
}

export default function GearCompanion() {
  const { account, reaction, pending, onOpenShop, isLiteMode } = useGearShopContext();
  const bubbleId = useId();
  const [dismissed, setDismissed] = useState(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dance, setDance] = useState(null);
  const open = Boolean(manualOpen || (reaction && reaction.id !== dismissed));
  const title = reaction?.title || INTRO_TITLE;
  const message = reaction?.message || INTRO_MESSAGE;
  const reward = rewardMessage(reaction);
  const speechText = `${title} ${message}${reward ? ` ${reward}` : ''}`;
  const messageId = open ? reaction?.id ?? 'intro' : null;
  const speech = useGiroSpeech(open ? speechText : '', messageId);
  const dancing = open && dance?.messageId === messageId;

  useEffect(() => {
    if (!open || manualOpen || hovered || focused || speech.playing || dancing || !reaction) return;
    // Give long messages enough reading time, and pause dismissal during interaction.
    const timeout = window.setTimeout(() => setDismissed(reaction.id), Math.max(12000, Math.min(30000, speechText.length * 65)));
    return () => window.clearTimeout(timeout);
  }, [open, manualOpen, hovered, focused, speech.playing, dancing, reaction, speechText]);

  useEffect(() => {
    if (!dance) return;
    const timeout = window.setTimeout(() => setDance(null), 4800);
    return () => window.clearTimeout(timeout);
  }, [dance]);

  const close = () => {
    speech.stop();
    setDismissed(reaction?.id);
    setManualOpen(false);
    setDance(null);
    setFocused(false);
  };

  return createPortal(<aside className={`gear-companion ${isLiteMode ? 'gear-companion--lite' : ''} ${dancing ? 'gear-companion--dancing' : ''}`} aria-label="Giro, mascote da New Gears"
    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onFocusCapture={() => setFocused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
    onKeyDown={(event) => { if (event.key === 'Escape' && open) { close(); event.currentTarget.querySelector('.gear-companion__button')?.focus(); } }}>
    {open ? <div id={bubbleId} className={`gear-companion__bubble ${speech.speaking ? 'gear-companion__bubble--speaking' : ''}`}>
      <button type="button" onClick={close} aria-label="Fechar mensagem do Giro" className="gear-companion__close"><X size={15} /></button>
      <p className="gear-companion__eyebrow"><span className="gear-companion__signal" aria-hidden="true"><i /><i /><i /></span>Giro · New Gears</p>
      <div role="status" aria-live="polite" aria-atomic="true">
        <h3 className="gear-companion__title">{title}</h3>
        <p className="gear-companion__message">{message}</p>
        {reward ? <p className={`gear-companion__reward ${reaction?.status === 'earned' ? 'gear-companion__reward--earned' : ''}`}>{reward}</p> : null}
      </div>
      <div className="gear-companion__actions">
        {speech.supported ? <button type="button" onClick={speech.playing ? speech.stop : speech.speak} aria-pressed={speech.playing} className="gear-companion__action gear-companion__action--voice">
          {speech.playing ? <Square size={13} fill="currentColor" /> : <Volume2 size={15} />}
          {speech.starting ? 'Iniciando voz…' : speech.playing ? 'Parar áudio' : 'Ouvir mensagem'}
        </button> : null}
        <button type="button" onClick={() => setDance({ messageId })} className="gear-companion__action"><Music2 size={14} />{dancing ? 'Mais uma dança!' : 'Dançar'}</button>
      </div>
      {speech.error ? <p className="gear-companion__audio-note" role="alert">{speech.error}</p> : null}
      {!speech.supported ? <p className="gear-companion__audio-note">A leitura em voz alta não está disponível neste navegador.</p> : null}
      <button type="button" onClick={() => { close(); onOpenShop(); }} className="gear-companion__shop"><ShoppingBag size={14} />Visitar a loja{pending.length ? ` · ${pending.length} pendente(s)` : ''}</button>
    </div> : null}
    <button type="button" onClick={() => open ? close() : setManualOpen(true)} aria-expanded={open} aria-controls={open ? bubbleId : undefined} aria-label="Conversar com Giro" className="gear-companion__button">
      <GearMascot equipment={account.equipped} mood={dancing ? 'dance' : open ? reaction ? 'celebrate' : 'wave' : 'idle'} speaking={speech.speaking} decorative />
      <span className="gear-companion__name">{speech.speaking ? 'Falando…' : 'Giro'}</span>
      {pending.length ? <span className="gear-companion__badge" aria-label={`${pending.length} recompensa(s) pendente(s)`}>{pending.length}</span> : null}
    </button>
  </aside>, document.body);
}
