import React from 'react';
import { CheckCircle2, AlertTriangle, Shield, Target } from 'lucide-react';

const CompetitionPrepPanel = ({
  eyebrow = 'Preparacao de Campeonato',
  title,
  summary,
  readinessScore,
  readinessLabel,
  weekLabel,
  checklistItems,
  focusItems,
  actionButtons = [],
}) => (
  <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-br from-[#171726] via-[#12121b] to-[#0d0e14] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.10),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.14),transparent_35%)] pointer-events-none"></div>

    <div className="relative z-10">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-green-300">
            <Shield size={12} /> {eyebrow}
          </span>
          <h3 className="text-2xl font-black text-white mt-4 leading-tight">{title}</h3>
          <p className="text-sm text-gray-300 mt-3 max-w-3xl leading-relaxed">{summary}</p>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-black/25 p-5 min-w-[230px]">
          <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500 font-bold">Prontidao de torneio</p>
          <div className="flex items-end justify-between gap-4 mt-3">
            <span className="text-4xl font-black text-white">{readinessScore}%</span>
            <span className="rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] font-bold text-green-300">
              {readinessLabel}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden mt-4">
            <div className="h-full rounded-full bg-gradient-to-r from-green-400 via-cyan-400 to-blue-500" style={{ width: `${Math.max(8, readinessScore)}%` }}></div>
          </div>
          <p className="text-xs text-gray-400 mt-3">{weekLabel}</p>
        </div>
      </div>

      {actionButtons.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-5">
          {actionButtons.map((action) => (
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
      )}

      <div className="grid gap-4 xl:grid-cols-[1.15fr,0.85fr] mt-6">
        <div className="rounded-[26px] border border-white/10 bg-black/20 p-5">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 size={16} className="text-green-400" />
            <p className="text-sm font-bold text-white">Checklist de equipe campea</p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {checklistItems.map((item) => (
              <div key={item.label} className={`rounded-2xl border p-4 ${item.ready ? 'border-green-500/20 bg-green-500/10' : 'border-white/10 bg-white/5'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-white">{item.label}</p>
                    <p className="text-xs text-gray-300 mt-2 leading-relaxed">{item.detail}</p>
                  </div>
                  <span className={`rounded-xl border px-2 py-1 ${item.ready ? 'border-green-500/20 bg-green-500/10 text-green-300' : 'border-white/10 bg-black/20 text-gray-400'}`}>
                    {item.icon}
                  </span>
                </div>
                <div className="mt-4">
                  <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.18em] font-bold ${item.ready ? 'border-green-500/20 bg-green-500/10 text-green-300' : 'border-orange-500/20 bg-orange-500/10 text-orange-200'}`}>
                    {item.ready ? 'Pronto' : 'Ajustar'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[26px] border border-white/10 bg-black/20 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target size={16} className="text-yellow-400" />
            <p className="text-sm font-bold text-white">Foco tatico de agora</p>
          </div>

          <div className="space-y-3">
            {focusItems.map((item, index) => (
              <div key={`${item.title}-${index}`} className={`rounded-2xl border p-4 ${item.tone}`}>
                <p className="text-sm font-bold">{item.title}</p>
                <p className="text-xs mt-2 leading-relaxed opacity-90">{item.detail}</p>
                {item.onClick ? (
                  <button onClick={item.onClick} className="mt-3 rounded-xl border border-current/20 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] hover:bg-black/20 transition-colors">
                    {item.actionLabel}
                  </button>
                ) : null}
              </div>
            ))}

            {focusItems.length === 0 && (
              <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-4 text-green-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <p className="text-sm font-bold">Operacao estabilizada</p>
                </div>
                <p className="text-xs mt-2 leading-relaxed">
                  Sem gargalos imediatos. Aproveitem para refinar apresentacao, registrar iteracoes e elevar o nivel de detalhes da equipe.
                </p>
              </div>
            )}

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={15} className="text-orange-400" />
                <p className="text-sm font-bold">Regra de equipe campea</p>
              </div>
              <p className="text-xs leading-relaxed">
                O torneio recompensa consistencia. Tudo o que a equipe diz precisa aparecer em evidencia, treino, rubrica, codigo ou impacto real.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default CompetitionPrepPanel;
