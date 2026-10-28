import { useEffect, useRef, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { ArrowLeft, Heart, Palette, RefreshCw, Search, Sparkles, Users } from 'lucide-react';
import useGearShopContext from '../hooks/useGearShopContext';
import { GearAvatar } from './GearMascot';
import { GearWorkshopScene } from './GearWorkshop';
import { reactToGearWorkshop } from '../services/gearWorkshop';
import { gearShopError } from '../services/gearShop';
import { resolveGearWorkshop, workshopMember, WORKSHOP_REACTIONS } from '../utils/gearWorkshop';

export default function GearWorkshopGallery() {
  const { db, user, teamMembers, account, isStudent } = useGearShopContext();
  const [selectedId, setSelectedId] = useState('');
  const [search, setSearch] = useState('');
  const [reactionsState, setReactionsState] = useState({ targetId: '', data: [], error: '' });
  const [retry, setRetry] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const savingRef = useRef(false);
  const galleryRef = useRef(null);
  const visit = (id) => {
    setSelectedId(id); setSaveError('');
    requestAnimationFrame(() => galleryRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' }));
  };
  const members = teamMembers.map(workshopMember).filter((member) => member.id !== account.studentId);
  const selected = members.find((member) => member.id === selectedId);
  const targetId = selected?.id || '';
  useEffect(() => {
    if (!targetId || !db) return;
    return onSnapshot(collection(db, 'students', targetId, 'gearWorkshopReactions'), (snapshot) => {
      setReactionsState({ targetId, data: snapshot.docs.map((item) => item.data()), error: '' });
    }, (error) => setReactionsState({ targetId, data: [], error: gearShopError(error) }));
  }, [db, targetId, retry]);
  const loading = Boolean(targetId && reactionsState.targetId !== targetId);
  const reactions = !loading ? reactionsState.data.filter((item) => item.targetStudentId === targetId) : [];
  const ownReaction = reactions.find((item) => item.actorStudentId === account.studentId)?.type;
  const react = async (type) => {
    if (savingRef.current || !targetId || !isStudent) return;
    savingRef.current = true; setSaving(true); setSaveError('');
    try { await reactToGearWorkshop({ db, user, targetStudentId: targetId, type }); }
    catch (error) { setSaveError(gearShopError(error)); }
    finally { savingRef.current = false; setSaving(false); }
  };
  if (selected) {
    const configuration = resolveGearWorkshop(selected.gearWorkshop);
    return <section ref={galleryRef} className="giro-workshop-visit">
      <button type="button" disabled={saving} className="giro-studio-button mb-5" onClick={() => visit('')}><ArrowLeft size={15} />Voltar às oficinas</button>
      <div className="giro-studio-heading"><div><p className="giro-studio-eyebrow"><Users size={14} />Visitando um colega</p><h2>A oficina de {selected.name}</h2><p>Conheça as escolhas do seu colega e deixe um incentivo.</p></div><GearAvatar student={selected} className="h-14 w-14 shrink-0" /></div>
      <div className="giro-workshop__stage"><GearWorkshopScene equipment={selected.gearAppearance} layout={configuration.layout} expression={configuration.expression} action="explore" /></div>
      <div className="giro-workshop-reactions"><h3>Deixe um incentivo</h3><p>Você pode escolher uma reação. Toque novamente para retirá-la.</p><div className="flex flex-wrap gap-2 mt-4">{WORKSHOP_REACTIONS.map((entry) => {
        const Icon = entry.icon === 'palette' ? Palette : entry.icon === 'heart' ? Heart : Sparkles;
        const count = reactions.filter((item) => item.type === entry.id).length;
        return <button type="button" key={entry.id} disabled={!isStudent || saving || loading || Boolean(reactionsState.error)} aria-pressed={ownReaction === entry.id} onClick={() => react(entry.id)}><Icon size={17} /><span>{entry.label}</span><strong>{loading || reactionsState.error ? '—' : count}</strong></button>;
      })}</div>{!isStudent && <p>Entre no seu perfil de aluno para deixar uma reação.</p>}{saving && <p role="status">Enviando reação…</p>}{saveError && <p role="alert" className="giro-workshop-error">{saveError}</p>}{reactionsState.error && <div role="alert" className="giro-workshop-error">{reactionsState.error}<button type="button" className="giro-studio-button mt-3" onClick={() => setRetry((value) => value + 1)}><RefreshCw size={13} />Recarregar reações</button></div>}</div>
    </section>;
  }
  const query = search.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const visibleMembers = members.filter((member) => member.name.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(query));
  return <section ref={galleryRef} className="giro-workshop-gallery">
    <div className="giro-studio-heading"><div><p className="giro-studio-eyebrow"><Users size={14} />Oficinas da equipe</p><h2>Cada integrante, um cantinho.</h2><p>Explore as oficinas dos colegas e compartilhe incentivos.</p></div><label className="giro-workshop-search"><Search size={16} /><input aria-label="Buscar oficina pelo nome" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar integrante" /></label></div>
    <div className="giro-collections">{visibleMembers.map((member) => <article key={member.id} className="giro-collection"><GearWorkshopScene equipment={member.gearAppearance} layout={member.gearWorkshop.layout} expression={member.gearWorkshop.expression} compact still /><div className="giro-collection__body"><div className="flex items-center gap-3"><GearAvatar student={member} className="h-11 w-11 shrink-0" /><h3>{member.name}</h3></div><button type="button" className="giro-studio-button mt-4 w-full" onClick={() => visit(member.id)}>Visitar oficina de {member.name}</button></div></article>)}</div>
    {!visibleMembers.length && <p className="giro-workshop__status">{members.length ? 'Nenhuma oficina encontrada com esse nome.' : 'As oficinas aparecerão aqui quando houver outros integrantes ativos na equipe.'}</p>}
  </section>;
}
