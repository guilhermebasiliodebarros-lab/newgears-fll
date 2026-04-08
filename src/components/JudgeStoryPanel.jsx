import React from 'react';
import { CheckCircle2, MessageSquare, Mic, Sparkles, Star } from 'lucide-react';

const JudgeStoryPanel = ({
  eyebrow = 'Treino com Juizes',
  title,
  summary,
  cards,
  spotlightQuestion,
}) => (
  <section className="newgears-major-panel relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-[#221428] via-[#151520] to-[#101018] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px),radial-gradient(circle_at_top_left,rgba(255,135,214,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(96,165,250,0.10),transparent_32%)] bg-[size:24px_24px,24px_24px,auto,auto]" />

    <div className="relative z-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-pink-500/20 bg-pink-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-pink-300">
            <MessageSquare size={12} />
            {eyebrow}
          </span>
          <h3 className="newgears-display mt-4 text-2xl font-black leading-tight text-white">{title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-gray-300">{summary}</p>
        </div>

        <div className="min-w-[220px] rounded-[24px] border border-white/10 bg-black/25 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Mic size={16} className="text-amber-400" />
            <p className="text-sm font-black text-white">Pergunta surpresa</p>
          </div>
          <p className="text-xs leading-relaxed text-gray-300">{spotlightQuestion}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        {cards.map((card) => (
          <div key={card.title} className={`rounded-[28px] border p-5 shadow-[0_18px_34px_rgba(0,0,0,0.16)] ${card.tone}`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] opacity-80">{card.label}</p>
                <h4 className="newgears-display mt-2 text-lg font-black text-white">{card.title}</h4>
              </div>
              <span className="rounded-xl border border-current/20 bg-black/12 px-2 py-2">{card.icon}</span>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-500">Pitch de 30 segundos</p>
              <p className="mt-3 text-sm leading-relaxed text-white">{card.pitch}</p>
            </div>

            <div className="mt-4 space-y-2">
              {card.proofs.map((proof, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-green-400" />
                  <p className="text-xs leading-relaxed text-gray-100">{proof}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr,0.85fr]">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles size={16} className="text-yellow-400" />
            <p className="text-sm font-black text-white">Regra de ouro da apresentacao</p>
          </div>
          <p className="text-sm leading-relaxed text-gray-300">
            A fala mais forte conecta problema, processo, teste, melhoria e impacto numa linha simples. Se ate o colega da equipe entende e consegue repetir, a narrativa esta boa.
          </p>
        </div>

        <div className="rounded-[28px] border border-yellow-400/20 bg-yellow-400/10 p-5">
          <div className="mb-3 flex items-center gap-2">
            <Star size={16} className="text-yellow-100" />
            <p className="text-sm font-black text-white">Dica de palco</p>
          </div>
          <p className="text-sm leading-relaxed text-yellow-50/90">
            Troquem frases longas por exemplos concretos. Juiz lembra mais de uma historia curta e verdadeira do que de um texto bonito demais.
          </p>
        </div>
      </div>
    </div>
  </section>
);

export default JudgeStoryPanel;

