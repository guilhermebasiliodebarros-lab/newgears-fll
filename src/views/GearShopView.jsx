import { memo, useCallback, useRef, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Cog, Coins, Gift, Heart, Layers3, LockKeyhole, Music2, Play, RefreshCw, RotateCcw, ShoppingBag, Sparkles, Trophy, Users, Wrench, X } from 'lucide-react';
import useGearShopContext from '../hooks/useGearShopContext';
import GearMascot, { GearAvatar } from '../components/GearMascot';
import GearEvolutionPanel from '../components/GearEvolutionPanel';
import GearHistoryPanel from '../components/GearHistoryPanel';
import GearWorkshop, { GearWorkshopScene } from '../components/GearWorkshop';
import GearCelebration from '../components/GearCelebration';
import GearWorkshopGallery from '../components/GearWorkshopGallery';
import GearCollectionCard from '../components/GearCollectionCard';
import GearRefundButton from '../components/GearRefundButton';
import GearTaskRewards from '../components/GearTaskRewards';
import GearWishlist from '../components/GearWishlist';
import useGearWishlist from '../hooks/useGearWishlist';
import { tryOnEquipment } from '../utils/shopWishlist';
import { gearEvolution } from '../utils/gearEvolution';
import { applyGearItem, equippedGearAccessories, gearEquipmentItems, GEAR_CONTRIBUTIONS, GEAR_SHOP_CATEGORIES, GEAR_SHOP_COLLECTIONS, GEAR_SHOP_ITEMS, GEAR_WORKSHOP_CATEGORIES, gearCollectionItems, gearItem, isGearItemEquipped, WELCOME_GEARS } from '../utils/gearShop';

const ItemArt = memo(function ItemArt({ item, equipment }) {
  if (GEAR_WORKSHOP_CATEGORIES.includes(item.category)) return <GearWorkshopScene equipment={equipment} compact still />;
  if (item.category === 'title') return <div className="gear-shop__title-sample"><Sparkles size={22} /><span>{item.name}</span></div>;
  if (item.category === 'animation') {
    const Icon = item.variant === 'stage' ? Music2 : item.variant === 'trophy' ? Trophy : item.variant === 'gears' ? Cog : Sparkles;
    return <div className="giro-animation-emblem"><Icon /><small><Play size={11} />Experimente no provador</small></div>;
  }
  return <GearMascot equipment={equipment} decorative still />;
}, (previous, next) => previous.item === next.item && JSON.stringify(previous.equipment) === JSON.stringify(next.equipment));

