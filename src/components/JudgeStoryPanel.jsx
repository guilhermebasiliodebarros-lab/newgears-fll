import React from 'react';
import { MessageSquare, Sparkles, Mic, CheckCircle2 } from 'lucide-react';

const JudgeStoryPanel = ({
  eyebrow = 'Roteiro para Juizes',
  title,
  summary,
  cards,
  spotlightQuestion,
}) => (
  <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-br from-[#1f1422] via-[#151520] to-[#101018] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(236,72,153,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(96,165,250,0.10),transparent_32%)] pointer-events-none"></div>

    <div className="relative z-10">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-pink-500/20 bg-pink-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-pink-300">
            <MessageSquare size={12} /> {eyebrow}
          </span>
          <h3 className="text-2xl font-black text-white mt-4 leading-tight">{title}</h3>
          <p className="text-sm text-gray-300 mt-3 max-w-3xl leading-relaxed">{summary}</p>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-black/25 p-4 min-w-[220px]">
          <div className="flex items-center gap-2 mb-2">
            <Mic size={16} className="text-amber-400" />
            <p className="text-sm font-bold text-white">Pergunta de treino</p>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">{spotlightQuestion}</p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3 mt-6">
        {cards.map((card) => (
          <div key={card.title} className={`rounded-[26px] border p-5 ${card.tone}`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] font-bold opacity-80">{card.label}</p>
                <h4 className="text-lg font-black text-white mt-2">{card.title}</h4>
              </div>
              <span className="rounded-xl border border-current/20 px-2 py-1">{card.icon}</span>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 mt-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500 font-bold">Pitch de 30 segundos</p>
              <p className="text-sm text-white mt-3 leading-relaxed">{card.pitch}</p>
            </div>

            <div className="space-y-2 mt-4">
              {card.proofs.map((proof, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="mt-0.5 text-green-400 shrink-0" />
                  <p className="text-xs text-gray-200 leading-relaxed">{proof}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-[26px] border border-white/10 bg-white/5 p-5 mt-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-yellow-400" />
          <p className="text-sm font-bold text-white">Regra de ouro da apresentacao</p>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed">
          A fala mais forte e a que conecta problema, processo, teste, melhoria e impacto em uma linha continua. Se a equipe consegue explicar isso com calma e exemplos, ela parece preparada.
        </p>
      </div>
    </div>
  </section>
);

export default JudgeStoryPanel;
