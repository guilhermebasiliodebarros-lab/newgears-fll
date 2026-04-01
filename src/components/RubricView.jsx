import React from 'react';
import { Search, Lightbulb, Wrench, RotateCcw, Megaphone, AlertTriangle, ArrowUpRight, CheckCircle2, Sparkles, Target } from 'lucide-react';

const SCORE_LEVELS = [
  {
    value: 1,
    label: 'Fase Inicial',
    shortLabel: 'Inicial',
    tone: 'border-gray-500/20 bg-gray-500/10 text-gray-200',
    activeTone: 'border-gray-300/40 bg-gray-300/15 text-white shadow-[0_0_18px_rgba(255,255,255,0.08)]'
  },
  {
    value: 2,
    label: 'Em Desenvolvimento',
    shortLabel: 'Desenvolvimento',
    tone: 'border-blue-500/20 bg-blue-500/10 text-blue-100',
    activeTone: 'border-blue-400/40 bg-blue-500/15 text-white shadow-[0_0_18px_rgba(59,130,246,0.16)]'
  },
  {
    value: 3,
    label: 'Finalizado',
    shortLabel: 'Finalizado',
    tone: 'border-green-500/20 bg-green-500/10 text-green-100',
    activeTone: 'border-green-400/40 bg-green-500/15 text-white shadow-[0_0_18px_rgba(34,197,94,0.18)]'
  },
  {
    value: 4,
    label: 'Excedente',
    shortLabel: 'Excedente',
    tone: 'border-yellow-500/20 bg-yellow-500/10 text-yellow-100',
    activeTone: 'border-yellow-400/40 bg-yellow-500/15 text-white shadow-[0_0_18px_rgba(234,179,8,0.18)]'
  }
];

const getScoreMeta = (score) => SCORE_LEVELS.find((level) => level.value === score) || SCORE_LEVELS[0];

const getRubricSummary = (items, values) => {
  const total = items.reduce((sum, item) => sum + (values[item.key] || 1), 0);
  const average = total / items.length;
  const progress = (average / 4) * 100;

  let label = 'Fase Inicial';
  if (average >= 3.5) label = 'Excedente';
  else if (average >= 2.5) label = 'Finalizado';
  else if (average >= 1.5) label = 'Em Desenvolvimento';

  return { average: average.toFixed(1), progress, label };
};

const getRubricDiagnostics = (items, values) => {
  const entries = items.map((item) => {
    const currentScore = values[item.key] || 1;
    const targetScore = currentScore >= 4 ? 4 : currentScore >= 3 ? 4 : 3;

    return {
      item,
      currentScore,
      targetScore,
      currentMeta: getScoreMeta(currentScore),
      targetMeta: getScoreMeta(targetScore),
      guidance: currentScore >= 4 ? item.levels[4] : item.levels[targetScore]
    };
  });

  const belowFinalized = entries.filter((entry) => entry.currentScore < 3);
  const finalized = entries.filter((entry) => entry.currentScore === 3);
  const exceeded = entries.filter((entry) => entry.currentScore === 4);
  const readinessToFinalized = Math.round((entries.filter((entry) => entry.currentScore >= 3).length / entries.length) * 100);
  const readinessToExceeded = Math.round((entries.filter((entry) => entry.currentScore === 4).length / entries.length) * 100);

  let headline = 'Diagnostico em andamento';
  let detail = 'A rubrica esta mapeando onde a equipe precisa concentrar esforco agora.';

  if (belowFinalized.length > 0) {
    headline = `${belowFinalized.length} criterio(s) abaixo de Finalizado`;
    detail = 'Prioridade imediata: levar esses criterios ao nivel 3 para fortalecer a apresentacao e a consistencia da equipe.';
  } else if (finalized.length > 0) {
    headline = 'Base forte para buscar Excedente';
    detail = 'Todos os criterios ja chegaram ao nivel Finalizado. Agora o foco e aprofundar evidencias e refinar a entrega para surpreender os juizes.';
  } else {
    headline = 'Rubrica em nivel Excedente';
    detail = 'A equipe esta no topo desta rubrica. O trabalho agora e manter evidencias concretas e uma apresentacao consistente do processo.';
  }

  const priorities = [...(belowFinalized.length > 0 ? belowFinalized : finalized.length > 0 ? finalized : entries)]
    .sort((a, b) => a.currentScore - b.currentScore || a.item.name.localeCompare(b.item.name))
    .slice(0, 3)
    .map((entry) => ({
      ...entry,
      actionTitle: entry.currentScore >= 4
        ? 'Manter nivel Excedente'
        : entry.currentScore >= 3
          ? `Lapidar de ${entry.currentScore} para 4`
          : `Subir de ${entry.currentScore} para 3`
    }));

  return {
    headline,
    detail,
    readinessToFinalized,
    readinessToExceeded,
    counts: {
      initial: entries.filter((entry) => entry.currentScore === 1).length,
      developing: entries.filter((entry) => entry.currentScore === 2).length,
      finalized: finalized.length,
      exceeded: exceeded.length
    },
    priorities
  };
};