export default function GearShopView() {
  const { account, user, technicianMode, loading, walletError, reloadWallet, student, isStudent, pending, retrying, retryPending, busy, operationError, activateItem, workshop, workshopLoading, workshopError, workshopSaving, saveWorkshop } = useGearShopContext();
  const canCustomize = isStudent || technicianMode;
  const [tab, setTab] = useState('workshop');
  const [category, setCategory] = useState('all');
  const [collection, setCollection] = useState('all');
  const [onlyOwned, setOnlyOwned] = useState(false);
  const [previewId, setPreviewId] = useState(null);
  const [tryOnChanges, setTryOnChanges] = useState({});
  const [page, setPage] = useState(1);
  const wishlist = useGearWishlist(user);
  const [previewEffect, setPreviewEffect] = useState(null);
  const previewRef = useRef(null);
  const catalogRef = useRef(null);
  const finishPreview = useCallback(() => setPreviewEffect(null), []);
  const preview = gearItem(previewId) || gearItem(account.equipped.room);
  const equipment = tryOnEquipment(account.equipped, tryOnChanges);
  const stagedItems = gearEquipmentItems(equipment).filter((item) => !isGearItemEquipped(account.equipped, item.id));
  const unownedStaged = stagedItems.filter((item) => !account.owned.includes(item.id));
  const owned = account.owned.includes(preview.id);
  const equipped = isGearItemEquipped(account.equipped, preview.id);
  const removable = equipped && preview.category === 'accessory' && preview.id !== 'accessory-none';
  const wornAccessories = equippedGearAccessories(account.equipped).map(gearItem);
  const previewAccessories = equippedGearAccessories(equipment).map(gearItem);
  const canAfford = account.balance >= preview.price;
  const collectionIds = collection === 'all' ? null : gearCollectionItems(collection).map((item) => item.id);
  const items = GEAR_SHOP_ITEMS.filter((item) => (category === 'all' || item.category === category) && (!collectionIds || collectionIds.includes(item.id)) && (!onlyOwned || account.owned.includes(item.id)));
  const pageCount = Math.max(1, Math.ceil(items.length / 12));
  const currentPage = Math.min(page, pageCount);
  const visibleItems = items.slice((currentPage - 1) * 12, currentPage * 12);
  const evolution = gearEvolution(account);
  const stagePreviewItem = (id, remove = false) => {
    const item = gearItem(id);
    setTryOnChanges((current) => {
      if (item.category !== 'accessory') return { ...current, [item.category]: id };
      const next = applyGearItem(tryOnEquipment(account.equipped, current), id, { remove });
      return { ...current, accessory: next.accessory, accessories: equippedGearAccessories(next) };
    });
  };
  const browse = (nextCategory = 'all', nextCollection = 'all') => {
    setTab('catalog'); setCategory(nextCategory); setCollection(nextCollection); setPreviewEffect(null); setPage(1);
    const ids = nextCollection === 'all' ? null : gearCollectionItems(nextCollection).map((item) => item.id);
    const matches = GEAR_SHOP_ITEMS.filter((item) => (nextCategory === 'all' || item.category === nextCategory) && (!ids || ids.includes(item.id)) && (!onlyOwned || account.owned.includes(item.id)));
    const first = matches.find((item) => item.price > 0) || matches[0];
    if (first) { setPreviewId(first.category === 'accessory' ? null : first.id); if (first.category !== 'accessory') stagePreviewItem(first.id); }
  };
  const selectPreview = (id) => {
    const item = gearItem(id);
    if (!item) return;
    setPreviewId(id); setPreviewEffect(null); setTab('catalog');
    stagePreviewItem(id);
    requestAnimationFrame(() => { if (previewRef.current && getComputedStyle(previewRef.current).position !== 'sticky') previewRef.current.scrollIntoView({ block: 'start', behavior: 'instant' }); });
  };
  const changePage = (value) => { setPage(value); requestAnimationFrame(() => catalogRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' })); };
  const playPreview = (full = false) => setPreviewEffect({ id: crypto.randomUUID(), full });
  const previewMood = previewEffect && gearItem(equipment.animation).variant === 'stage' ? 'stage' : previewEffect ? 'celebrate' : '';
  const activatePreview = async () => {
    if (await activateItem(preview.id, !owned)) {
      if (removable) stagePreviewItem(preview.id, true);
    }
  };

  return <div className="gear-shop space-y-5">
    <section className="gear-shop__hero">
      <div className="relative z-10 max-w-xl">
        <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-200"><ShoppingBag size={14} />Universo do Giro</p>
        <h2 className="mt-4 text-4xl font-black leading-[1.05] text-white md:text-5xl">Seu cantinho.<br /><span className="gear-shop__gradient-text">Seu jeito de girar.</span></h2>
        <p className="mt-5 max-w-md text-sm leading-relaxed text-slate-300">Monte a oficina do Giro, descubra coleções e escolha como comemorar suas conquistas. Cada contribuição da equipe abre novas possibilidades.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <div className="gear-shop__wallet" aria-label={technicianMode ? 'Gears ilimitados para o técnico' : `Saldo de ${account.balance} Gears`}><Coins size={24} className="text-amber-200" /><div><p className="text-[9px] font-bold uppercase tracking-[0.15em] text-amber-100/65">{technicianMode ? 'Gears do técnico' : 'Seus Gears'}</p><p className="text-3xl font-black text-amber-100">{technicianMode ? '∞' : loading ? '…' : walletError ? '—' : account.balance}</p></div></div>
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"><p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">Sua coleção</p><p className="mt-1 text-2xl font-black text-white">{account.owned.length}<span className="ml-1 text-xs font-normal text-slate-400">itens</span></p></div>
        </div>
        <p className="mt-4 flex items-center gap-2 text-xs text-slate-400"><Gift size={14} className="shrink-0 text-cyan-200" />{technicianMode ? 'Experimente qualquer item e comemoração com Gears ilimitados.' : <>A oficina inicial já é sua. Você também começa com {WELCOME_GEARS} Gears de boas-vindas.</>}</p>
      </div>
      <div className="gear-shop__hero-mascot"><div className="gear-shop__orbit-label">GIRO · NÍVEL {evolution.level}</div><GearMascot equipment={account.equipped} level={evolution.level} expression={workshop.expression} /><p className="text-center text-xs font-bold text-cyan-100">{gearItem(account.equipped.title).name}</p></div>
    </section>

    {!isStudent && <p className="rounded-2xl border border-cyan-300/20 bg-cyan-300/5 p-4 text-sm text-cyan-100">{technicianMode ? 'Gears ∞ para o técnico: todos os itens, níveis e interações estão liberados para testar. Suas escolhas ficam salvas neste navegador.' : 'Esta é a prévia da oficina e da loja. Os alunos compram e equipam os itens ao entrar no próprio perfil.'}</p>}
    {walletError && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-300/25 bg-rose-300/10 p-4 text-xs text-rose-100"><p>{walletError}</p><button type="button" onClick={reloadWallet} className="inline-flex items-center gap-2 font-bold"><RefreshCw size={14} />Tentar carregar carteira</button></div>}
    {pending.length > 0 && <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/5 p-4"><div><h3 className="text-sm font-black text-amber-100">{pending.length} contribuição(ões) com Gears pendentes</h3><p className="mt-1 text-xs text-slate-300">Seus registros já estão salvos. Tente confirmar os Gears sem cadastrar tudo outra vez.</p></div><button type="button" disabled={retrying} onClick={retryPending} className="rounded-xl bg-amber-300 px-4 py-2.5 text-xs font-black text-black disabled:opacity-50">{retrying ? 'Conferindo…' : 'Tentar receber Gears'}</button></section>}

    <GearTaskRewards />
    <div className="giro-studio-tabs" aria-label="Áreas da loja do Giro">
      {[{ id: 'workshop', label: 'Minha oficina', icon: <Wrench size={17} /> }, { id: 'catalog', label: 'Loja', icon: <ShoppingBag size={17} /> }, { id: 'wishlist', label: 'Desejos', icon: <Heart size={17} /> }, { id: 'collections', label: 'Coleções', icon: <Layers3 size={17} /> }, { id: 'team', label: 'Visitar oficinas', icon: <Users size={17} /> }].map(({ id, label, icon }) => <button type="button" key={id} aria-pressed={tab === id} onClick={() => { setTab(id); setPreviewEffect(null); }}>{icon}{label}</button>)}
    </div>

    {tab === 'workshop' && <><GearWorkshop account={account} student={student} level={evolution.level} onCustomize={(category) => browse(category)} onCollections={() => setTab('collections')} workshop={workshop} onSave={saveWorkshop} saving={workshopSaving} loading={workshopLoading} error={workshopError} canSave={canCustomize} technicianMode={technicianMode} walletReady={!loading && !walletError} /><section className="ng-panel space-y-4" aria-label="Acessórios equipados"><div><p className="ng-eyebrow">Seu estilo</p><h3 className="mt-2 text-lg font-black text-white">Combine seus acessórios</h3><p className="mt-2 text-sm text-slate-400">Use coroa, óculos, medalha e outros acessórios juntos. Retire cada um quando quiser.</p></div><div className="flex flex-wrap gap-2">{wornAccessories.map((item) => <button type="button" key={item.id} className="ng-button ng-button--secondary" disabled={!canCustomize || loading || Boolean(walletError) || Boolean(busy)} aria-label={`Retirar ${item.name}`} onClick={() => activateItem(item.id, false)}>{item.name}<RotateCcw size={13} /></button>)}{!wornAccessories.length && <p className="text-xs text-slate-400">Nenhum acessório equipado.</p>}<button type="button" className="ng-button ng-button--primary" onClick={() => browse('accessory')}>Escolher acessórios</button></div>{operationError && <p role="alert" className="ng-error">{operationError}</p>}</section></>}
    {tab === 'team' && <GearWorkshopGallery />}
    {tab === 'wishlist' && <GearWishlist wishlist={wishlist} account={account} onPreview={selectPreview} />}

    {tab === 'collections' && <section>
      <div className="giro-studio-heading"><div><p className="giro-studio-eyebrow"><Layers3 size={14} />Coleções temáticas</p><h2>Coleções para explorar com o Giro.</h2><p>Complete os conjuntos para liberar os bônus do Giro. As peças já compradas contam e você pode continuar misturando seus estilos favoritos.</p></div></div>
      <div className="giro-collections">{GEAR_SHOP_COLLECTIONS.map((entry) => <GearCollectionCard key={entry.id} collection={entry} owned={account.owned} ready={!loading && !walletError} onExplore={(itemId) => { setOnlyOwned(false); browse('all', entry.id); setPreviewId(itemId || gearCollectionItems(entry.id)[0].id); setTryOnChanges({ ...entry.equipment, accessories: equippedGearAccessories(entry.equipment) }); }} />)}</div>
    </section>}

    {tab === 'catalog' && <div className="giro-store-layout">
      <aside ref={previewRef} className="giro-store-preview" aria-label="Provador do Giro">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Provador do Giro</p><h3 className="mt-2 text-xl font-black text-white">{preview.name}</h3>
        <p className="mt-2 text-xs leading-relaxed text-cyan-100">Combine peças de várias categorias e vários acessórios. O conjunto em teste aparece completo aqui.</p>
        <div className="giro-store-preview__art">
          <GearWorkshopScene equipment={equipment} level={evolution.level} expression={workshop.expression} action={previewMood} animationKey={previewEffect?.id} compact />
          {previewEffect && <GearCelebration key={previewEffect.id} equipment={equipment} compact={!previewEffect.full} onComplete={finishPreview} />}
        </div>
        {preview.category === 'animation' && <div className="flex flex-wrap gap-2 mb-4"><button type="button" onClick={() => playPreview()} className="giro-studio-button flex-1"><Play size={14} />Experimentar</button><button type="button" onClick={() => playPreview(true)} className="giro-studio-button flex-1">Ver na tela</button></div>}
        <div className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-3"><GearAvatar student={student} equipment={equipment} className="h-12 w-12 shrink-0" /><div className="min-w-0"><p className="truncate text-sm font-black text-white">{student?.name || 'Seu perfil'}</p><p className="mt-1 text-[10px] font-bold text-cyan-200">{gearItem(equipment.title).name}</p></div></div>
        <p className="mt-4 text-xs leading-relaxed text-slate-400">{preview.description}</p>
        {stagedItems.length > 0 && <div className="giro-tryon-summary"><p className="ng-eyebrow">Conjunto em teste · {stagedItems.length} peça(s)</p><div className="mt-3 flex flex-wrap gap-2">{stagedItems.map((item) => <span key={item.id}>{item.name}</span>)}</div><div className="mt-3 flex flex-wrap gap-2"><button type="button" className="ng-button ng-button--secondary" onClick={() => { setTryOnChanges({}); setPreviewId(null); setPreviewEffect(null); }}><RotateCcw size={13} />Voltar ao meu Giro</button>{canCustomize && unownedStaged.length > 0 && <button type="button" className="ng-button ng-button--secondary" onClick={() => wishlist.add(unownedStaged.map((item) => item.id))}><Heart size={13} />Guardar conjunto nos desejos</button>}</div></div>}
        {previewAccessories.length > 0 && <div className="mt-4"><p className="ng-eyebrow">Acessórios no provador</p><div className="mt-2 flex flex-wrap gap-2">{previewAccessories.map((item) => <button type="button" key={item.id} className="ng-button ng-button--secondary" aria-label={`Retirar ${item.name} do provador`} onClick={() => stagePreviewItem(item.id, true)}>{item.name}<X size={13} /></button>)}</div></div>}
        {wishlist.error && <p role="status" className="ng-error mt-3">{wishlist.error}</p>}
        {canCustomize && preview.price > 0 && <button type="button" className="ng-button ng-button--secondary mt-3 w-full" aria-pressed={wishlist.ids.includes(preview.id)} onClick={() => wishlist.toggle(preview.id)}><Heart size={14} fill={wishlist.ids.includes(preview.id) ? 'currentColor' : 'none'} />{wishlist.ids.includes(preview.id) ? 'Retirar dos desejos' : 'Guardar nos desejos'}</button>}
        {preview.category === 'animation' && <p className="mt-3 text-[11px] leading-relaxed text-cyan-100">Quando equipada, esta comemoração acompanha seus novos Gears confirmados. Você também pode acioná-la na conversa com o Giro.</p>}
        {operationError && <p role="alert" className="mt-4 rounded-xl border border-rose-300/25 bg-rose-300/10 p-3 text-xs leading-relaxed text-rose-100">{operationError}</p>}
        {!owned && <p className="mt-4 flex items-center justify-between gap-2 text-xs text-slate-300"><span>Saldo após desbloquear</span><span className={canAfford ? 'font-black text-amber-100' : 'font-bold text-rose-200'}>{canAfford ? `${account.balance - preview.price} Gears` : `Faltam ${preview.price - account.balance} Gears`}</span></p>}
        <button type="button" disabled={!canCustomize || loading || Boolean(walletError) || Boolean(busy) || (equipped && !removable) || (!owned && !canAfford)} onClick={activatePreview} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40">{busy === preview.id ? 'Confirmando…' : removable ? 'Retirar acessório' : equipped ? <><Check size={16} />Em uso</> : owned ? 'Equipar item' : <><Coins size={16} />Comprar e usar · {preview.price}</>}</button>
        <p className="mt-3 text-center text-[10px] leading-relaxed text-slate-500">Experimentar é grátis. Seu perfil só muda ao comprar ou equipar.</p>
        <GearRefundButton key={preview.id} item={preview} />
      </aside>
      <section ref={catalogRef} className="giro-store-catalog min-w-0 space-y-4">
        <div className="flex flex-wrap gap-2" aria-label="Categorias da loja">{GEAR_SHOP_CATEGORIES.map((item) => <button key={item.id} type="button" aria-pressed={category === item.id} onClick={() => browse(item.id, collection)} className={`rounded-xl border px-3 py-2.5 text-xs font-bold ${category === item.id ? 'border-cyan-200/50 bg-cyan-300/15 text-cyan-100' : 'border-white/10 bg-white/[0.03] text-slate-400 hover:text-white'}`}>{item.label}</button>)}</div>
        <div className="flex flex-wrap items-center justify-between gap-3"><select aria-label="Filtrar coleção" value={collection} onChange={(event) => browse(category, event.target.value)} className="min-w-0 rounded-xl border border-white/15 bg-[#111c2e] px-3 py-2 text-xs text-slate-200"><option value="all">Todas as coleções</option>{GEAR_SHOP_COLLECTIONS.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}</select><label className="flex items-center gap-2 text-xs text-slate-300"><input type="checkbox" checked={onlyOwned} onChange={(event) => { const checked = event.target.checked; setOnlyOwned(checked); setPage(1); if (checked) { const first = items.find((item) => account.owned.includes(item.id)); if (first) selectPreview(first.id); } }} />Minha coleção</label></div>
        <p className="text-xs text-slate-400" role="status">{items.length ? `${(currentPage - 1) * 12 + 1} a ${Math.min(currentPage * 12, items.length)} de ${items.length} itens` : "Nenhum item neste filtro"}</p>
        <div className="giro-store-grid">{visibleItems.map((item) => {
          const isOwned = account.owned.includes(item.id);
          const isEquipped = isGearItemEquipped(account.equipped, item.id);
          return <article key={item.id} className="giro-store-tile"><button type="button" aria-label={`Ver ${item.name}`} aria-pressed={preview.id === item.id} onClick={() => selectPreview(item.id)} className={`gear-shop__card ${preview.id === item.id ? 'gear-shop__card--selected' : ''}`}>
            <div className="flex items-center justify-between gap-2 pr-9"><span className={`gear-shop__rarity gear-shop__rarity--${item.rarity === 'Épica' ? 'epic' : item.rarity === 'Rara' ? 'rare' : 'base'}`}>{item.rarity}</span>{isEquipped ? <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-200"><Check size={12} />Em uso</span> : isOwned ? <span className="text-[10px] font-bold text-cyan-100">Na coleção</span> : <LockKeyhole size={13} className="text-slate-500" />}</div>
            <div className="giro-store-card-art"><ItemArt item={item} equipment={{ ...account.equipped, [item.category]: item.id, ...(item.category === 'accessory' ? { accessories: item.id === 'accessory-none' ? [] : [item.id] } : {}) }} /></div>
            <h3 className="text-sm font-black text-white">{item.name}</h3><p className="mt-1 min-h-[34px] text-[11px] leading-relaxed text-slate-400">{item.description}</p><div className="mt-4 flex items-center justify-between gap-2 border-t border-white/5 pt-3"><span className="text-[10px] font-bold text-slate-500">{GEAR_SHOP_CATEGORIES.find((entry) => entry.id === item.category)?.label}</span><span className="inline-flex items-center gap-1.5 text-xs font-black text-amber-100">{item.price ? <><Coins size={13} />{item.price}</> : 'Incluído'}</span></div>
          </button>{item.price > 0 && canCustomize && <button type="button" className="giro-wish-toggle" aria-label={`${wishlist.ids.includes(item.id) ? "Retirar" : "Guardar"} ${item.name} ${wishlist.ids.includes(item.id) ? "dos" : "nos"} desejos`} aria-pressed={wishlist.ids.includes(item.id)} onClick={() => wishlist.toggle(item.id)}><Heart size={16} fill={wishlist.ids.includes(item.id) ? "currentColor" : "none"} /></button>}</article>;
        })}</div>
        {pageCount > 1 && <nav className="ng-toolbar" aria-label="Páginas da loja"><button type="button" className="ng-button ng-button--secondary" disabled={currentPage === 1} onClick={() => changePage(currentPage - 1)}><ChevronLeft size={14} />Anterior</button><span className="text-xs text-slate-400">Página {currentPage} de {pageCount}</span><button type="button" className="ng-button ng-button--secondary" disabled={currentPage === pageCount} onClick={() => changePage(currentPage + 1)}>Próxima<ChevronRight size={14} /></button></nav>}
        {!items.length && <p className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-slate-400">Nenhum item neste filtro. Experimente outra categoria ou desmarque Minha coleção.</p>}
      </section>
    </div>}

    <GearEvolutionPanel />
    <GearHistoryPanel />
    <section className="rounded-[26px] border border-white/10 bg-[#111722] p-5 md:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-xl font-black text-white">Como conquistar Gears</h3><p className="mt-2 text-xs leading-relaxed text-slate-400">Novos registros no seu nome rendem Gears depois de salvos. Editar ou reenviar o mesmo registro não gera outra recompensa.</p></div>{isStudent && <p className="rounded-xl bg-amber-300/10 px-4 py-3 text-xs font-bold text-amber-100">Gears sem limite diário</p>}</div><div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">{Object.entries(GEAR_CONTRIBUTIONS).map(([id, rule]) => <div key={id} className="rounded-xl border border-white/5 bg-white/[0.025] p-3"><p className="text-xs font-bold text-white">{rule.label}</p><p className="mt-2 text-sm font-black text-amber-100">+{rule.coins} Gears</p><p className="mt-1 text-[10px] text-slate-500">Por registro confirmado</p></div>)}</div><p className="mt-4 text-[11px] leading-relaxed text-slate-500">Cada contribuição válida recebe o valor completo uma única vez. Check-ins repetidos da mesma pessoa e data não geram outro crédito. Gears são virtuais: compras e personalizações não alteram sua nota, seu XP ou sua classificação.</p></section>
  </div>;
}
