import React from 'react';
import ScreenRecovery from './ScreenRecovery';
import { Maximize2, Minimize2, ScanSearch, Shield, Zap, RotateCcw, Flag } from 'lucide-react';

export const SeasonModeControl = ({ value, onChange, disabled = false }) => (
  <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/25 p-1" aria-label="Temporada ativa">
    <button
      type="button"
      onClick={() => onChange('rotation')}
      disabled={disabled}
      aria-pressed={value === 'rotation'}
      className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[11px] font-black transition-all disabled:cursor-not-allowed disabled:opacity-60 ${value === 'rotation' ? 'bg-blue-400 text-slate-950 shadow-lg shadow-blue-950/30' : 'text-slate-300 hover:bg-white/8 hover:text-white'}`}
    >
      <RotateCcw size={14} /> Rodízio
    </button>
    <button
      type="button"
      onClick={() => onChange('final')}
      disabled={disabled}
      aria-pressed={value === 'final'}
      className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[11px] font-black transition-all disabled:cursor-not-allowed disabled:opacity-60 ${value === 'final' ? 'bg-amber-300 text-slate-950 shadow-lg shadow-amber-950/30' : 'text-slate-300 hover:bg-white/8 hover:text-white'}`}
    >
      <Flag size={14} /> Reta final
    </button>
  </div>
);

export const WorkspaceHero = ({ eyebrow, title, subtitle, metrics, actions, shortcutLabel = 'Atalhos', footerContent = null }) => (
  <section className="newgears-workspace-hero ng-context-hero">
    <div className="ng-context-hero__heading"><div><p className="ng-eyebrow">{eyebrow}</p><h2>{title}</h2><p>{subtitle}</p></div>
      <div className="ng-context-hero__actions" role="group" aria-label={shortcutLabel}>{actions.map((action) => <button type="button" key={action.label} onClick={action.onClick} className={'ng-button ' + (action.style || '')}>{action.icon}{action.label}</button>)}</div>
    </div>
    <div className="ng-context-hero__metrics">{metrics.map((metric) => <div key={metric.label}><span>{metric.label}<span aria-hidden="true">{metric.icon}</span></span><strong>{metric.value}</strong><p>{metric.helper}</p></div>)}</div>
    {footerContent && <div className="ng-context-hero__footer">{footerContent}</div>}
  </section>
);


export const WorkspaceSectionHeading = ({ tab }) => tab ? (
  <div className="workspace-section-heading">
    <span aria-hidden="true">{tab.icon}</span>
    <div><h2>{tab.label}</h2><p>{tab.description}</p></div>
  </div>
) : null;