const INNOVATION_RUBRIC_ITEMS = [
  {
    key: 'identificacao',
    name: 'Identificacao',
    icon: <Search size={16} />,
    color: 'text-blue-400',
    focus: 'Definir o problema e comprovar a pesquisa.',
    prompt: 'A equipe identificou um problema claro e sustentado por pesquisa.',
    levels: {
      1: [
        'O problema ainda nao esta definido com clareza.',
        'Ha evidencia minima de pesquisa.'
      ],
      2: [
        'O problema esta parcialmente claro.',
        'Ha pesquisa parcial em uma ou mais fontes.'
      ],
      3: [
        'O problema esta claramente definido.',
        'A pesquisa esta detalhada e usa varias fontes.'
      ],
      4: [
        'A rubrica oficial pede que os juizes expliquem como a equipe excedeu o esperado.',
        'Para ir alem do 3, mostrem profundidade extra, consistencia e evidencias mais fortes.'
      ]
    }
  },
  {
    key: 'design',
    name: 'Design',
    icon: <Lightbulb size={16} />,
    color: 'text-yellow-400',
    focus: 'Planejamento eficaz e participacao real do time.',
    prompt: 'A equipe trabalhou junta para planejar o projeto e desenvolver as ideias.',
    levels: {
      1: [
        'Quase nao ha evidencia de um plano de projeto eficaz.',
        'O envolvimento de todos os integrantes ainda aparece muito pouco.'
      ],
      2: [
        'Ha evidencia parcial de um plano de projeto eficaz.',
        'O envolvimento de todos os integrantes aparece de forma parcial.'
      ],
      3: [
        'Ha evidencia clara de um plano de projeto eficaz.',
        'O desenvolvimento envolveu claramente todos os integrantes.'
      ],
      4: [
        'Os juizes registram por escrito como o time foi alem do esperado nesta area.',
        'Para exceder, o planejamento precisa ser muito consistente e a colaboracao deve ficar nitida.'
      ]
    }
  },
  {
    key: 'criacao',
    name: 'Criacao',
    icon: <Wrench size={16} />,
    color: 'text-pink-400',
    focus: 'Inovacao da solucao e qualidade do prototipo.',
    prompt: 'A equipe criou uma ideia original ou evoluiu uma existente com prototipo, desenho ou modelo.',
    levels: {
      1: [
        'A inovacao da solucao foi pouco explicada.',
        'O modelo ou desenho ainda nao representa bem a solucao.'
      ],
      2: [
        'A equipe explicou de forma simples o que ha de inovador na solucao.',
        'O modelo ou desenho representa a solucao de forma simples.'
      ],
      3: [
        'A equipe explicou com detalhes o que ha de inovador na solucao.',
        'O modelo ou desenho representa a solucao com clareza e detalhes.'
      ],
      4: [
        'A nota 4 depende de os juizes escreverem como a criacao excedeu o nivel esperado.',
        'Para exceder, a inovacao e o prototipo precisam ir alem do nivel 3 de modo muito evidente.'
      ]
    }
  },
  {
    key: 'iteracao',
    name: 'Iteracao',
    icon: <RotateCcw size={16} />,
    color: 'text-green-400',
    focus: 'Compartilhar, ouvir feedback e melhorar.',
    prompt: 'A equipe compartilhou a ideia com outras pessoas, coletou retorno e aplicou melhorias.',
    levels: {
      1: [
        'A solucao quase nao foi compartilhada com outras pessoas ou grupos.',
        'Quase nao ha evidencia de melhorias com base em feedback.'
      ],
      2: [
        'A solucao foi compartilhada com pelo menos uma pessoa ou grupo.',
        'Ha evidencia parcial de melhorias a partir do feedback.'
      ],
      3: [
        'A solucao foi compartilhada com varios grupos ou pessoas.',
        'Ha evidencia clara de melhorias feitas a partir do feedback.'
      ],
      4: [
        'A rubrica oficial pede um comentario especifico sobre como a iteracao excedeu.',
        'Para exceder, mostrem um ciclo de feedback forte, repetido e muito bem aplicado.'
      ]
    }
  },
  {
    key: 'comunicacao',
    name: 'Comunicacao',
    icon: <Megaphone size={16} />,
    color: 'text-purple-400',
    focus: 'Explicar a solucao, o impacto e mostrar orgulho do processo.',
    prompt: 'A equipe apresentou bem a solucao, seu impacto e celebrou o proprio progresso.',
    levels: {
      1: [
        'A explicacao da solucao e do impacto ainda esta confusa.',
        'A apresentacao mostra pouco orgulho ou entusiasmo.'
      ],
      2: [
        'A explicacao da solucao e do impacto esta parcialmente clara.',
        'A apresentacao mostra algum orgulho ou entusiasmo.'
      ],
      3: [
        'A explicacao da solucao e do impacto esta clara.',
        'A apresentacao demonstra claramente orgulho e entusiasmo.'
      ],
      4: [
        'Na nota 4, os juizes precisam registrar de que forma a comunicacao foi alem do esperado.',
        'Para exceder, a apresentacao precisa ser marcante, clara e muito bem sustentada.'
      ]
    }
  }
];

