import { Check, LockKeyhole, Sparkles } from 'lucide-react';
import { GEAR_LEVELS, gearEvolution } from '../utils/gearEvolution';
import useGearShopContext from '../hooks/useGearShopContext';

export default function GearEvolutionPanel() {
  const { account, isStudent, loading, walletError } = useGearShopContext();
  const evolution = gearEvolution(account);
  if (!isStudent) return null;
  return <section className="gear-evolution" aria-label="Evolução do Giro">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.2em] text-cyan-200"><Sparkles size={14} />Seu Giro está evoluindo</p><h3 className="mt-3 text-2xl font-black text-white">Nível {evolution.level} · {evolution.name}</h3><p className="mt-2 text-xs leading-relaxed text-slate-300">{evolution.description}</p></div>
      <div className="rounded-2xl border border-cyan-200/20 bg-black/20 px-5 py-3 text-right"><p className="text-2xl font-black text-cyan-100">{loading ? '…' : walletError ? '—' : evolution.points}</p><p className="mt-1 text-[10px] font-bold text-slate-400">pontos de evolução · {evolution.total} contribuições</p></div>
    </div>
    <div className="mt-5 h-2 overflow-hidden rounded-full bg-black/30" role="progressbar" aria-label="Progresso do Giro para o próximo nível" aria-valuemin={0} aria-valuemax={100} aria-valuenow={evolution.progress}><div className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-indigo-400 to-fuchsia-400" style={{ width: `${evolution.progress}%` }} /></div>
    <p className="mt-3 text-xs text-slate-300">{evolution.next ? `Faltam ${evolution.next.minimum - evolution.points} pontos para ${evolution.next.name}: ${evolution.next.unlock.toLowerCase()}.` : 'Você desbloqueou todas as etapas do Giro! Continue registrando suas descobertas.'}</p>
    <div className="mt-5 grid gap-2 sm:grid-cols-5">{GEAR_LEVELS.map((level) => <div key={level.level} className={`rounded-xl border p-3 ${level.level <= evolution.level ? 'border-cyan-300/25 bg-cyan-300/5' : 'border-white/5 bg-black/10 text-slate-500'}`}><p className="flex items-center gap-2 text-[10px] font-black">{level.level <= evolution.level ? <Check size={12} className="text-cyan-200" /> : <LockKeyhole size={12} />}N{level.level} · {level.minimum} pts</p><p className="mt-2 text-xs font-black">{level.name}</p><p className="mt-1 text-[10px] leading-relaxed text-slate-400">{level.unlock}</p></div>)}</div>
    <div className="mt-4 flex flex-wrap gap-2">{evolution.milestones.map((milestone) => <span key={milestone.id} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold ${milestone.achieved ? 'border-amber-200/25 bg-amber-200/5 text-amber-100' : 'border-white/5 text-slate-500'}`}>{milestone.achieved ? <Check size={12} /> : <LockKeyhole size={11} />}{milestone.name}</span>)}</div>
    <p className="mt-4 text-[11px] leading-relaxed text-slate-400">Cada contribuição reconhecida faz o Giro evoluir e rende Gears, sem limite diário. Gastar moedas na loja não reduz seu nível. O histórico com autoria confirmada também conta; XP e notas seguem as avaliações.</p>
  </section>;
}
