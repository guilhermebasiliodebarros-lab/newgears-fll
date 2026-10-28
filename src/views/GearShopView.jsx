import { useCallback, useRef, useState } from 'react';
import { Check, Cog, Coins, Gift, Layers3, LockKeyhole, Music2, Play, RefreshCw, ShoppingBag, Sparkles, Trophy, Users, Wrench } from 'lucide-react';
import useGearShopContext from '../hooks/useGearShopContext';
import GearMascot, { GearAvatar } from '../components/GearMascot';
import GearEvolutionPanel from '../components/GearEvolutionPanel';
import GearHistoryPanel from '../components/GearHistoryPanel';
import GearWorkshop, { GearWorkshopScene } from '../components/GearWorkshop';
import GearCelebration from '../components/GearCelebration';
import GearWorkshopGallery from '../components/GearWorkshopGallery';
import GearCollectionCard from '../components/GearCollectionCard';
import { gearEvolution } from '../utils/gearEvolution';
import { GEAR_CONTRIBUTIONS, GEAR_SHOP_CATEGORIES, GEAR_SHOP_COLLECTIONS, GEAR_SHOP_ITEMS, GEAR_WORKSHOP_CATEGORIES, gearCollectionItems, gearItem, WELCOME_GEARS } from '../utils/gearShop';

function ItemArt({ item, equipment }) {
  if (GEAR_WORKSHOP_CATEGORIES.includes(item.category)) return <GearWorkshopScene equipment={equipment} compact still />;
  if (item.category === 'title') return <div className="gear-shop__title-sample"><Sparkles size={22} /><span>{item.name}</span></div>;
  if (item.category === 'animation') {
    const Icon = item.variant === 'stage' ? Music2 : item.variant === 'trophy' ? Trophy : item.variant === 'gears' ? Cog : Sparkles;
    return <div className="giro-animation-emblem"><Icon /><small><Play size={11} />Experimente no provador</small></div>;
  }
  return <GearMascot equipment={equipment} decorative still />;
}

