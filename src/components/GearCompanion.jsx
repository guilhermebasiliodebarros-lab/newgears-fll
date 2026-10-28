import { useCallback, useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUp, Lightbulb, Music2, RotateCw, ShoppingBag, SlidersHorizontal, Sparkles, Square, Volume2, X } from 'lucide-react';
import useGearShopContext from '../hooks/useGearShopContext';
import useGiroSpeech from '../hooks/useGiroSpeech';
import GearMascot from './GearMascot';
import GearCelebration from './GearCelebration';
import { gearItem } from '../utils/gearShop';
import { gearEvolution } from '../utils/gearEvolution';
import { giroVoiceId } from '../utils/giroSpeech';

const INTRO_TITLE = 'Toda contribuição faz a equipe girar!';
const INTRO_MESSAGE = 'Sou o Giro! Vou acompanhar suas descobertas e comemorar seus registros. Na loja, você pode escolher meu visual e personalizar seu perfil.';

function rewardMessage(reaction) {
  switch (reaction?.status) {
    case 'earned': return reaction.coins > 0 ? `+${reaction.coins} Gears conquistados!` : '';
    case 'pending': return 'Registro salvo. Confirmando seus Gears…';
    case 'retry': return 'Seu registro está salvo. Os Gears ficaram pendentes; você pode tentar novamente pela loja.';
    case 'duplicate': return 'Os Gears deste registro já foram contabilizados.';
    default: return '';
  }
}

