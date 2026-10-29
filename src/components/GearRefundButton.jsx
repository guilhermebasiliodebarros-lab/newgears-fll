import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import useGearShopContext from '../hooks/useGearShopContext';
import { GEAR_REFUND_LIMIT } from '../services/gearShop';

export default function GearRefundButton({ item }) {
  const { account, isStudent, loading, walletError, busy, refundItem } = useGearShopContext();
  const [confirming, setConfirming] = useState(false);
  const remaining = Math.max(0, GEAR_REFUND_LIMIT - (account.refundCount || 0));
  if (!isStudent || !item.price || !account.owned.includes(item.id) || !account.refundableItems?.includes(item.id)) return null;
  return <div className="mt-4 rounded-xl border border-amber-200/20 bg-amber-200/5 p-3 text-xs text-amber-100">
    <p className="leading-relaxed">{remaining ? `${remaining} de ${GEAR_REFUND_LIMIT} reembolsos disponíveis.` : 'Você já usou os três reembolsos disponíveis.'}</p>
    {confirming && remaining > 0 ? <><p className="mt-2 leading-relaxed">Devolver <strong>{item.name}</strong> por <strong>{item.price} Gears</strong>? O item sai da sua coleção e, se estiver em uso, será substituído pelo inicial. Isso usa 1 reembolso.</p><div className="mt-3 flex flex-wrap gap-2"><button type="button" disabled={Boolean(busy)} onClick={async () => { if (await refundItem(item.id)) setConfirming(false); }} className="rounded-lg bg-amber-200 px-3 py-2 font-bold text-slate-950 disabled:opacity-40">{busy === `refund:${item.id}` ? 'Reembolsando…' : 'Confirmar reembolso'}</button><button type="button" disabled={Boolean(busy)} onClick={() => setConfirming(false)} className="px-3 py-2">Cancelar</button></div></> : <button type="button" disabled={!remaining || loading || Boolean(walletError) || Boolean(busy)} onClick={() => setConfirming(true)} className="mt-2 inline-flex items-center gap-2 rounded-lg border border-amber-200/30 px-3 py-2 font-bold disabled:opacity-40"><RotateCcw size={14} />Reembolsar item · {item.price} Gears</button>}
  </div>;
}