const ROBOT_DESIGN_RUBRIC_ITEMS = [
  {
    key: 'identificacao',
    name: 'Identificacao',
    icon: <Search size={16} />,
    color: 'text-blue-400',
    focus: 'Estrategia de missao e uso claro de recursos de construcao ou codificacao.',
    prompt: 'A equipe definiu quais missoes tentaria, explorou recursos de construcao e codigo e buscou orientacao quando preciso.',
    levels: {
      1: [
        'Ha evidencia minima de estrategia de missao.',
        'O uso de recursos de construcao ou codificacao ainda e muito limitado.'
      ],
      2: [
        'Ha evidencia parcial de estrategia de missao.',
        'Existe algum uso de recursos de construcao ou codificacao.'
      ],
      3: [
        'Ha evidencia clara de estrategia de missao.',
        'Existe uso claro de recursos de construcao ou codificacao apoiando a estrategia de missoes.'
      ],
      4: [
        'A nota 4 exige que os juizes escrevam como a equipe excedeu o esperado nesta identificacao.',
        'Para exceder, a estrategia precisa estar muito madura e extremamente bem sustentada por evidencias.'
      ]
    }
  },
  {
    key: 'design',
    name: 'Design',
    icon: <Lightbulb size={16} />,
    color: 'text-yellow-400',
    focus: 'Colaboracao da equipe e desenvolvimento tecnico de todos.',
    prompt: 'Os membros trabalharam juntos no design e desenvolveram habilidades de construcao e codigo.',
    levels: {
      1: [
        'Quase nao ha evidencia de que todos contribuam com ideias.',
        'As habilidades de construcao e codigo ainda aparecem muito pouco em todos os integrantes.'
      ],
      2: [
        'Ha evidencia parcial de contribuicao de todos com ideias.',
        'Ha evidencia parcial de habilidades de construcao e codigo em todos.'
      ],
      3: [
        'Ha evidencia clara de contribuicao de todos com ideias.',
        'Ha evidencia clara de habilidades de construcao e codigo em todos os integrantes.'
      ],
      4: [
        'A rubrica oficial pede um comentario especifico para justificar o excedente.',
        'Para exceder, a colaboracao tecnica do time precisa ir alem do nivel 3 de forma muito nitida.'
      ]
    }
  },
  {
    key: 'criacao',
    name: 'Criacao',
    icon: <Wrench size={16} />,
    color: 'text-pink-400',
    focus: 'Anexos, codigo e sensores alinhados a estrategia.',
    prompt: 'A equipe criou designs originais ou melhorou os existentes conforme sua estrategia de missoes.',
    levels: {
      1: [
        'A explicacao dos anexos e de sua funcao ainda esta pouco clara.',
        'A explicacao do codigo e do uso de sensores ainda esta pouco clara.'
      ],
      2: [
        'Os anexos e sua funcao foram explicados de forma simples.',
        'O codigo e o uso de sensores foram explicados de forma simples.'
      ],
      3: [
        'Os anexos inovadores e sua funcao foram explicados com clareza.',
        'O codigo inovador e o uso de sensores foram explicados com clareza.'
      ],
      4: [
        'Na nota 4, os juizes descrevem o que tornou a criacao acima do esperado.',
        'Para exceder, os anexos e o codigo precisam mostrar refinamento e inovacao acima do nivel 3.'
      ]
    }
  },
  {
    key: 'iteracao',
    name: 'Iteracao',
    icon: <RotateCcw size={16} />,
    color: 'text-green-400',
    focus: 'Testes repetidos e melhorias reais baseadas nos testes.',
    prompt: 'A equipe testou repetidamente o robo e o codigo, identificou melhorias e aplicou os aprendizados.',
    levels: {
      1: [
        'Ha evidencia minima de testes do robo e do codigo.',
        'Ha evidencia minima de melhorias baseadas nos testes.'
      ],
      2: [
        'Ha evidencia parcial de testes do robo e do codigo.',
        'Ha evidencia parcial de melhorias baseadas nos testes.'
      ],
      3: [
        'Ha evidencia clara de testes repetidos do robo e do codigo.',
        'Ha evidencia clara de melhorias baseadas nos testes.'
      ],
      4: [
        'A rubrica oficial pede que os juizes expliquem como a iteracao foi alem do esperado.',
        'Para exceder, o ciclo testar-ajustar-voltar a testar precisa estar muito forte e bem documentado.'
      ]
    }
  },
  {
    key: 'comunicacao',
    name: 'Comunicacao',
    icon: <Megaphone size={16} />,
    color: 'text-purple-400',
    focus: 'Explicar o processo, os aprendizados e mostrar orgulho pelo trabalho.',
    prompt: 'A equipe explicou o que aprendeu com o processo de design do robo e celebrou seu progresso.',
    levels: {
      1: [
        'A explicacao do processo e dos aprendizados ainda esta confusa.',
        'A equipe mostra pouco orgulho ou entusiasmo pelo trabalho.'
      ],
      2: [
        'A explicacao do processo e dos aprendizados esta simples, mas compreensivel.',
        'A equipe mostra algum orgulho ou entusiasmo.'
      ],
      3: [
        'A explicacao do processo e dos aprendizados esta detalhada.',
        'A equipe demonstra claramente orgulho e entusiasmo.'
      ],
      4: [
        'A nota 4 depende de os juizes registrarem como a comunicacao excedeu o esperado.',
        'Para exceder, a equipe precisa comunicar o processo com muita clareza, profundidade e seguranca.'
      ]
    }
  }
];