export const WorkspaceTabs = ({ eyebrow, tabs, activeId, onChange }) => {
  const activeTab = tabs.find((tab) => tab.id === activeId) || tabs[0];

  return (
    <div className="newgears-tabs-shell newgears-hud-shell sticky top-[90px] z-30 overflow-hidden rounded-[26px] border border-white/12 bg-[linear-gradient(145deg,rgba(15,18,35,0.95),rgba(11,16,31,0.94))] shadow-[0_30px_80px_rgba(0,0,0,0.32)]">
      <div className="pointer-events-none absolute left-5 right-5 top-0 h-[2px] rounded-full bg-gradient-to-r from-blue-300 via-violet-400 to-fuchsia-400 opacity-85" />
      <div className="pointer-events-none absolute left-10 right-10 -top-5 h-8 bg-[radial-gradient(circle_at_center,rgba(96,165,250,0.16),transparent_70%)] blur-xl" />
      <div className="border-b border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),transparent_42%),linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:auto,24px_24px,24px_24px] px-5 pb-2.5 pt-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="max-w-3xl">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-300/62">{eyebrow}</p>
            <div className="mt-1.5 flex items-center gap-2.5">
              <span className={`newgears-kicker border px-2.5 py-2 shadow-[0_12px_24px_rgba(0,0,0,0.16)] ${activeTab.pillTone || 'border-white/10 bg-white/10 text-white'}`}>
                {activeTab.icon}
              </span>
              <div>
                <h3 className="newgears-display text-lg font-black leading-tight text-white">{activeTab.label}</h3>
                <p className="mt-0.5 text-sm text-slate-200/70">{activeTab.description}</p>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="newgears-status-strip inline-flex items-center gap-2 border border-blue-400/20 bg-blue-400/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-blue-100">
                <ScanSearch size={12} />
                Aba ativa
              </span>
              <span className="newgears-status-strip inline-flex items-center gap-2 border border-white/10 bg-white/6 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-white/80">
                <Zap size={12} />
                {tabs.length} areas
              </span>
            </div>
          </div>

          {activeTab.pill ? (
            <span className={`newgears-kicker border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] ${activeTab.pillTone || 'border-white/10 bg-white/5 text-gray-200'}`}>
              {activeTab.pill}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto px-2 py-1.5 custom-scrollbar">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            data-active={activeId === tab.id ? 'true' : 'false'}
            title={tab.label}
            aria-label={tab.label}
            className={`newgears-tab-button relative flex min-w-[198px] items-center gap-2.5 rounded-[18px] border px-3.5 py-2.5 text-left text-xs font-black uppercase tracking-[0.12em] shadow-[0_14px_28px_rgba(0,0,0,0.16)] transition-all hover:-translate-y-0.5 md:min-w-[214px] ${activeId === tab.id ? tab.activeClass : tab.inactiveClass}`}
          >
            <span className={`absolute left-0 top-0 h-full w-1.5 ${activeId === tab.id ? 'bg-gradient-to-b from-blue-300 via-violet-400 to-fuchsia-400' : 'bg-white/8'}`} />
            <span className="newgears-tab-index inline-flex h-9 min-w-9 shrink-0 items-center justify-center rounded-[13px] border border-white/12 bg-black/25 text-[11px] font-black text-white/85">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="newgears-tab-label flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
              <span className="shrink-0">{tab.icon}</span>
              <span className="min-w-0 flex-1 truncate">{tab.label}</span>
            </span>
            {tab.badge ? (
              <span className="newgears-tab-badge ml-auto inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-black/24 px-1.5 text-[10px] font-black">
                {tab.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
};

export const WorkspaceScene = ({ sceneId, onHome, children }) => (
  <div key={sceneId} className="ng-scene" data-scene={sceneId}>
    <ScreenRecovery area={sceneId} onHome={onHome}>{children}</ScreenRecovery>
  </div>
);

// Keep the component type stable while running a panel's render function inside
// React, so the surrounding screen boundary can still catch panel errors.
export const WorkspaceContent = ({ render, options }) => render(options);

export const WorkspacePanelToolbar = ({
  eyebrow,
  panels,
  panelState,
  onToggle,
  onExpandAll,
  onCollapseAll,
}) => {
  const openCount = panels.filter((panel) => panelState[panel.id]).length;

  return (
    <div className="newgears-toolbar-shell newgears-hud-shell border border-white/12 bg-[linear-gradient(145deg,rgba(15,18,35,0.95),rgba(11,16,31,0.94))] p-4 shadow-[0_28px_76px_rgba(0,0,0,0.28)]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-300/60">{eyebrow}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <p className="text-sm text-slate-200/82">{openCount}/{panels.length} blocos ativos na tela</p>
            <span className="newgears-status-strip inline-flex items-center gap-2 border border-fuchsia-400/20 bg-fuchsia-400/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-fuchsia-100">
              <Shield size={12} />
              HUD pronto
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={onExpandAll}
            className="newgears-workspace-action inline-flex items-center gap-2 border border-white/10 bg-white/10 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-white shadow-[0_12px_26px_rgba(0,0,0,0.14)] transition-all hover:bg-white/15"
          >
            <Maximize2 size={14} />
            Expandir tudo
          </button>
          <button
            onClick={onCollapseAll}
            className="newgears-workspace-action inline-flex items-center gap-2 border border-white/10 bg-white/5 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-gray-200 shadow-[0_12px_26px_rgba(0,0,0,0.14)] transition-all hover:bg-white/10 hover:text-white"
          >
            <Minimize2 size={14} />
            Recolher tudo
          </button>
        </div>
      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/8">
        <div
          className="newgears-scan-bar h-full rounded-full bg-gradient-to-r from-blue-300 via-violet-400 to-fuchsia-400"
          style={{ width: `${panels.length > 0 ? (openCount / panels.length) * 100 : 0}%` }}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {panels.map((panel) => {
          const isOpen = Boolean(panelState[panel.id]);

          return (
            <button
              key={panel.id}
              onClick={() => onToggle(panel.id)}
              data-open={isOpen ? 'true' : 'false'}
              className={`newgears-workspace-action inline-flex items-center gap-2 border px-4 py-3 text-xs font-black uppercase tracking-[0.14em] shadow-[0_12px_24px_rgba(0,0,0,0.12)] transition-all ${isOpen ? panel.activeClass : 'border-white/10 bg-white/5 text-gray-200 hover:bg-white/10 hover:text-white'}`}
            >
              {panel.icon}
              {panel.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const WorkspaceCollapsible = ({ isOpen, children }) => {
  if (!isOpen) return null;

  return (
    <div className="ng-scene">
      {children}
    </div>
  );
};
