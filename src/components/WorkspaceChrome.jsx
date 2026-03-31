import React from 'react';
import { Crown, Maximize2, Minimize2 } from 'lucide-react';

export const WorkspaceHero = ({ eyebrow, title, subtitle, metrics, actions, accent = 'from-[#1f1b3a] via-[#13131d] to-[#0b0b12]', footerContent = null }) => (
  <section className={`relative overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-br ${accent} p-6 md:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.35)]`}>
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.16),transparent_30%)] pointer-events-none"></div>
    <div className="absolute -top-16 right-[-60px] h-48 w-48 rounded-full bg-white/10 blur-3xl pointer-events-none"></div>
    <div className="absolute bottom-[-80px] left-[-40px] h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"></div>

    <div className="relative z-10 grid gap-6 xl:grid-cols-[1.15fr,0.95fr]">
      <div>
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white/80">
          <Crown size={12} /> {eyebrow}
        </span>
        <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mt-4 max-w-3xl">{title}</h2>
        <p className="text-sm md:text-base text-gray-300 mt-4 max-w-3xl leading-relaxed">{subtitle}</p>

        <div className="flex flex-wrap gap-3 mt-6">
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-xs font-bold transition-all ${action.style}`}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-2xl border border-white/10 bg-black/25 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">{metric.label}</span>
              <div className={`rounded-xl border px-2 py-1 ${metric.tone || 'border-white/10 bg-white/5 text-white'}`}>
                {metric.icon}
              </div>
            </div>
            <p className="text-2xl md:text-3xl font-black text-white mt-4">{metric.value}</p>
            <p className="text-xs text-gray-400 mt-2">{metric.helper}</p>
          </div>
        ))}
      </div>
    </div>

    {footerContent ? (
      <div className="relative z-10 mt-6 border-t border-white/10 pt-6">
        {footerContent}
      </div>
    ) : null}
  </section>
);

export const WorkspaceTabs = ({ eyebrow, tabs, activeId, onChange }) => {
  const activeTab = tabs.find((tab) => tab.id === activeId) || tabs[0];

  return (
    <div className="bg-[#151520] border border-white/10 rounded-[28px] sticky top-[80px] z-30 shadow-[0_20px_60px_rgba(0,0,0,0.35)] overflow-hidden">
      <div className="px-5 pt-5 pb-4 border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_45%)]">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-gray-500 font-bold">{eyebrow}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`rounded-xl border px-2 py-2 ${activeTab.pillTone || 'border-white/10 bg-white/5 text-white'}`}>
                {activeTab.icon}
              </span>
              <div>
                <h3 className="text-white font-black text-lg leading-tight">{activeTab.label}</h3>
                <p className="text-sm text-gray-400 mt-1">{activeTab.description}</p>
              </div>
            </div>
          </div>

          {activeTab.pill && (
            <span className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.18em] font-bold ${activeTab.pillTone || 'border-white/10 bg-white/5 text-gray-200'}`}>
              {activeTab.pill}
            </span>
          )}
        </div>
      </div>

      <div className="p-2 flex gap-2 overflow-x-auto custom-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative flex items-center justify-center min-w-[150px] gap-2 px-4 py-3 rounded-2xl font-bold text-xs transition-all ${activeId === tab.id ? tab.activeClass : tab.inactiveClass}`}
          >
            {tab.icon}
            {tab.label}
            {tab.badge ? (
              <span className="ml-1 inline-flex items-center justify-center min-w-[22px] h-[22px] rounded-full bg-white/15 px-1.5 text-[10px] font-black">
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
  <div
    key={sceneId}
    className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out"
  >
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
    <div className="rounded-[28px] border border-white/10 bg-[#151520] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-gray-500 font-bold">{eyebrow}</p>
          <p className="text-sm text-gray-300 mt-2">{openCount}/{panels.length} paineis visiveis</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={onExpandAll}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold text-white hover:bg-white/10 transition-all"
          >
            <Maximize2 size={14} />
            Expandir tudo
          </button>
          <button
            onClick={onCollapseAll}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold text-gray-300 hover:bg-white/10 hover:text-white transition-all"
          >
            <Minimize2 size={14} />
            Recolher tudo
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        {panels.map((panel) => {
          const isOpen = Boolean(panelState[panel.id]);

          return (
            <button
              key={panel.id}
              onClick={() => onToggle(panel.id)}
              className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-xs font-bold transition-all ${isOpen ? panel.activeClass : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'}`}
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