const RadarChart = ({ items, values, polygonFill, polygonStroke }) => {
  const size = 300;
  const center = size / 2;
  const radius = (size / 2) - 60;
  const maxVal = 4;
  const angleSlice = (Math.PI * 2) / items.length;

  const getCoords = (value, index) => {
    const angle = index * angleSlice - (Math.PI / 2);
    const r = (value / maxVal) * radius;

    return {
      x: center + Math.cos(angle) * r,
      y: center + Math.sin(angle) * r
    };
  };

  const points = items.map((item, index) => {
    const val = values[item.key] || 1;
    const { x, y } = getCoords(val, index);
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={size} height={size} className="mx-auto bg-black/20 rounded-full border border-white/5">
      {[1, 2, 3, 4].map((level) => (
        <circle
          key={level}
          cx={center}
          cy={center}
          r={(level / maxVal) * radius}
          fill="none"
          stroke="#333"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
      ))}

      {items.map((_, index) => {
        const { x, y } = getCoords(maxVal, index);
        return <line key={index} x1={center} y1={center} x2={x} y2={y} stroke="#333" strokeWidth="1" />;
      })}

      <polygon points={points} fill={polygonFill} stroke={polygonStroke} strokeWidth="2" />

      {items.map((item, index) => {
        const val = values[item.key] || 1;
        const { x, y } = getCoords(val, index);
        return <circle key={item.key} cx={x} cy={y} r="4" fill={polygonStroke} />;
      })}

      {items.map((item, index) => {
        const { x, y } = getCoords(maxVal + 1.2, index);
        return (
          <text
            key={item.key}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize="10"
            fontWeight="bold"
          >
            {item.name}
          </text>
        );
      })}
    </svg>
  );
};

const ScoreLegend = () => (
  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
    <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">Escala Oficial Adaptada</p>
        <p className="text-sm text-gray-200 mt-1">Os alunos podem consultar aqui o que normalmente caracteriza cada nota da rubrica.</p>
      </div>
      <div className="text-[10px] text-gray-500 uppercase font-bold">1 a 4</div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
      {SCORE_LEVELS.map((level) => (
        <div key={level.value} className={`rounded-xl border p-3 ${level.tone}`}>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-sm font-black">{level.value}</span>
            <span className="text-[10px] uppercase tracking-[0.18em] font-bold">{level.shortLabel}</span>
          </div>
          <p className="text-sm font-bold">{level.label}</p>
        </div>
      ))}
    </div>

    <p className="text-xs text-gray-400 mt-3">
      Nota 4: a rubrica oficial nao traz um checklist fixo. Ela pede que os juizes expliquem como a equipe excedeu o esperado.
    </p>
  </div>
);

const RubricDiagnosticPanel = ({ items, values, accentColor }) => {
  const diagnostics = getRubricDiagnostics(items, values);

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className={`text-[10px] uppercase tracking-[0.2em] font-bold ${accentColor}`}>Diagnostico Automatico</p>
          <h4 className="text-white font-bold text-lg mt-2">{diagnostics.headline}</h4>
          <p className="text-sm text-gray-300 mt-2 max-w-3xl">{diagnostics.detail}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 min-w-[220px]">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <span className="text-[10px] uppercase tracking-[0.18em] text-gray-500 font-bold">Pronto p/ 3</span>
            <div className="flex items-end justify-between gap-2 mt-2">
              <span className="text-2xl font-black text-white">{diagnostics.readinessToFinalized}%</span>
              <Target size={16} className="text-green-400" />
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <span className="text-[10px] uppercase tracking-[0.18em] text-gray-500 font-bold">Pronto p/ 4</span>
            <div className="flex items-end justify-between gap-2 mt-2">
              <span className="text-2xl font-black text-white">{diagnostics.readinessToExceeded}%</span>
              <Sparkles size={16} className="text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mt-4">
        <div className="rounded-xl border border-gray-500/20 bg-gray-500/10 p-3">
          <span className="text-[10px] uppercase tracking-[0.18em] text-gray-300 font-bold">Fase Inicial</span>
          <p className="text-2xl font-black text-white mt-2">{diagnostics.counts.initial}</p>
        </div>
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-3">
          <span className="text-[10px] uppercase tracking-[0.18em] text-blue-200 font-bold">Desenvolvimento</span>
          <p className="text-2xl font-black text-white mt-2">{diagnostics.counts.developing}</p>
        </div>
        <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-3">
          <span className="text-[10px] uppercase tracking-[0.18em] text-green-200 font-bold">Finalizado</span>
          <p className="text-2xl font-black text-white mt-2">{diagnostics.counts.finalized}</p>
        </div>
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-3">
          <span className="text-[10px] uppercase tracking-[0.18em] text-yellow-200 font-bold">Excedente</span>
          <p className="text-2xl font-black text-white mt-2">{diagnostics.counts.exceeded}</p>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={16} className="text-orange-400" />
          <p className="text-sm font-bold text-white">Prioridades automaticas desta rubrica</p>
        </div>

        <div className="grid gap-3 xl:grid-cols-3">
          {diagnostics.priorities.map((priority) => (
            <div key={priority.item.key} className="rounded-2xl border border-white/10 bg-[#101018] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className={`font-bold text-sm flex items-center gap-2 ${priority.item.color}`}>
                    {priority.item.icon} {priority.item.name}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-2">{priority.actionTitle}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-bold ${priority.currentMeta.tone}`}>
                    {priority.currentScore}
                  </span>
                  <div className="flex items-center justify-end gap-1 text-gray-500 mt-1">
                    <ArrowUpRight size={12} />
                    <span className="text-[10px] font-bold">{priority.targetScore}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mt-4">
                {priority.guidance.map((line, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="mt-0.5 text-green-400 shrink-0" />
                    <p className="text-xs text-gray-200 leading-relaxed">{line}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const RubricCriterionCard = ({ item, value, rubricType, handleRubricUpdate }) => {
  const currentScore = value || 1;
  const currentMeta = getScoreMeta(currentScore);
  const targetLevel = currentScore >= 3 ? 4 : 3;
  const targetMeta = getScoreMeta(targetLevel);
  const targetTitle = currentScore >= 3 ? 'Como buscar nota 4' : 'Como buscar nota 3';
  const targetGuidance = currentScore >= 3 ? item.levels[4] : item.levels[3];
  const diagnosticText = currentScore >= 4
    ? 'A equipe ja esta em Excedente neste criterio. O foco agora e manter exemplos fortes e evidencias concretas para sustentar esse nivel.'
    : currentScore >= 3
      ? 'A equipe ja atingiu o nivel Finalizado. Agora o desafio e demonstrar algo acima do esperado pelos juizes.'
      : 'A equipe ainda nao atingiu o nivel Finalizado neste criterio. O diagnostico abaixo mostra exatamente o que falta consolidar.';

  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-4 md:p-5">
      <div className="grid gap-5 xl:grid-cols-[320px,1fr]">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className={`font-bold text-base flex items-center gap-2 ${item.color}`}>
                {item.icon} {item.name}
              </div>
              <p className="text-xs text-gray-400 mt-2">{item.prompt}</p>
            </div>
            <span className={`shrink-0 rounded-xl border px-3 py-2 text-right ${currentMeta.activeTone}`}>
              <span className="block text-[10px] uppercase tracking-[0.18em] font-bold">Nota Atual</span>
              <span className="block text-lg font-black">{currentScore}</span>
              <span className="block text-[11px] font-bold">{currentMeta.label}</span>
            </span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#101018] p-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[10px] uppercase tracking-[0.18em] text-gray-500 font-bold">Ajuste da Nota</span>
              <span className="text-xs text-gray-300">{item.focus}</span>
            </div>

            <input
              type="range"
              min="1"
              max="4"
              value={currentScore}
              onChange={(e) => handleRubricUpdate(rubricType, item.key, e.target.value)}
              className={`w-full h-2 rounded-lg appearance-none cursor-pointer slider-${item.key} bg-gray-700`}
            />

            <div className="grid grid-cols-4 gap-2 mt-3 text-[10px]">
              {SCORE_LEVELS.map((level) => (
                <div
                  key={level.value}
                  className={`rounded-lg border px-2 py-2 text-center ${currentScore === level.value ? level.activeTone : level.tone}`}
                >
                  <span className="block font-black">{level.value}</span>
                  <span className="block mt-1">{level.shortLabel}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={`rounded-2xl border p-4 ${targetMeta.tone}`}>
            <p className="text-[10px] uppercase tracking-[0.18em] font-bold mb-2">Diagnostico automatico</p>
            <p className="text-sm font-bold mb-2">{targetTitle}</p>
            <p className="text-xs leading-relaxed opacity-90 mb-3">{diagnosticText}</p>
            <div className="space-y-2">
              {targetGuidance.map((line, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-current opacity-80"></span>
                  <p className="text-sm">{line}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-3">
          {SCORE_LEVELS.map((level) => {
            const isActive = currentScore === level.value;

            return (
              <div
                key={level.value}
                className={`rounded-2xl border p-4 transition-all duration-300 ${isActive ? level.activeTone : level.tone}`}
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] font-bold">Nota {level.value}</p>
                    <p className="text-sm font-black mt-1">{level.label}</p>
                  </div>
                  <span className="text-xl font-black opacity-90">{level.value}</span>
                </div>

                <div className="space-y-2">
                  {item.levels[level.value].map((line, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-current opacity-80"></span>
                      <p className="text-xs leading-relaxed">{line}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const RubricSection = ({
  title,
  titleIcon,
  titleColor,
  summaryAccent,
  summaryBorder,
  summaryGradient,
  polygonFill,
  polygonStroke,
  items,
  values,
  rubricType,
  handleRubricUpdate
}) => {
  const summary = getRubricSummary(items, values);

  return (
    <div className="bg-[#151520] border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">{titleIcon} {title}</h3>
          <p className="text-sm text-gray-400 mt-2">Use a nota para registrar o nivel atual da equipe e o guia ao lado para mostrar exatamente o que precisa evoluir.</p>
        </div>

        <div className={`rounded-2xl border ${summaryBorder} bg-black/30 p-4 min-w-[220px]`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[10px] uppercase tracking-[0.2em] font-bold ${summaryAccent}`}>Media Geral</span>
            <span className="text-white font-black text-xl">
              {summary.average}
              <span className="text-xs text-gray-500 ml-1">/4</span>
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-black/60 overflow-hidden mb-2">
            <div className={`h-full rounded-full ${summaryGradient}`} style={{ width: `${summary.progress}%` }}></div>
          </div>

          <p className="text-xs text-gray-300">{summary.label}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px,1fr] mb-6">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className={`text-[10px] uppercase tracking-[0.2em] font-bold mb-4 ${titleColor}`}>Radar da Rubrica</p>
          <RadarChart items={items} values={values} polygonFill={polygonFill} polygonStroke={polygonStroke} />
        </div>

        <div className="space-y-6">
          <ScoreLegend />
          <RubricDiagnosticPanel items={items} values={values} accentColor={titleColor} />
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <RubricCriterionCard
            key={item.key}
            item={item}
            value={values[item.key] || 1}
            rubricType={rubricType}
            handleRubricUpdate={handleRubricUpdate}
          />
        ))}
      </div>
    </div>
  );
};

const RubricView = ({
  innovationRubric,
  robotDesignRubric,
  handleRubricUpdate
}) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <RubricSection
        title="Rubrica: Projeto de Inovacao"
        titleIcon={<Lightbulb className="text-yellow-500" />}
        titleColor="text-yellow-400"
        summaryAccent="text-yellow-400"
        summaryBorder="border-yellow-500/20"
        summaryGradient="bg-gradient-to-r from-yellow-500 via-orange-400 to-pink-500"
        polygonFill="rgba(234, 179, 8, 0.3)"
        polygonStroke="#eab308"
        items={INNOVATION_RUBRIC_ITEMS}
        values={innovationRubric}
        rubricType="innovation"
        handleRubricUpdate={handleRubricUpdate}
      />

      <RubricSection
        title="Rubrica: Design do Robo"
        titleIcon={<Wrench className="text-blue-500" />}
        titleColor="text-blue-400"
        summaryAccent="text-blue-400"
        summaryBorder="border-blue-500/20"
        summaryGradient="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500"
        polygonFill="rgba(59, 130, 246, 0.3)"
        polygonStroke="#3b82f6"
        items={ROBOT_DESIGN_RUBRIC_ITEMS}
        values={robotDesignRubric}
        rubricType="robot_design"
        handleRubricUpdate={handleRubricUpdate}
      />
    </div>
  );
};

export default RubricView;
