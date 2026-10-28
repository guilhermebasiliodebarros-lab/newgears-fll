import { useEffect, useRef, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { ChevronRight, LogOut, X } from 'lucide-react';
import './WorkspaceSidebar.css';

const desktopQuery = '(min-width: 1100px)';
const subscribeDesktop = (notify) => {
  const media = window.matchMedia(desktopQuery);
  media.addEventListener('change', notify);
  return () => media.removeEventListener('change', notify);
};
const getDesktop = () => window.matchMedia(desktopQuery).matches;
const groups = [
  { label: 'Principal', ids: ['overview'] },
  { label: 'Minha rotina', ids: ['mission', 'feedback', 'sprint', 'kanban', 'agenda', 'weekly_reports', 'logbook'] },
  { label: 'Projeto e robô', ids: ['strategy', 'rounds', 'rubrics'] },
  { label: 'Equipe', ids: ['students', 'rotation', 'evaluations', 'discipline', 'showcase'] },
  { label: 'Conquistas e personalização', ids: ['shop'] },
  { label: 'Gestão', ids: ['operations', 'history', 'season_history', 'report_recipients'] },
];

export default function WorkspaceSidebar({ tabs, activeId, onNavigate, open, onClose, profile, avatar, meta, onProfile, onLogout, brand }) {
  const desktop = useSyncExternalStore(subscribeDesktop, getDesktop);
  const sidebarRef = useRef(null);
  const mobileOpen = open && !desktop;

  // Release the drawer when crossing the desktop breakpoint, including its focus trap.
  useEffect(() => { if (desktop && open) onClose(); }, [desktop, open, onClose]);

  useEffect(() => {
    if (!mobileOpen) return;
    const sidebar = sidebarRef.current;
    const previousFocus = document.activeElement;
    const page = document.querySelector('[data-workspace-page]');
    const previousInert = page?.inert;
    const previousOverflow = document.body.style.overflow;
    if (page) page.inert = true;
    document.body.style.overflow = 'hidden';
    const focusFrame = requestAnimationFrame(() => sidebar.querySelector('button')?.focus({ preventScroll: true }));
    const onKey = (event) => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); return; }
      if (event.key !== 'Tab') return;
      const buttons = [...sidebar.querySelectorAll('button:not(:disabled), a[href], [tabindex="0"]')].filter((node) => node.getClientRects().length);
      const first = buttons[0];
      const last = buttons.at(-1);
      if (event.shiftKey && (document.activeElement === first || !sidebar.contains(document.activeElement))) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !sidebar.contains(document.activeElement))) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      if (page) page.inert = previousInert;
      if (previousFocus?.isConnected && previousFocus.getClientRects().length) previousFocus.focus();
    };
  }, [mobileOpen, onClose]);

  const select = (id) => { onClose(); onNavigate(id); };
  const renderTab = (tab) => (
    <button key={tab.id} type="button" className="workspace-sidebar__link" aria-label={tab.label} aria-current={activeId === tab.id ? 'page' : undefined} title={tab.description} onClick={() => select(tab.id)}>
      <span className="workspace-sidebar__icon" aria-hidden="true">{tab.icon}</span>
      <span className="workspace-sidebar__label">{tab.label}</span>
      {tab.badge ? <span className="workspace-sidebar__badge" aria-label={`${tab.badge} pendências`}>{tab.badge}</span> : <ChevronRight size={14} className="workspace-sidebar__chevron" aria-hidden="true" />}
    </button>
  );
  const knownIds = new Set(groups.flatMap((group) => group.ids));
  const navigation = <>
    {mobileOpen && <button type="button" className="workspace-sidebar-backdrop" aria-label="Fechar menu lateral" tabIndex={-1} onClick={onClose} />}
    <aside ref={sidebarRef} id="workspace-navigation" className={`workspace-sidebar ${mobileOpen ? 'workspace-sidebar--open' : ''}`} role={mobileOpen ? 'dialog' : undefined} aria-modal={mobileOpen || undefined} aria-label="Menu principal">
      <div className="workspace-sidebar__brand">
        <div className="workspace-sidebar__logo">{brand}</div>
        <span>BASE DA EQUIPE</span>
        <button type="button" className="workspace-sidebar__close" onClick={onClose} aria-label="Fechar menu"><X size={21} /></button>
      </div>
      <button type="button" className="workspace-sidebar__profile" disabled={!onProfile} onClick={() => { onClose(); onProfile?.(); }} aria-label={`Abrir perfil de ${profile.name}`}>
        {avatar}
        <span className="workspace-sidebar__identity"><small>{profile.role}</small><strong>{profile.name}</strong><span>{profile.subtitle}</span></span>
        <ChevronRight size={16} aria-hidden="true" />
      </button>
      {meta && <div className="workspace-sidebar__meta">{meta}</div>}
      <nav className="workspace-sidebar__nav custom-scrollbar" aria-label="Áreas do sistema">
        {groups.map((group) => {
          const items = group.ids.map((id) => tabs.find((tab) => tab.id === id)).filter(Boolean);
          return items.length ? <section key={group.label} className="workspace-sidebar__group" aria-label={group.label}>
            <h2>{group.label}</h2>{items.map(renderTab)}
          </section> : null;
        })}
        {tabs.some((tab) => !knownIds.has(tab.id)) && <section className="workspace-sidebar__group" aria-label="Outras áreas"><h2>Outras áreas</h2>{tabs.filter((tab) => !knownIds.has(tab.id)).map(renderTab)}</section>}
      </nav>
      <div className="workspace-sidebar__footer"><span>New Gears · FLL</span><button type="button" onClick={onLogout}><LogOut size={15} /> Sair</button></div>
    </aside>
  </>;
  // The mobile drawer must cover floating widgets that also live outside the app.
  return desktop ? navigation : createPortal(navigation, document.body);
}
