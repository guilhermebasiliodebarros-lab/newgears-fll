import React from 'react';
import { Crown, Maximize2, Minimize2, Radio, ScanSearch, Shield, Zap } from 'lucide-react';

export const WorkspaceHero = ({
  eyebrow,
  title,
  subtitle,
  metrics,
  actions,
  accent = 'from-[#15254a] via-[#2a1458] to-[#140b2e]',
  footerContent = null,
}) => (
  <section className={`newgears-workspace-hero newgears-hud-shell relative overflow-hidden border border-white/12 bg-gradient-to-br ${accent} p-6 md:p-8 shadow-[0_36px_110px_rgba(0,0,0,0.34)]`}>
    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.045)_0%,transparent_26%,transparent_70%,rgba(255,255,255,0.04)_100%),linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:auto,26px_26px,26px_26px]" />
    <div className="pointer-events-none absolute left-6 top-5 h-24 w-24 border-l-2 border-t-2 border-blue-300/25" />
    <div className="pointer-events-none absolute bottom-6 right-6 h-24 w-24 border-b-2 border-r-2 border-fuchsia-300/20" />
    <div className="pointer-events-none absolute left-[8%] top-0 h-full w-24 -skew-x-[24deg] bg-[linear-gradient(180deg,rgba(255,255,255,0.12),transparent_22%,transparent_78%,rgba(255,255,255,0.08))] opacity-35" />
    <div className="pointer-events-none absolute right-[12%] top-0 h-full w-16 -skew-x-[24deg] bg-[linear-gradient(180deg,rgba(208,27,241,0.22),transparent_24%,transparent_76%,rgba(98,147,233,0.18))] opacity-45" />
    <div className="pointer-events-none absolute -left-12 top-0 h-44 w-44 rounded-full bg-[#6293E9]/18 blur-3xl" />
    <div className="pointer-events-none absolute right-[-38px] top-[-14px] h-48 w-48 rounded-full bg-[#D01BF1]/18 blur-3xl" />
    <div className="pointer-events-none absolute bottom-[-84px] right-[8%] h-64 w-64 rounded-full bg-[#820AAF]/14 blur-3xl" />

    <div className="relative z-10 grid gap-7 xl:grid-cols-[1.08fr,0.92fr]">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="newgears-kicker inline-flex items-center gap-2 border border-white/20 bg-black/24 px-3 py-2 text-[10px] font-black uppercase tracking-[0.26em] text-white shadow-[0_12px_24px_rgba(0,0,0,0.22)]">
            <Crown size={12} />
            {eyebrow}
          </span>
          <span className="newgears-status-strip inline-flex items-center gap-2 border border-blue-400/20 bg-blue-400/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-blue-100">
            <Radio size={12} />
            Interface ativa
          </span>
        </div>

        <div className="mt-5 max-w-3xl">
          <h2 className="newgears-display text-3xl font-black leading-[0.95] text-white drop-shadow-[0_10px_28px_rgba(0,0,0,0.3)] md:text-[3.15rem]">
            {title}
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-100/88 md:text-base">{subtitle}</p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <div className="newgears-mini-hud border border-white/12 bg-black/22 px-4 py-3">
            <span className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-300/72">Blocos</span>
            <span className="newgears-display mt-2 block text-lg font-black text-white">{metrics.length}</span>
          </div>
          <div className="newgears-mini-hud border border-white/12 bg-black/22 px-4 py-3">
            <span className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-300/72">Atalhos</span>
            <span className="newgears-display mt-2 block text-lg font-black text-white">{actions.length}</span>
          </div>
          <div className="newgears-status-strip inline-flex items-center gap-2 border border-fuchsia-400/20 bg-fuchsia-400/10 px-4 py-3 text-[10px] font-black uppercase tracking-[0.22em] text-fuchsia-100">
            <Shield size={12} />
            Leitura pronta
          </div>
        </div>

        <div className="mt-7 flex flex-wrap gap-3">
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              className={`newgears-workspace-action newgears-action-button inline-flex items-center gap-2 border px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-white shadow-[0_18px_36px_rgba(0,0,0,0.2)] transition-all hover:-translate-y-1 ${action.style}`}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric, index) => (
          <div key={metric.label} className="newgears-workspace-metric newgears-metric-card border border-white/12 bg-black/24 p-4 shadow-[0_20px_40px_rgba(0,0,0,0.18)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="text-[9px] font-black uppercase tracking-[0.24em] text-slate-100/50">Setor {String(index + 1).padStart(2, '0')}</span>
                <span className="mt-1 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-100/72">{metric.label}</span>
              </div>
              <div className={`newgears-metric-emblem border px-2.5 py-1.5 shadow-[0_12px_24px_rgba(0,0,0,0.12)] ${metric.tone || 'border-white/10 bg-white/10 text-white'}`}>
                {metric.icon}
              </div>
            </div>
            <p className="newgears-display mt-4 text-[1.9rem] font-black leading-none text-white md:text-[2.25rem]">{metric.value}</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-100/74">{metric.helper}</p>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/8">
              <div
                className="newgears-scan-bar h-full rounded-full bg-gradient-to-r from-blue-300 via-violet-400 to-fuchsia-400"
                style={{ width: `${42 + (index * 13)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>

    {footerContent ? (
      <div className="newgears-footer-shell relative z-10 mt-7 border border-white/10 bg-black/18 p-4 md:p-5">
        {footerContent}
      </div>
    ) : null}
  </section>
);

export const WorkspaceTabs = ({ eyebrow, tabs, activeId, onChange }) => {
  const activeTab = tabs.find((tab) => tab.id === activeId) || tabs[0];

  return (
    <div className="newgears-tabs-shell newgears-hud-shell sticky top-[90px] z-30 overflow-hidden border border-white/12 bg-[linear-gradient(145deg,rgba(15,18,35,0.95),rgba(11,16,31,0.94))] shadow-[0_30px_80px_rgba(0,0,0,0.32)]">
      <div className="border-b border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),transparent_42%),linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:auto,24px_24px,24px_24px] px-5 pb-4 pt-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-300/62">{eyebrow}</p>
            <div className="mt-2 flex items-center gap-3">
              <span className={`newgears-kicker border px-3 py-3 shadow-[0_12px_24px_rgba(0,0,0,0.16)] ${activeTab.pillTone || 'border-white/10 bg-white/10 text-white'}`}>
                {activeTab.icon}
              </span>
              <div>
                <h3 className="newgears-display text-lg font-black leading-tight text-white">{activeTab.label}</h3>
                <p className="mt-1 text-sm text-slate-200/70">{activeTab.description}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="newgears-status-strip inline-flex items-center gap-2 border border-blue-400/20 bg-blue-400/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-blue-100">
                <ScanSearch size={12} />
                Aba ativa
              </span>
              <span className="newgears-status-strip inline-flex items-center gap-2 border border-white/10 bg-white/6 px-3 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-white/80">
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

      <div className="flex gap-2 overflow-x-auto p-2.5 custom-scrollbar">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            data-active={activeId === tab.id ? 'true' : 'false'}
            className={`newgears-tab-button relative flex min-w-[182px] items-center gap-3 border px-4 py-3.5 text-left text-xs font-black uppercase tracking-[0.12em] shadow-[0_14px_28px_rgba(0,0,0,0.16)] transition-all hover:-translate-y-0.5 ${activeId === tab.id ? tab.activeClass : tab.inactiveClass}`}
          >
            <span className={`absolute left-0 top-0 h-full w-1.5 ${activeId === tab.id ? 'bg-gradient-to-b from-blue-300 via-violet-400 to-fuchsia-400' : 'bg-white/8'}`} />
            <span className="newgears-tab-index inline-flex h-10 min-w-10 items-center justify-center rounded-[14px] border border-white/12 bg-black/25 text-[11px] font-black text-white/85">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="newgears-tab-label flex items-center gap-2">
              {tab.icon}
              {tab.label}
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

export const WorkspaceScene = ({ sceneId, children }) => (
  <div key={sceneId} className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
    {children}
  </div>
);

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
    <div className="animate-in fade-in slide-in-from-bottom-3 duration-500 ease-out">
      {children}
    </div>
  );
};
