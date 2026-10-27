import { lazy, Suspense, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { PartyPopper, Trophy, X } from 'lucide-react';
import TournamentFireworks from './TournamentFireworks';

const Confetti = lazy(() => import('react-confetti'));

const motionPreference = () => window.matchMedia('(prefers-reduced-motion: reduce)');
const subscribeToMotionPreference = (callback) => {
  const preference = motionPreference();
  preference.addEventListener('change', callback);
  return () => preference.removeEventListener('change', callback);
};
const getReducedMotion = () => motionPreference().matches;
const getServerReducedMotion = () => true;

export default function TournamentSelectionNotice({ studentName, seasonName, isLiteMode = false }) {
  const [celebrating, setCelebrating] = useState(true);
  const [celebrationRun, setCelebrationRun] = useState(0);
  const [finishedRun, setFinishedRun] = useState(-1);
  const [effectsRequested, setEffectsRequested] = useState(false);
  const prefersReducedMotion = useSyncExternalStore(subscribeToMotionPreference, getReducedMotion, getServerReducedMotion);
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!celebrating) return;
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    dialog.showModal();
    const timeout = window.setTimeout(() => setFinishedRun(celebrationRun), 8000);
    return () => {
      window.clearTimeout(timeout);
      dialog.close();
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [celebrating, celebrationRun]);

  const replayCelebration = () => {
    setEffectsRequested(true);
    setCelebrationRun((value) => value + 1);
    setCelebrating(true);
  };

  return <>
    <section className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-amber-300/35 bg-gradient-to-r from-amber-400/15 via-yellow-300/5 to-[#111722] p-5" aria-label="Convocação para o torneio">
      <div className="flex items-center gap-3"><Trophy size={30} className="shrink-0 text-amber-300" /><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-200">Equipe do torneio · {seasonName}</p><h2 className="mt-1 text-lg font-black text-white">Sua convocação está confirmada!</h2><p className="mt-1 text-xs text-gray-300">Vamos representar a New Gears juntos. Continue se preparando com a equipe!</p></div></div>
      <button type="button" onClick={replayCelebration} className="rounded-xl border border-amber-300/25 bg-amber-300/10 px-4 py-2.5 text-xs font-black text-amber-100">Ver convocação</button>
    </section>
    <dialog ref={dialogRef} onCancel={() => setCelebrating(false)} aria-labelledby="tournament-invitation-title" aria-describedby="tournament-invitation-description" className="fixed inset-0 m-0 h-[100dvh] max-h-none w-screen max-w-none overflow-hidden border-0 bg-transparent p-0 text-center text-white backdrop:bg-black/85">
      {celebrating && (!prefersReducedMotion || effectsRequested) && finishedRun !== celebrationRun ? <div key={celebrationRun} className="pointer-events-none absolute inset-0" aria-hidden="true"><TournamentFireworks lightweight={isLiteMode} allowReducedMotion={effectsRequested} /><Suspense fallback={null}><Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={isLiteMode ? 50 : 100} gravity={0.14} /></Suspense></div> : null}
      <div className="relative flex h-full items-center justify-center p-4">
      <div className="relative max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-[32px] border border-amber-300/40 bg-[#111722]/95 p-6 shadow-2xl md:p-10">
      <button type="button" autoFocus onClick={() => setCelebrating(false)} aria-label="Fechar convocação" className="absolute right-4 top-4 rounded-full border border-white/15 p-2 text-gray-300 hover:text-white focus-visible:outline focus-visible:outline-amber-300"><X size={18} /></button>
      <div className="mx-auto mt-4 flex h-24 w-24 items-center justify-center rounded-full border border-amber-300/30 bg-amber-300/10 text-amber-300"><Trophy size={48} /></div>
      <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-amber-200">Convocação oficial · New Gears</p>
      <h2 id="tournament-invitation-title" className="mt-4 text-3xl font-black leading-tight">{studentName}, você vai ao torneio!</h2>
      <p id="tournament-invitation-description" className="mt-4 text-sm leading-relaxed text-gray-200">O técnico confirmou sua participação para representar a New Gears. Seu empenho e sua contribuição fazem parte dessa conquista!</p>
      <p className="mt-4 rounded-2xl border border-amber-300/15 bg-amber-300/5 p-4 text-sm leading-relaxed text-amber-100">Agora é hora de seguir treinando, apoiar os colegas e levar os valores FLL para o torneio. Vamos juntos!</p>
      {prefersReducedMotion && !effectsRequested ? <p className="mt-4 text-xs text-gray-300">As animações automáticas estão reduzidas neste dispositivo. Você pode ativar os fogos pelo botão abaixo.</p> : null}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={replayCelebration} className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-300/30 bg-amber-300/10 px-5 py-2.5 text-sm font-bold text-amber-100"><PartyPopper size={18} />{prefersReducedMotion && !effectsRequested ? 'Ativar fogos' : 'Repetir fogos'}</button>
        <button type="button" onClick={() => setCelebrating(false)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-300 px-6 py-3 text-sm font-black text-black"><PartyPopper size={18} />Vamos com tudo!</button>
      </div>
      </div>
      </div>
    </dialog>
  </>;
}
