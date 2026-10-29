import { useState } from 'react';

export default function TrajectoryRoundControls({ available, session, onStart, onNext, onEnd, disabled }) {
  const [order, setOrder] = useState([1, 2, 3, 4, 5, 6, 7, 8]);
  const [enabled, setEnabled] = useState([1, 2, 3, 4, 5, 6, 7, 8]);
  const selected = order.filter((number) => enabled.includes(number) && available.includes(number));
  const move = (index, change) => { const next = [...order]; [next[index], next[index + change]] = [next[index + change], next[index]]; setOrder(next); };
  if (session) {
    const entry = session.entries[session.index]; const next = session.entries[session.index + 1];
    return <div className="space-y-3 rounded-2xl border border-violet-200/40 bg-violet-300/10 p-4" aria-label="Round em reprodução">
      <p className="text-sm font-bold">Round completo · saída {session.index + 1} de {session.entries.length} · Saída {entry.number}</p>
      {session.waiting && <p role="status" className="text-sm text-amber-100">{next ? `Pausa: reposicione o robô para a Saída ${next.number}. Garra: ${next.plan.settings.gripperName || 'sem garra configurada'}. Orientação: ${next.plan.settings.heading}°.` : 'Round concluído. Todas as saídas selecionadas foram reproduzidas.'}</p>}
      <div className="flex flex-wrap gap-2">{session.waiting && next && <button onClick={onNext} className="rounded-xl bg-violet-200 px-4 py-2 text-xs font-bold text-slate-950">Iniciar próxima saída</button>}<button onClick={onEnd} className="rounded-xl border border-white/20 px-4 py-2 text-xs font-bold">Encerrar round</button></div>
      <p className="text-xs text-slate-300">A prévia usa uma cópia das saídas registradas. Seu rascunho é retomado ao encerrar.</p>
    </div>;
  }
  return <details className="rounded-2xl border border-violet-300/20 bg-black/15 p-3">
    <summary className="cursor-pointer text-sm font-bold">Reproduzir round completo · saídas registradas</summary>
    <p className="mt-3 text-xs leading-relaxed text-slate-300">Escolha a ordem e as saídas. Entre elas, a prévia aguarda sua confirmação para representar o reposicionamento e a troca de garra. Alterações no rascunho precisam ser registradas antes de entrar no round.</p>
    <ol className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{order.map((number, index) => <li key={number} className="flex items-center justify-between gap-2 rounded-xl border border-white/10 p-2 text-xs"><label className="flex items-center gap-2"><input type="checkbox" aria-label={`Incluir Saída ${number} no round`} checked={enabled.includes(number)} disabled={!available.includes(number) || disabled} onChange={(event) => setEnabled(event.target.checked ? [...enabled, number] : enabled.filter((item) => item !== number))} />Saída {number}{!available.includes(number) ? ' · sem registro' : ''}</label><span className="flex gap-1"><button aria-label={`Antecipar Saída ${number} no round`} disabled={index === 0 || disabled} onClick={() => move(index, -1)} className="rounded bg-white/5 p-2 disabled:opacity-30">↑</button><button aria-label={`Adiar Saída ${number} no round`} disabled={index === order.length - 1 || disabled} onClick={() => move(index, 1)} className="rounded bg-white/5 p-2 disabled:opacity-30">↓</button></span></li>)}</ol>
    <p className="mt-3 text-xs text-violet-100">Ordem: {selected.length ? selected.map((number) => `Saída ${number}`).join(' → ') : 'registre pelo menos uma saída'}</p>
    <button disabled={disabled || !selected.length} onClick={() => onStart(selected)} className="mt-3 rounded-xl bg-violet-200 px-4 py-2 text-xs font-black text-slate-950 disabled:opacity-40">Iniciar round completo</button>
  </details>;
}
