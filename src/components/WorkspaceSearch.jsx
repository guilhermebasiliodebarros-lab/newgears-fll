import { useEffect, useId, useRef, useState } from 'react';
import { ArrowUpRight, Command, Search } from 'lucide-react';
import { DialogSurface, EmptyState } from './InterfacePrimitives';
import { searchWorkspaceTabs } from '../utils/workspaceNavigation';

export default function WorkspaceSearch({ tabs, activeId, onNavigate }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const field = useRef(null);
  const titleId = useId();
  useEffect(() => {
    const shortcut = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k' && !event.altKey && !event.isComposing) {
        // Leave other dialogs in control of the keyboard.
        if (!open && document.querySelector('[role="dialog"][aria-modal="true"],dialog[open]')) return;
        event.preventDefault(); setOpen((current) => !current); setQuery('');
      }
    };
    document.addEventListener('keydown', shortcut, true);
    return () => document.removeEventListener('keydown', shortcut, true);
  }, [open]);
  const results = searchWorkspaceTabs(tabs, query);
  const select = (id) => { setOpen(false); setQuery(''); onNavigate(id); };
  return <>
    <button type="button" className="ng-search-trigger" onClick={() => { setOpen(true); setQuery(''); }} aria-label="Buscar áreas do sistema" aria-keyshortcuts="Control+k Meta+k"><Search size={17} /><span>Buscar na plataforma</span><kbd>Ctrl K</kbd></button>
    {open && <DialogSurface label="Buscar áreas" titleId={titleId} onClose={() => setOpen(false)} initialFocusRef={field} className="ng-command-menu" closeButton dismissOnBackdrop>
      <div className="ng-command-menu__heading"><Command size={20} /><div><h2 id={titleId}>Aonde vamos?</h2><p>Encontre uma área e vá direto ao que precisa.</p></div></div>
      <label className="ng-command-menu__field"><Search size={19} /><span className="sr-only">Buscar pelo nome ou assunto da área</span><input ref={field} value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'ArrowDown') { event.preventDefault(); event.currentTarget.closest('[role="dialog"]').querySelector('[data-search-result]')?.focus(); } else if (event.key === 'Enter' && results.length) { event.preventDefault(); select(results[0].id); } }} placeholder="Tarefas, avaliações, robô…" autoComplete="off" /></label>
      <p className="ng-command-menu__count" role="status">{results.length} {results.length === 1 ? 'área encontrada' : 'áreas encontradas'}</p>
      <div className="ng-command-menu__results" onKeyDown={(event) => {
        if (!['ArrowUp', 'ArrowDown'].includes(event.key)) return;
        const buttons = [...event.currentTarget.querySelectorAll('[data-search-result]')];
        const index = buttons.indexOf(document.activeElement);
        if (index < 0) return;
        event.preventDefault(); const next = index + (event.key === 'ArrowDown' ? 1 : -1);
        if (next < 0) field.current?.focus(); else buttons[Math.min(buttons.length - 1, next)]?.focus();
      }}>
        {results.map((tab) => <button type="button" data-search-result key={tab.id} onClick={() => select(tab.id)} aria-current={tab.id === activeId ? 'page' : undefined}>
          <span className="ng-command-menu__icon" aria-hidden="true">{tab.icon}</span><span><strong>{tab.label}</strong><small>{tab.description}</small></span><ArrowUpRight size={17} />
        </button>)}
        {!results.length && <EmptyState compact icon={<Search size={23} />} title="Nenhuma área encontrada" description="Tente outro nome, como tarefas, robô ou relatórios." />}
      </div><p className="ng-command-menu__help"><span><kbd>↑</kbd><kbd>↓</kbd> navegar</span><span><kbd>Enter</kbd> abrir</span><span><kbd>Esc</kbd> fechar</span></p>
    </DialogSurface>}
  </>;
}