export default function GearShopView() {
  const { account, loading, walletError, reloadWallet, student, isStudent, pending, retrying, retryPending, busy, operationError, activateItem, workshop, workshopLoading, workshopError, workshopSaving, saveWorkshop } = useGearShopContext();
  const [tab, setTab] = useState('workshop');
  const [category, setCategory] = useState('all');
  const [collection, setCollection] = useState('all');
  const [onlyOwned, setOnlyOwned] = useState(false);
  const [previewId, setPreviewId] = useState('room-orbit');
  const [previewEffect, setPreviewEffect] = useState(null);
  const previewRef = useRef(null);
  const finishPreview = useCallback(() => setPreviewEffect(null), []);
  const preview = gearItem(previewId);
  const equipment = { ...account.equipped, [preview.category]: preview.id };
  const owned = account.owned.includes(preview.id);
  const equipped = account.equipped[preview.category] === preview.id;
  const canAfford = account.balance >= preview.price;
  const collectionIds = collection === 'all' ? null : gearCollectionItems(collection).map((item) => item.id);
  const items = GEAR_SHOP_ITEMS.filter((item) => (category === 'all' || item.category === category) && (!collectionIds || collectionIds.includes(item.id)) && (!onlyOwned || account.owned.includes(item.id)));
  const evolution = gearEvolution(account);
  const browse = (nextCategory = 'all', nextCollection = 'all') => {
    setTab('catalog'); setCategory(nextCategory); setCollection(nextCollection); setPreviewEffect(null);
    const ids = nextCollection === 'all' ? null : gearCollectionItems(nextCollection).map((item) => item.id);
    const matches = GEAR_SHOP_ITEMS.filter((item) => (nextCategory === 'all' || item.category === nextCategory) && (!ids || ids.includes(item.id)) && (!onlyOwned || account.owned.includes(item.id)));
    const first = matches.find((item) => item.price > 0) || matches[0];
    if (first) setPreviewId(first.id);
  };
  const selectPreview = (id) => {
    setPreviewId(id); setPreviewEffect(null);
    if (previewRef.current && getComputedStyle(previewRef.current).position !== 'sticky') {
      requestAnimationFrame(() => previewRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' }));
    }
  };
  const playPreview = (full = false) => setPreviewEffect({ id: crypto.randomUUID(), full });
  const previewMood = previewEffect && gearItem(equipment.animation).variant === 'stage' ? 'stage' : previewEffect ? 'celebrate' : '';

  return <div className="gear-shop space-y-5">
    <section className="gear-shop__hero">
      <div className="relative z-10 max-w-xl">
        <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-200"><ShoppingBag size={14} />Universo do Giro</p>
        <h2 className="mt-4 text-4xl font-black leading-[1.05] text-white md:text-5xl">Seu cantinho.<br /><span className="gear-shop__gradient-text">Seu jeito de girar.</span></h2>
        <p className="mt-5 max-w-md text-sm leading-relaxed text-slate-300">Monte a oficina do Giro, descubra coleções e escolha como comemorar suas conquistas. Cada contribuição da equipe abre novas possibilidades.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <div className="gear-shop__wallet" aria-label={`Saldo de ${account.balance} Gears`}><Coins size={24} className="text-amber-200" /><div><p className="text-[9px] font-bold uppercase tracking-[0.15em] text-amber-100/65">Seus Gears</p><p className="text-3xl font-black text-amber-100">{loading ? '…' : walletError ? '—' : account.balance}</p></div></div>
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"><p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">Sua coleção</p><p className="mt-1 text-2xl font-black text-white">{account.owned.length}<span className="ml-1 text-xs font-normal text-slate-400">itens</span></p></div>
        </div>
        <p className="mt-4 flex items-center gap-2 text-xs text-slate-400"><Gift size={14} className="shrink-0 text-cyan-200" />A oficina inicial já é sua. Você também começa com {WELCOME_GEARS} Gears de boas-vindas.</p>
      </div>
      <div className="gear-shop__hero-mascot"><div className="gear-shop__orbit-label">GIRO · NÍVEL {evolution.level}</div><GearMascot equipment={account.equipped} level={evolution.level} expression={workshop.expression} /><p className="text-center text-xs font-bold text-cyan-100">{gearItem(account.equipped.title).name}</p></div>
    </section>

    {!isStudent && <p className="rounded-2xl border border-cyan-300/20 bg-cyan-300/5 p-4 text-sm text-cyan-100">Esta é a prévia da oficina e da loja. Os alunos compram e equipam os itens ao entrar no próprio perfil.</p>}
    {walletError && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-300/25 bg-rose-300/10 p-4 text-xs text-rose-100"><p>{walletError}</p><button type="button" onClick={reloadWallet} className="inline-flex items-center gap-2 font-bold"><RefreshCw size={14} />Tentar carregar carteira</button></div>}
    {pending.length > 0 && <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/5 p-4"><div><h3 className="text-sm font-black text-amber-100">{pending.length} contribuição(ões) com Gears pendentes</h3><p className="mt-1 text-xs text-slate-300">Seus registros já estão salvos. Tente confirmar os Gears sem cadastrar tudo outra vez.</p></div><button type="button" disabled={retrying} onClick={retryPending} className="rounded-xl bg-amber-300 px-4 py-2.5 text-xs font-black text-black disabled:opacity-50">{retrying ? 'Conferindo…' : 'Tentar receber Gears'}</button></section>}

    <div className="giro-studio-tabs" aria-label="Áreas da loja do Giro">
      {[{ id: 'workshop', label: 'Minha oficina', icon: <Wrench size={17} /> }, { id: 'catalog', label: 'Loja', icon: <ShoppingBag size={17} /> }, { id: 'collections', label: 'Coleções', icon: <Layers3 size={17} /> }, { id: 'team', label: 'Visitar oficinas', icon: <Users size={17} /> }].map(({ id, label, icon }) => <button type="button" key={id} aria-pressed={tab === id} onClick={() => { setTab(id); setPreviewEffect(null); }}>{icon}{label}</button>)}
    </div>

    {tab === 'workshop' && <GearWorkshop account={account} student={student} level={evolution.level} onCustomize={(category) => browse(category)} onCollections={() => setTab('collections')} workshop={workshop} onSave={saveWorkshop} saving={workshopSaving} loading={workshopLoading} error={workshopError} canSave={isStudent} walletReady={!loading && !walletError} />}
    {tab === 'team' && <GearWorkshopGallery />}

    {tab === 'collections' && <section>
      <div className="giro-studio-heading"><div><p className="giro-studio-eyebrow"><Layers3 size={14} />Coleções temáticas</p><h2>Cinco mundos. Cinco novas interações.</h2><p>Complete os conjuntos para liberar os bônus do Giro. As peças já compradas contam e você pode continuar misturando seus estilos favoritos.</p></div></div>
      <div className="giro-collections">{GEAR_SHOP_COLLECTIONS.map((entry) => <GearCollectionCard key={entry.id} collection={entry} owned={account.owned} ready={!loading && !walletError} onExplore={(itemId) => { setOnlyOwned(false); browse('all', entry.id); setPreviewId(itemId || gearCollectionItems(entry.id)[0].id); }} />)}</div>
    </section>}

    {tab === 'catalog' && <div className="giro-store-layout">
      <aside ref={previewRef} className="giro-store-preview" aria-label="Provador do Giro">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Provador do Giro</p><h3 className="mt-2 text-xl font-black text-white">{preview.name}</h3>
        <div className="giro-store-preview__art">
          {GEAR_WORKSHOP_CATEGORIES.includes(preview.category) || preview.category === 'animation' ? <GearWorkshopScene equipment={equipment} action={previewMood} animationKey={previewEffect?.id} compact /> : <GearMascot equipment={equipment} mood="wave" />}
          {previewEffect && <GearCelebration key={previewEffect.id} equipment={equipment} compact={!previewEffect.full} onComplete={finishPreview} />}
        </div>
        {preview.category === 'animation' && <div className="flex flex-wrap gap-2 mb-4"><button type="button" onClick={() => playPreview()} className="giro-studio-button flex-1"><Play size={14} />Experimentar</button><button type="button" onClick={() => playPreview(true)} className="giro-studio-button flex-1">Ver na tela</button></div>}
        <div className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-3"><GearAvatar student={student} equipment={equipment} className="h-12 w-12 shrink-0" /><div className="min-w-0"><p className="truncate text-sm font-black text-white">{student?.name || 'Seu perfil'}</p><p className="mt-1 text-[10px] font-bold text-cyan-200">{gearItem(equipment.title).name}</p></div></div>
        <p className="mt-4 text-xs leading-relaxed text-slate-400">{preview.description}</p>
        {preview.category === 'animation' && <p className="mt-3 text-[11px] leading-relaxed text-cyan-100">Quando equipada, esta comemoração acompanha seus novos Gears confirmados. Você também pode acioná-la na conversa com o Giro.</p>}
        {operationError && <p role="alert" className="mt-4 rounded-xl border border-rose-300/25 bg-rose-300/10 p-3 text-xs leading-relaxed text-rose-100">{operationError}</p>}
        {!owned && <p className="mt-4 flex items-center justify-between gap-2 text-xs text-slate-300"><span>Saldo após desbloquear</span><span className={canAfford ? 'font-black text-amber-100' : 'font-bold text-rose-200'}>{canAfford ? `${account.balance - preview.price} Gears` : `Faltam ${preview.price - account.balance} Gears`}</span></p>}
        <button type="button" disabled={!isStudent || loading || Boolean(walletError) || Boolean(busy) || equipped || (!owned && !canAfford)} onClick={() => activateItem(preview.id, !owned)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40">{busy === preview.id ? 'Confirmando…' : equipped ? <><Check size={16} />Em uso</> : owned ? 'Equipar item' : <><Coins size={16} />Comprar e usar · {preview.price}</>}</button>
        <p className="mt-3 text-center text-[10px] leading-relaxed text-slate-500">Experimentar é grátis. Seu perfil só muda ao comprar ou equipar.</p>
      </aside>
      <section className="giro-store-catalog min-w-0 space-y-4">
        <div className="flex flex-wrap gap-2" aria-label="Categorias da loja">{GEAR_SHOP_CATEGORIES.map((item) => <button key={item.id} type="button" aria-pressed={category === item.id} onClick={() => browse(item.id, collection)} className={`rounded-xl border px-3 py-2.5 text-xs font-bold ${category === item.id ? 'border-cyan-200/50 bg-cyan-300/15 text-cyan-100' : 'border-white/10 bg-white/[0.03] text-slate-400 hover:text-white'}`}>{item.label}</button>)}</div>
        <div className="flex flex-wrap items-center justify-between gap-3"><select aria-label="Filtrar coleção" value={collection} onChange={(event) => browse(category, event.target.value)} className="min-w-0 rounded-xl border border-white/15 bg-[#111c2e] px-3 py-2 text-xs text-slate-200"><option value="all">Todas as coleções</option>{GEAR_SHOP_COLLECTIONS.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}</select><label className="flex items-center gap-2 text-xs text-slate-300"><input type="checkbox" checked={onlyOwned} onChange={(event) => { const checked = event.target.checked; setOnlyOwned(checked); if (checked) { const first = items.find((item) => account.owned.includes(item.id)); if (first) selectPreview(first.id); } }} />Minha coleção</label></div>
        <div className="giro-store-grid">{items.map((item) => {
          const isOwned = account.owned.includes(item.id);
          const isEquipped = account.equipped[item.category] === item.id;
          return <button key={item.id} type="button" aria-label={`Ver ${item.name}`} aria-pressed={previewId === item.id} onClick={() => selectPreview(item.id)} className={`gear-shop__card ${previewId === item.id ? 'gear-shop__card--selected' : ''}`}>
            <div className="flex items-center justify-between gap-2"><span className={`gear-shop__rarity gear-shop__rarity--${item.rarity === 'Épica' ? 'epic' : item.rarity === 'Rara' ? 'rare' : 'base'}`}>{item.rarity}</span>{isEquipped ? <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-200"><Check size={12} />Em uso</span> : isOwned ? <span className="text-[10px] font-bold text-cyan-100">Na coleção</span> : <LockKeyhole size={13} className="text-slate-500" />}</div>
            <div className="giro-store-card-art"><ItemArt item={item} equipment={{ ...account.equipped, [item.category]: item.id }} /></div>
            <h3 className="text-sm font-black text-white">{item.name}</h3><p className="mt-1 min-h-[34px] text-[11px] leading-relaxed text-slate-400">{item.description}</p><div className="mt-4 flex items-center justify-between gap-2 border-t border-white/5 pt-3"><span className="text-[10px] font-bold text-slate-500">{GEAR_SHOP_CATEGORIES.find((entry) => entry.id === item.category)?.label}</span><span className="inline-flex items-center gap-1.5 text-xs font-black text-amber-100">{item.price ? <><Coins size={13} />{item.price}</> : 'Incluído'}</span></div>
          </button>;
        })}</div>
        {!items.length && <p className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-slate-400">Nenhum item neste filtro. Experimente outra categoria ou desmarque Minha coleção.</p>}
      </section>
    </div>}

    <GearEvolutionPanel />
    <GearHistoryPanel />
    <section className="rounded-[26px] border border-white/10 bg-[#111722] p-5 md:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-xl font-black text-white">Como conquistar Gears</h3><p className="mt-2 text-xs leading-relaxed text-slate-400">Novos registros no seu nome rendem Gears depois de salvos. Editar ou reenviar o mesmo registro não gera outra recompensa.</p></div>{isStudent && <p className="rounded-xl bg-amber-300/10 px-4 py-3 text-xs font-bold text-amber-100">Gears sem limite diário</p>}</div><div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">{Object.entries(GEAR_CONTRIBUTIONS).map(([id, rule]) => <div key={id} className="rounded-xl border border-white/5 bg-white/[0.025] p-3"><p className="text-xs font-bold text-white">{rule.label}</p><p className="mt-2 text-sm font-black text-amber-100">+{rule.coins} Gears</p><p className="mt-1 text-[10px] text-slate-500">Por registro confirmado</p></div>)}</div><p className="mt-4 text-[11px] leading-relaxed text-slate-500">Cada contribuição válida recebe o valor completo uma única vez. Check-ins repetidos da mesma pessoa e data não geram outro crédito. Gears são virtuais: compras e personalizações não alteram sua nota, seu XP ou sua classificação.</p></section>
  </div>;
}
