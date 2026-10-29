import { useState } from 'react';
import { Coins } from 'lucide-react';
import useGearShopContext from '../hooks/useGearShopContext';
import { setTaskGearReward } from '../services/taskGearRewards';
import { GEAR_GRANT_MAX } from '../utils/gearGrants';

export default function TaskGearReward({ task }) {
  const { db, user, seasonId } = useGearShopContext();
  const [editing, setEditing] = useState(false);
  const [coins, setCoins] = useState(String(task.gearReward || 0));
  const [state, setState] = useState({ saving: false, error: '' });
  const paid = Boolean(task.gearRewardPaidAt);
  return <div className="my-1 text-[11px]" onKeyDown={(event) => event.stopPropagation()}>
    {(task.gearReward > 0 || paid) && <p className="flex items-center gap-1.5 rounded-lg border border-amber-200/20 bg-amber-200/5 px-2 py-1.5 font-bold text-amber-100"><Coins size={12} />{task.gearReward} Gears por participante · {paid ? 'já creditados' : 'após aprovação do técnico'}</p>}
    {user?.type === 'admin' && !paid && task.status !== 'done' && (editing ? <form className="mt-2 space-y-2 rounded-lg border border-amber-200/20 p-2" onSubmit={async (event) => { event.preventDefault(); if (state.saving) return; setState({ saving: true, error: '' }); try { await setTaskGearReward({ db, user, id: task.id, coins: Number(coins), expectedCoins: task.gearReward || 0, seasonId }); setEditing(false); setState({ saving: false, error: '' }); } catch (error) { setState({ saving: false, error: error.message }); } }}>
      <label className="block text-amber-100">Gears por participante<input aria-label={`Gears da tarefa: ${task.text}`} type="number" min="0" max={GEAR_GRANT_MAX} step="1" required value={coins} disabled={state.saving} onChange={(event) => setCoins(event.target.value)} className="mt-1 w-full rounded-lg border border-white/20 bg-black/30 p-2 text-white" /></label><p className="text-slate-400">Cada participante cadastrado recebe o valor uma vez, quando você aprovar. Use 0 para deixar sem recompensa.</p><div className="flex gap-2"><button type="submit" disabled={state.saving} className="rounded-lg bg-amber-200 px-2 py-1.5 font-bold text-slate-950">{state.saving ? 'Salvando…' : 'Salvar Gears'}</button><button type="button" disabled={state.saving} onClick={() => setEditing(false)} className="text-slate-300">Cancelar</button></div>{state.error && <p role="alert" className="text-rose-200">{state.error}</p>}
    </form> : <button type="button" onClick={() => setEditing(true)} className="mt-1 text-amber-200 underline decoration-amber-200/40 underline-offset-2">{task.gearReward ? 'Alterar Gears' : 'Definir Gears'}</button>)}
    {paid && <p className="mt-1 text-slate-400">Reabrir esta tarefa não gera outro crédito.</p>}
  </div>;
}
