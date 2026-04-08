import React from 'react';
import { AlertTriangle, CheckCircle2, Shield, Sparkles, Target } from 'lucide-react';

const CompetitionPrepPanel = ({
  eyebrow = 'Preparacao para Torneio',
  title,
  summary,
  readinessScore,
  readinessLabel,
  weekLabel,
  checklistItems,
  focusItems,
  actionButtons = [],
}) => {
  const readyCount = checklistItems.filter((item) => item.ready).length;
  const totalItems = checklistItems.length || 1;
  const readinessTone =
    readinessScore >= 85
      ? 'border-emerald-400/25 bg-emerald-400/12 text-emerald-100'
      : readinessScore >= 60
        ? 'border-yellow-400/25 bg-yellow-400/12 text-yellow-100'
        : 'border-rose-400/25 bg-rose-400/12 text-rose-100';

  return (
    <section className="newgears-major-panel relative overflow-hidden rounded-[36px] border border-white/10 bg-[linear-gradient(135deg,rgba(12,18,30,0.98),rgba(9,11,18,0.98))] p-6 shadow-[0_28px_96px_rgba(0,0,0,0.34)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px),radial-gradient(circle_at_top_right,rgba(103,245,181,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(71,214,255,0.16),transparent_32%),radial-gradient(circle_at_center,rgba(255,217,95,0.08),transparent_40%)] bg-[size:24px_24px,24px_24px,auto,auto,auto]" />

      <div className="relative z-10 space-y-6">
        <div className="grid gap-6 xl:grid-cols-[1.08fr,0.92fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-green-300">
              <Shield size={12} />
              {eyebrow}
            </span>
            <h3 className="newgears-display mt-4 text-3xl font-black leading-tight text-white">{title}</h3>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-gray-300">{summary}</p>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <div className={`rounded-[26px] border p-4 shadow-[0_18px_34px_rgba(0,0,0,0.16)] ${readinessTone}`}>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] opacity-80">Prontidao</p>
                <p className="newgears-display mt-3 text-3xl font-black text-white">{readinessScore}%</p>
                <p className="mt-2 text-xs leading-relaxed opacity-90">{readinessLabel}</p>
              </div>

              <div className="rounded-[26px] border border-cyan-400/20 bg-cyan-400/10 p-4 shadow-[0_18px_34px_rgba(0,0,0,0.16)]">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100/80">Blocos prontos</p>
                <p className="newgears-display mt-3 text-3xl font-black text-white">{readyCount}/{totalItems}</p>
                <p className="mt-2 text-xs leading-relaxed text-cyan-50/80">Partes do time que ja estao prontas para defender no torneio.</p>
              </div>

              <div className="rounded-[26px] border border-purple-400/20 bg-purple-400/10 p-4 shadow-[0_18px_34px_rgba(0,0,0,0.16)]">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-purple-100/80">Janela de treino</p>
                <p className="mt-3 text-lg font-black text-white">{weekLabel}</p>
                <p className="mt-2 text-xs leading-relaxed text-purple-50/80">Semana para alinhar fala, prova e confianca do time.</p>
              </div>
            </div>

            {actionButtons.length > 0 ? (
              <div className="mt-6 flex flex-wrap gap-3">
                {actionButtons.map((action) => (
                  <button
                    key={action.label}
                    onClick={action.onClick}
                    className={`inline-flex items-center gap-2 rounded-[18px] border px-4 py-3 text-xs font-black uppercase tracking-[0.14em] transition-all hover:-translate-y-0.5 ${action.style}`}
                  >
                    {action.icon}
                    {action.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="rounded-[32px] border border-white/10 bg-black/22 p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Radar do torneio</p>
                <p className="newgears-display mt-2 text-xl font-black text-white">Barra de energia da equipe</p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${readinessTone}`}>
                {readinessLabel}
              </span>
            </div>

            <div className="mt-5 rounded-[26px] border border-white/10 bg-white/5 p-4">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-500">Energia atual</p>
                  <p className="newgears-display mt-2 text-4xl font-black text-white">{readinessScore}%</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/25 px-3 py-2 text-xs font-black text-gray-200">
                  {readyCount} bloco(s) prontos
                </div>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-black/40">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500"
                  style={{ width: `${Math.max(10, readinessScore)}%` }}
                />
              </div>
              <p className="mt-3 text-xs leading-relaxed text-gray-400">
                Quanto mais cheia essa barra, mais facil fica entrar com calma, explicar bem e competir sem parecer perdido.
              </p>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[24px] border border-emerald-500/20 bg-emerald-500/10 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-100/80">Pronto para mostrar</p>
                <p className="newgears-display mt-3 text-2xl font-black text-white">{readyCount}</p>
                <p className="mt-2 text-xs leading-relaxed text-emerald-50/80">Blocos que ja seguram fala, treino e evidencia.</p>
              </div>
              <div className="rounded-[24px] border border-orange-400/20 bg-orange-400/10 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-100/80">Boost necessario</p>
                <p className="newgears-display mt-3 text-2xl font-black text-white">{Math.max(0, totalItems - readyCount)}</p>
                <p className="mt-2 text-xs leading-relaxed text-orange-50/80">Pontos que ainda merecem treino curto antes do torneio.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.1fr,0.9fr]">
          <div className="rounded-[32px] border border-white/10 bg-black/18 p-5">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-green-400" />
              <p className="text-sm font-black text-white">Checklist do time que entra pronto</p>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {checklistItems.map((item) => (
                <div
                  key={item.label}
                  className={`rounded-[24px] border p-4 transition-all ${
                    item.ready ? 'border-emerald-400/20 bg-emerald-400/10' : 'border-white/10 bg-white/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-white">{item.label}</p>
                      <p className="mt-2 text-xs leading-relaxed text-gray-200">{item.detail}</p>
                    </div>
                    <span className={`rounded-2xl border px-2.5 py-2 ${item.ready ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200' : 'border-orange-400/20 bg-orange-400/10 text-orange-200'}`}>
                      {item.icon}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${item.ready ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100' : 'border-orange-400/20 bg-orange-400/10 text-orange-100'}`}>
                      {item.ready ? 'Liberado' : 'Treinar'}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-500">
                      {item.ready ? 'XP garantido' : 'Pedindo foco'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-black/18 p-5">
            <div className="flex items-center gap-2">
              <Target size={16} className="text-yellow-400" />
              <p className="text-sm font-black text-white">Alertas da rodada</p>
            </div>

            <div className="mt-5 space-y-3">
              {focusItems.length > 0 ? (
                focusItems.map((item, index) => (
                  <div key={`${item.title}-${index}`} className={`rounded-[24px] border p-4 ${item.tone}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-black">{item.title}</p>
                        <p className="mt-2 text-xs leading-relaxed opacity-90">{item.detail}</p>
                      </div>
                      <div className="rounded-2xl border border-current/20 bg-black/15 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em]">
                        Alerta
                      </div>
                    </div>

                    {item.onClick ? (
                      <button
                        onClick={item.onClick}
                        className="mt-4 rounded-[16px] border border-current/20 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] transition-colors hover:bg-black/20"
                      >
                        {item.actionLabel}
                      </button>
                    ) : null}
                  </div>
                ))
              ) : (
                <div className="rounded-[24px] border border-emerald-400/20 bg-emerald-400/10 p-4 text-emerald-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    <p className="text-sm font-black">Equipe estabilizada</p>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed">
                    Sem gargalos urgentes. Esse e o momento perfeito para ensaiar a fala e transformar detalhe tecnico em confianca.
                  </p>
                </div>
              )}

              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-gray-200">
                <div className="flex items-center gap-2">
                  <Sparkles size={15} className="text-yellow-300" />
                  <p className="text-sm font-black">Regra de ouro da FLL</p>
                </div>
                <p className="mt-3 text-xs leading-relaxed">
                  Tudo o que a equipe promete precisa aparecer em prova real: teste, pratica, fala, imagem ou impacto. Clareza ganha de exagero.
                </p>
              </div>

              <div className="rounded-[24px] border border-rose-400/20 bg-rose-400/10 p-4 text-rose-50">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={15} className="text-rose-200" />
                  <p className="text-sm font-black">Sem cara de robozao corporativo</p>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-rose-50/90">
                  Falem como equipe real: simples, viva, com exemplos que os alunos consigam lembrar e repetir com seguranca.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompetitionPrepPanel;

