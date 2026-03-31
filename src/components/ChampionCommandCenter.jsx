import React, { useEffect } from 'react';
import { AlertTriangle, ArrowRight, CheckCircle, Crown, X } from 'lucide-react';

const ChampionCommandCenter = ({
  isOpen,
  onClose,
  readinessTone,
  commandCards,
  readinessScore,
  readinessItems,
  quickActions,
  priorityCards,
}) => {
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[215] bg-[#05060a] text-white overflow-y-auto">
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(234,179,8,0.15),transparent_30%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_35%),linear-gradient(180deg,#0a0a0f_0%,#111320_100%)]">
        <div className="sticky top-0 z-20 backdrop-blur-xl bg-black/40 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-yellow-500/20 bg-yellow-500/10 text-yellow-400 text-[10px] font-bold uppercase tracking-[0.24em]">
                <Crown size={12} /> Central de Comando
              </div>
              <h1 className="text-2xl md:text-3xl font-black mt-3">Central de Comando da Equipe</h1>
              <p className="text-sm text-gray-400 mt-1">Painel executivo para acompanhar prontidao, prioridades e decisoes da temporada.</p>
            </div>

            <button onClick={onClose} className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-bold transition-colors">
              <X size={18} /> Fechar
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#151520] shadow-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(234,179,8,0.16),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.18),transparent_35%)]"></div>
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      ></div>

      <div className="relative grid xl:grid-cols-[1.5fr,0.9fr] gap-6 p-6 md:p-8">
        <div>
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-[0.24em] ${readinessTone.bg} ${readinessTone.border} ${readinessTone.color}`}>
            <Crown size={12} /> Central de Comando da Equipe
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white mt-4 leading-tight">Gestao de equipe com cara de pit wall, banca tecnica e temporada campea.</h2>
          <p className="text-sm text-gray-300 mt-3 max-w-3xl">Este painel mostra onde a equipe ja parece pronta para competir e quais frentes ainda precisam de iteracao antes de uma apresentacao oficial da First Lego League.</p>

          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
            {commandCards.map((card) => (
              <div key={card.label} className={`rounded-2xl border bg-gradient-to-br ${card.accent} p-4`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-gray-300 font-bold">{card.label}</span>
                  <span>{card.icon}</span>
                </div>
                <div className="text-2xl font-black text-white mt-3">{card.value}</div>
                <p className="text-xs text-gray-300 mt-1">{card.helper}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-gray-500 font-bold">Prontidao para Juizes</p>
                <h3 className="text-white font-black text-2xl mt-2">{readinessScore}%</h3>
              </div>
              <div className={`px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-[0.14em] ${readinessTone.bg} ${readinessTone.border} ${readinessTone.color}`}>
                {readinessTone.label}
              </div>
            </div>

            <div className="w-full h-3 rounded-full bg-black/60 overflow-hidden mb-4">
              <div className="h-full rounded-full bg-gradient-to-r from-yellow-400 via-orange-400 to-blue-500 transition-all duration-700" style={{ width: `${readinessScore}%` }}></div>
            </div>

            <div className="space-y-2">
              {readinessItems.slice(0, 5).map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-3 bg-white/5 border border-white/5 rounded-xl px-3 py-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={item.ready ? 'text-green-400' : 'text-yellow-400'}>{item.icon}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">{item.label}</p>
                      <p className="text-[11px] text-gray-400 truncate">{item.detail}</p>
                    </div>
                  </div>
                  {item.ready ? <CheckCircle size={16} className="text-green-400 shrink-0" /> : <AlertTriangle size={16} className="text-yellow-400 shrink-0" />}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
            <p className="text-[10px] uppercase tracking-[0.22em] text-gray-500 font-bold mb-3">Acoes Rapidas</p>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <button key={action.label} onClick={action.onClick} className={`border rounded-xl px-3 py-3 text-xs font-bold flex items-center justify-center gap-2 transition-all ${action.style}`}>
                  {action.icon} {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>

    {priorityCards.length > 0 && (
      <div className="grid lg:grid-cols-3 gap-4">
        {priorityCards.map((card, idx) => (
          <div key={card.title} className="rounded-2xl border border-white/10 bg-[#151520] p-5 relative overflow-hidden">
            <div className={`absolute inset-x-0 top-0 h-1 ${idx === 0 ? 'bg-green-500' : idx === 1 ? 'bg-yellow-500' : 'bg-blue-500'}`}></div>
            <div className="flex items-center gap-2 text-white font-bold mb-3">
              <span className={card.tone === 'green' ? 'text-green-400' : card.tone === 'yellow' ? 'text-yellow-400' : card.tone === 'orange' ? 'text-orange-400' : card.tone === 'pink' ? 'text-pink-400' : card.tone === 'red' ? 'text-red-400' : 'text-blue-400'}>{card.icon}</span>
              {card.title}
            </div>
            <p className="text-sm text-gray-300 leading-relaxed min-h-[66px]">{card.description}</p>
            <button onClick={card.action} className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 rounded-xl transition-colors">
              {card.actionLabel} <ArrowRight size={14} />
            </button>
          </div>
        ))}
      </div>
    )}
        </div>
      </div>
    </div>
  );
};

export default ChampionCommandCenter;