export default function GearCompanion() {
  const { account, reaction, pending, onOpenShop, isLiteMode } = useGearShopContext();
  const evolution = gearEvolution(account);
  const bubbleId = useId();
  const [dismissed, setDismissed] = useState(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dance, setDance] = useState(null);
  const [manualCelebration, setManualCelebration] = useState(null);
  const [finishedReaction, setFinishedReaction] = useState(null);
  const automaticCelebration = reaction && reaction.id !== finishedReaction && (reaction.status === 'style' || (reaction.status === 'earned' && reaction.coins > 0));
  const celebrationId = manualCelebration?.id || (automaticCelebration ? reaction.id : null);
  const celebrationEquipment = { ...account.equipped, animation: manualCelebration?.animationId || reaction?.animationId || account.equipped.animation };
  const celebrationMood = gearItem(celebrationEquipment.animation)?.variant === 'stage' ? 'stage' : 'celebrate';
  const finishCelebration = useCallback(() => { setManualCelebration(null); setFinishedReaction(reaction?.id); }, [reaction?.id]);
  const open = Boolean(manualOpen || (reaction && reaction.id !== dismissed));
  const title = reaction?.title || INTRO_TITLE;
  const message = reaction?.message || INTRO_MESSAGE;
  const reward = rewardMessage(reaction);
  const tip = reaction?.tip || '';
  const speechText = `${title} ${message}${reward ? ` ${reward}` : ''}${tip ? ` Dica do Giro: ${tip}` : ''}`;
  const messageId = open ? reaction?.id ?? 'intro' : null;
  const speech = useGiroSpeech(open ? speechText : '', messageId, account.studentId || 'tecnico');
  const dancing = open && dance?.messageId === messageId;
  const perform = (mood = 'dance') => setDance((previous) => ({ messageId, mood, sequence: (previous?.sequence || 0) + 1 }));

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

  return createPortal(<><aside className={`gear-companion ${isLiteMode ? 'gear-companion--lite' : ''} ${dancing ? `gear-companion--performing gear-companion--${dance.mood || 'dance'}` : ''}`} aria-label="Giro, mascote da New Gears"
    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onFocusCapture={() => setFocused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
    onKeyDown={(event) => { if (event.key === 'Escape' && open) { close(); event.currentTarget.querySelector('.gear-companion__button')?.focus(); } }}>
    {open ? <div id={bubbleId} className={`gear-companion__bubble ${speech.speaking ? 'gear-companion__bubble--speaking' : ''}`}>
      <div className="gear-companion__bubble-content">
      <button type="button" onClick={close} aria-label="Fechar mensagem do Giro" className="gear-companion__close"><X size={15} /></button>
      <p className="gear-companion__eyebrow"><span className="gear-companion__signal" aria-hidden="true"><i /><i /><i /></span>Giro · New Gears</p>
      <p className="gear-companion__level">Nível {evolution.level} · {evolution.name} · {evolution.points} pts</p>
      <div role="status" aria-live="polite" aria-atomic="true">
        <h3 className="gear-companion__title">{title}</h3>
        <p className="gear-companion__message">{message}</p>
        {reward ? <p className={`gear-companion__reward ${reaction?.status === 'earned' ? 'gear-companion__reward--earned' : ''}`}>{reward}</p> : null}
        {tip ? <div className="gear-companion__tip"><p><Lightbulb size={13} />Dica do Giro</p><span>{tip}</span></div> : null}
      </div>
      <div className="gear-companion__actions">
        {speech.supported ? <button type="button" onClick={speech.playing ? speech.stop : speech.speak} aria-pressed={speech.playing} className="gear-companion__action gear-companion__action--voice">
          {speech.playing ? <Square size={13} fill="currentColor" /> : <Volume2 size={15} />}
          {speech.starting ? 'Iniciando voz…' : speech.playing ? 'Parar áudio' : 'Ouvir mensagem'}
        </button> : null}
        <button type="button" onClick={() => perform()} className="gear-companion__action"><Music2 size={14} />{dancing ? 'Mais uma dança!' : 'Dançar'}</button>
        {evolution.level >= 2 ? <button type="button" onClick={() => perform('spin')} className="gear-companion__action"><RotateCw size={14} />Giro especial</button> : null}
        {evolution.level >= 3 ? <button type="button" onClick={() => perform('hop')} className="gear-companion__action"><ArrowUp size={14} />Pular</button> : null}
        <button type="button" onClick={() => { setDance(null); setManualCelebration({ id: crypto.randomUUID(), animationId: account.equipped.animation }); }} className="gear-companion__action"><Sparkles size={14} />Comemorar</button>
      </div>
      {speech.supported ? <details className="gear-companion__voice-settings">
        <summary><SlidersHorizontal size={13} />Voz e ritmo</summary>
        <label>Voz<select aria-label="Voz do Giro" value={speech.voice} onChange={(event) => speech.configure({ voice: event.target.value })}>
          <option value="auto">Automática · {speech.voiceName}</option>
          {speech.voices.map((voice) => <option key={giroVoiceId(voice)} value={giroVoiceId(voice)}>{voice.name} · {voice.lang}</option>)}
        </select></label>
        <label>Velocidade · {speech.rate.toFixed(2).replace('.', ',')}×<input aria-label="Velocidade da voz do Giro" type="range" min="0.8" max="1.2" step="0.02" value={speech.rate} onChange={(event) => speech.configure({ rate: Number(event.target.value) })} /></label>
        <p>Compare as vozes para escolher a que você mais gosta. As opções variam conforme o navegador e o dispositivo.</p>
      </details> : null}
      {speech.error ? <p className="gear-companion__audio-note" role="alert">{speech.error}</p> : null}
      {!speech.supported ? <p className="gear-companion__audio-note">A leitura em voz alta não está disponível neste navegador.</p> : null}
      <button type="button" onClick={() => { close(); onOpenShop(); }} className="gear-companion__shop"><ShoppingBag size={14} />Visitar a loja{pending.length ? ` · ${pending.length} pendente(s)` : ''}</button>
      </div>
    </div> : null}
    <button type="button" onClick={() => open ? close() : setManualOpen(true)} aria-expanded={open} aria-controls={open ? bubbleId : undefined} aria-label="Conversar com Giro" className="gear-companion__button">
      <GearMascot key={dance?.sequence || celebrationId || 0} equipment={account.equipped} level={evolution.level} mood={dancing ? dance.mood || 'dance' : celebrationId ? celebrationMood : open ? reaction ? 'celebrate' : 'wave' : 'idle'} speaking={speech.speaking} decorative />
      <span className="gear-companion__name">{speech.speaking ? 'Falando…' : `Giro · N${evolution.level}`}</span>
      {pending.length ? <span className="gear-companion__badge" aria-label={`${pending.length} recompensa(s) pendente(s)`}>{pending.length}</span> : null}
    </button>
  </aside>{celebrationId && <GearCelebration key={celebrationId} equipment={celebrationEquipment} onComplete={finishCelebration} />}</>, document.body);
}
