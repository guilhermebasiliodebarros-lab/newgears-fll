import { Check, Coins, Heart, Target, Trash2 } from 'lucide-react';
import { wishlistProgress } from '../utils/shopWishlist';

export default function GearWishlist({ wishlist, account, onPreview }) {
  const { items, pending, total, missing } = wishlistProgress(wishlist.ids, account);
  const goal = pending[0];
  const progress = goal ? Math.min(100, Math.floor(Math.max(0, account.balance) / goal.price * 100)) : 100;
  return <section className="ng-panel space-y-5" aria-label="Lista de desejos do Giro">
    <div className="ng-section-header"><div><p className="ng-eyebrow"><Heart size={14} />Seus próximos objetivos</p><h2>Lista de desejos</h2><p>Guarde os itens que você quer conquistar. Seus desejos ficam salvos neste navegador para o seu perfil.</p></div><Heart size={26} className="text-pink-200" /></div>
    {wishlist.error && <p role="status" className="ng-error">{wishlist.error}</p>}
    {goal && <div className="giro-wishlist-goal"><div className="ng-toolbar"><div><p className="ng-eyebrow"><Target size={14} />Objetivo atual</p><h3>{goal.name}</h3></div><span className="ng-badge">{goal.price} Gears</span></div><div role="progressbar" aria-label={`Progresso para ${goal.name}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} className="giro-wishlist-progress"><span style={{ width: `${progress}%` }} /></div><p>{account.balance >= goal.price ? 'Você já tem Gears suficientes para este objetivo.' : `Faltam ${goal.price - account.balance} Gears para conquistar este item.`}</p></div>}
    {items.length > 0 && <p className="text-xs leading-relaxed text-slate-400">{pending.length} desejo(s) para conquistar · {total} Gears no total{missing > 0 ? ` · faltam ${missing} Gears para todos` : pending.length ? ' · seu saldo já cobre todos' : ' · todos já estão na sua coleção'}.</p>}
    {!items.length ? <div className="ng-empty"><Heart size={30} /><h3>O próximo estilo começa com um desejo</h3><p>Na loja, use o coração dos itens ou guarde um conjunto pelo provador.</p></div> : <div className="giro-wishlist-list">{items.map((item) => {
      const owned = account.owned.includes(item.id);
      return <article key={item.id}><div className="min-w-0"><h3>{item.name}</h3><p>{owned ? 'Já está na sua coleção' : account.balance >= item.price ? 'Seu saldo já permite comprar' : `Faltam ${item.price - account.balance} Gears`}</p></div><span className="inline-flex items-center gap-1 text-xs font-bold text-amber-100">{owned ? <Check size={14} /> : <Coins size={14} />}{item.price}</span><div className="flex flex-wrap gap-2"><button type="button" className="ng-button ng-button--secondary" onClick={() => onPreview(item.id)}>Experimentar</button>{!owned && goal?.id !== item.id && <button type="button" className="ng-button ng-button--secondary" onClick={() => wishlist.prioritize(item.id)}>Meu objetivo</button>}<button type="button" className="ng-button ng-button--secondary" aria-label={`Retirar ${item.name} dos desejos`} onClick={() => wishlist.toggle(item.id)}><Trash2 size={14} /></button></div></article>;
    })}</div>}
  </section>;
}
