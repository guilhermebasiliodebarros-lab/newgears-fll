import React from 'react';
import { Crown, Maximize2, Minimize2 } from 'lucide-react';

export const WorkspaceHero = ({ eyebrow, title, subtitle, metrics, actions, accent = 'from-[#1f1b3a] via-[#13131d] to-[#0b0b12]', footerContent = null }) => (
  <section className={`relative overflow-hidden rounded-[36px] border border-white/12 bg-gradient-to-br ${accent} p-6 md:p-8 shadow-[0_32px_90px_rgba(0,0,0,0.35)]`}>
    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px),radial-gradient(circle_at_top_right,rgba(255,216,77,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(77,214,255,0.18),transparent_30%)] bg-[size:28px_28px,28px_28px,auto,auto] pointer-events-none"></div>
    <div className="absolute -top-14 right-[-48px] h-44 w-44 rounded-full bg-yellow-300/10 blur-3xl pointer-events-none"></div>
    <div className="absolute bottom-[-76px] left-[-36px] h-52 w-52 rounded-full bg-cyan-400/10 blur-3xl pointer-events-none"></div>

    <div className="relative z-10 grid gap-6 xl:grid-cols-[1.15fr,0.95fr]">
      <div>
        <span className="inline-flex items-center gap-2 rounded-full border border-yellow-300/25 bg-yellow-300/14 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-yellow-100 shadow-[0_10px_30px_rgba(255,216,77,0.12)]">
          <Crown size={12} /> {eyebrow}
        </span>
        <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mt-4 max-w-3xl drop-shadow-[0_8px_24px_rgba(0,0,0,0.22)]">{title}</h2>
        <p className="text-sm md:text-base text-slate-200/90 mt-4 max-w-3xl leading-relaxed">{subtitle}</p>

        <div className="flex flex-wrap gap-3 mt-6">
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              className={`inline-flex items-center gap-2 rounded-[20px] border px-4 py-3 text-xs font-black shadow-[0_16px_30px_rgba(0,0,0,0.18)] transition-all hover:-translate-y-1 ${action.style}`}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-[24px] border border-white/12 bg-white/10 p-4 backdrop-blur-md shadow-[0_18px_36px_rgba(0,0,0,0.18)]">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] uppercase tracking-[0.2em] text-slate-300/70 font-black">{metric.label}</span>
              <div className={`rounded-[14px] border px-2.5 py-1.5 ${metric.tone || 'border-white/10 bg-white/10 text-white'}`}>
                {metric.icon}
              </div>
            </div>
            <p className="text-2xl md:text-3xl font-black text-white mt-4">{metric.value}</p>
            <p className="text-xs text-slate-200/70 mt-2 leading-relaxed">{metric.helper}</p>
          </div>
        ))}
      </div>
    </div>

    {footerContent ? (
      <div className="relative z-10 mt-6 border-t border-white/12 pt-6">
        {footerContent}
      </div>
    ) : null}
  </section>
);

export const WorkspaceTabs = ({ eyebrow, tabs, activeId, onChange }) => {
  const activeTab = tabs.find((tab) => tab.id === activeId) || tabs[0];

  return (
    <div className="sticky top-[90px] z-30 overflow-hidden rounded-[30px] border border-white/12 bg-[linear-gradient(145deg,rgba(17,20,40,0.94),rgba(18,25,50,0.88))] shadow-[0_24px_70px_rgba(0,0,0,0.3)]">
      <div className="px-5 pt-5 pb-4 border-b border-white/10 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px),radial-gradient(circle_at_top_left,rgba(255,216,77,0.12),transparent_36%)] bg-[size:24px_24px,24px_24px,auto]">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-300/60 font-black">{eyebrow}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`rounded-[16px] border px-2.5 py-2.5 shadow-[0_12px_24px_rgba(0,0,0,0.16)] ${activeTab.pillTone || 'border-white/10 bg-white/10 text-white'}`}>
                {activeTab.icon}
              </span>
              <div>
                <h3 className="text-white font-black text-lg leading-tight">{activeTab.label}</h3>
                <p className="text-sm text-slate-200/70 mt-1">{activeTab.description}</p>
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

      <div className="p-2.5 flex gap-2 overflow-x-auto custom-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative flex items-center justify-center min-w-[150px] gap-2 px-4 py-3.5 rounded-[20px] font-black text-xs shadow-[0_12px_26px_rgba(0,0,0,0.14)] transition-all hover:-translate-y-0.5 ${activeId === tab.id ? tab.activeClass : tab.inactiveClass}`}
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
    <div className="rounded-[30px] border border-white/12 bg-[linear-gradient(145deg,rgba(17,20,40,0.94),rgba(18,25,50,0.88))] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.26)]">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-slate-300/60 font-black">{eyebrow}</p>
          <p className="text-sm text-slate-200/80 mt-2">{openCount}/{panels.length} paineis visiveis</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={onExpandAll}
            className="inline-flex items-center gap-2 rounded-[20px] border border-white/10 bg-white/10 px-4 py-3 text-xs font-black text-white shadow-[0_12px_26px_rgba(0,0,0,0.14)] hover:bg-white/15 transition-all"
          >
            <Maximize2 size={14} />
            Expandir tudo
          </button>
          <button
            onClick={onCollapseAll}
            className="inline-flex items-center gap-2 rounded-[20px] border border-white/10 bg-white/5 px-4 py-3 text-xs font-black text-gray-200 shadow-[0_12px_26px_rgba(0,0,0,0.14)] hover:bg-white/10 hover:text-white transition-all"
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
              className={`inline-flex items-center gap-2 rounded-[20px] border px-4 py-3 text-xs font-black shadow-[0_12px_24px_rgba(0,0,0,0.12)] transition-all ${isOpen ? panel.activeClass : 'border-white/10 bg-white/5 text-gray-200 hover:bg-white/10 hover:text-white'}`}
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
