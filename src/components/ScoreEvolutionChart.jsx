import { useContext, useState } from 'react';
import { TrendingUp, Trash2, Minimize, Maximize, ListTodo, UserCircle } from 'lucide-react';
import { clearTrainingHistory } from '../services/workspaceMutations';
import { ScoreEvolutionChartContext } from '../hooks/useScoreEvolutionChartContext';
export default function ScoreEvolutionChart({ isTvMode = false, tvModeVariant = 'default' }) {
      const {
          db,
          rounds,
          scoreHistory,
          showNotification,
          user,
          seasonId,
      } = useContext(ScoreEvolutionChartContext);
      // Estado local para filtrar o gráfico
      const [chartFilter, setChartFilter] = useState('score_total'); // 'score_total' ou ID do round
      const [isFullscreen, setIsFullscreen] = useState(false);
      const isTvFullRoundsView = isTvMode && tvModeVariant === 'full_rounds';

      // Prepara os dados baseado no filtro
      const isGeneral = chartFilter === 'score_total';
      const chartPalette = isTvMode
          ? {
              primary: "#D01BF1",
              secondary: "#6293E9",
              better: "#D01BF1",
              worse: "#6293E9",
              avg: "#E8D9FF",
              grid: "rgba(255,255,255,0.16)",
              tooltipBorder: "#5D58D3",
              tooltipSubtle: "#A5B8D7",
            }
          : {
              primary: "#22c55e",
              secondary: "#3b82f6",
              better: "#22c55e",
              worse: "#ef4444",
              avg: "#facc15",
              grid: "#333",
              tooltipBorder: "#555",
              tooltipSubtle: "#9ca3af",
            };
      let rawData = [];
      let color = chartPalette.primary;

      if (isGeneral) {
          // Pega apenas históricos de pontuação total
          rawData = scoreHistory.filter(h => !h.roundId && h.practiceType !== 'exit_practice');
      } else {
          // Pega histórico de TEMPO de um round específico
          rawData = scoreHistory.filter(h => h.roundId === chartFilter);
          color = chartPalette.secondary;
      }

      if (isTvFullRoundsView) {
          rawData = scoreHistory.filter(h => !h.roundId && h.practiceType !== 'exit_practice' && (h.practiceType === 'full_round' || h.time != null));
          color = chartPalette.secondary;
      }

      // --- FUNÇÃO PARA LIMPAR O GRÁFICO ATUAL ---
      const handleClearChart = async () => {
        if (user?.type !== 'admin') return;
        const confirmMsg = isGeneral
            ? "ZERAR o gráfico geral de Pontos/Tempo? Isso apaga todo o histórico da equipe."
            : "Limpar o histórico de tempos deste round?";

        if (!window.confirm(confirmMsg)) return;

        // Apaga apenas os documentos que estão sendo mostrados no gráfico agora
        try {
            await clearTrainingHistory({ db, user, seasonId, ids: rawData.map((entry) => entry.id) });
            showNotification("Histórico do gráfico limpo!", "success");
        } catch (error) {
            console.error("Erro ao limpar gráfico:", error);
            showNotification("Erro ao limpar.", "error");
        }
      };

      const data = [...rawData].sort((a,b) => new Date(a.date) - new Date(b.date));

      if (data.length < 2 && (isGeneral || isTvFullRoundsView)) return (
        <div className={`border rounded-2xl p-6 text-center text-sm flex flex-col items-center justify-center h-48 ${isTvMode ? 'bg-black/20 border-white/10 text-slate-300' : 'bg-[#151520] border-white/10 text-gray-500 mb-8'}`}>
            <TrendingUp size={32} className="mb-2 opacity-50"/>
            <p>{isTvFullRoundsView ? 'Registre pelo menos 2 rounds completos para acompanhar a meta de 2:30.' : 'Registre pelo menos 2 treinos para ver o grafico de evolucao.'}</p>
        </div>
      );

      const width = 800;
      const height = isTvFullRoundsView ? 188 : isTvMode ? 146 : 200;
      const padding = isTvFullRoundsView ? 16 : isTvMode ? 14 : 20;

      // Se for tempo, queremos ver cair (mas gráfico svg padrão sobe valores, então tratamos visualmente)
      const valKey = isTvFullRoundsView ? 'time' : chartFilter === 'score_total' ? 'score' : 'time';

      // ESCALAS (Máximos)
      const maxScore = Math.max(...data.map(d => d.score || 0), 100);
      const maxTime = Math.max(...data.map(d => d.time || 0), isGeneral ? 150 : 60); // 150s para geral, 60s para round

      // Função para converter dados em coordenadas X,Y
      const getX = (index) => padding + (index / (data.length - 1)) * (width - 2 * padding);

      // Y dinÃ¢mico (Pontos ou Tempo)
      const getY = (val, type = 'score') => {
          const max = type === 'time' ? maxTime : maxScore;
          return height - padding - ((val || 0) / max) * (height - 2 * padding);
      };

      // Cria o caminho da linha (path d)
      const pathDataMain = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d[valKey], isTvFullRoundsView ? 'time' : isGeneral ? 'score' : 'time')}`).join(' ');

      // Linha secundária (Tempo) apenas se for Geral
      const pathDataTime = isGeneral && !isTvFullRoundsView ? data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.time || 0, 'time')}`).join(' ') : "";

      // Cria o caminho para o preenchimento (area fill)
      const fillPathData = `${pathDataMain} L ${width - padding} ${height} L ${padding} ${height} Z`;

      // Cálculos de Média
      const avgScore = data.length > 0 ? (data.reduce((sum, d) => sum + (d.score || 0), 0) / data.length).toFixed(1) : 0;
      const avgTime = data.length > 0 ? (data.reduce((sum, d) => sum + (d.time || 0), 0) / data.length).toFixed(1) : 0;
      const recentGeneralAttempts = isGeneral
          ? [...data].filter((entry) => entry.practiceType === 'full_round').slice(-10)
          : [];
      const attemptsWithinLimit = isGeneral ? recentGeneralAttempts.filter((entry) => Number(entry.time) <= 150).length : 0;
      const consistencyLabel = isGeneral && recentGeneralAttempts.length > 0
          ? `${attemptsWithinLimit}/${recentGeneralAttempts.length} em 2:30`
          : '--';
      const recentTvRounds = isTvFullRoundsView ? data.slice(-10) : [];
      const tvWithinLimitCount = recentTvRounds.filter((entry) => Number(entry.time) <= 150).length;
      const tvConsistencyLabel = recentTvRounds.length > 0 ? `${tvWithinLimitCount}/${recentTvRounds.length}` : '--';
      const buildLocalDateKey = (value) => {
          const parsed = new Date(value);
          if (Number.isNaN(parsed.getTime())) return 'sem-data';
          const year = parsed.getFullYear();
          const month = String(parsed.getMonth() + 1).padStart(2, '0');
          const day = String(parsed.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
      };
      const roundsByDay = isTvFullRoundsView
          ? data.reduce((acc, entry) => {
                const key = buildLocalDateKey(entry.date);
                acc[key] = (acc[key] || 0) + 1;
                return acc;
            }, {})
          : {};
      const roundDays = Object.keys(roundsByDay);
      const roundsToday = roundsByDay[buildLocalDateKey(new Date())] || 0;
      const averageRoundsPerDay = roundDays.length > 0 ? (data.length / roundDays.length) : 0;

      // Coordenadas da Média para o Gradiente
      const currentAvg = isTvFullRoundsView ? parseFloat(avgTime) : isGeneral ? parseFloat(avgScore) : parseFloat(avgTime);
      const avgY = getY(currentAvg, isTvFullRoundsView ? 'time' : isGeneral ? 'score' : 'time');
      const avgPercent = Math.max(0, Math.min(100, (avgY / height) * 100));
      const tvTargetY = getY(150, 'time');

      const renderChartContent = () => (
          <>
              <div className={`${isTvMode ? 'mb-0 hidden' : 'ng-score-chart-header mb-6 flex items-center justify-between'}`}>
                  <h3 className={`text-white font-bold flex items-center gap-2 ${isFullscreen ? 'text-2xl' : ''}`}>
                      <TrendingUp style={{ color }}/> {isGeneral ? 'Evolução (Pontos vs Tempo)' : 'Melhoria de Tempo (Segundos)'}
                  </h3>

                  <div className="flex items-center gap-2">
                  {/* Botão de Limpar Histórico */}
                  {!isTvMode && user?.type === 'admin' && data.length > 0 && (
                      <button onClick={handleClearChart} className="p-2 text-gray-500 hover:text-red-500 hover:bg-white/5 rounded-lg transition-colors" title="Zerar este gráfico">
                          <Trash2 size={16}/>
                      </button>
                  )}

                  {/* BOTÃƒÆ’O TELA CHEIA */}
                  {!isTvMode && (
                      <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors" title={isFullscreen ? "Minimizar" : "Tela Cheia"}>
                          {isFullscreen ? <Minimize size={16}/> : <Maximize size={16}/>}
                      </button>
                  )}

                  {/* SELETOR DE GRÁFICO */}
                  {!isTvMode && (
                  <select aria-label="Selecionar grafico de treino"
                    className="bg-black/40 border border-white/20 text-xs text-white rounded-lg p-2 outline-none focus:border-blue-500"
                    value={chartFilter}
                    onChange={(e) => setChartFilter(e.target.value)}
                  >
                      <option value="score_total">📊 Pontuação Geral</option>
                      {rounds.map(r => (
                          <option key={r.id} value={r.id}>⏱️ Tempo: {r.name}</option>
                      ))}
                  </select>
                  )}
                  </div>
              </div>

              {data.length === 0 ? (
                  <div className={`flex items-center justify-center text-gray-500 text-xs italic border border-dashed border-white/10 rounded-xl ${isFullscreen ? 'flex-1 min-h-[400px]' : isTvMode ? 'h-28' : 'h-32'}`}>
                      Sem dados registrados para este gráfico ainda.
                  </div>
              ) : (
              <div className="w-full overflow-hidden relative flex-1 flex flex-col justify-center">
                  {isTvFullRoundsView ? (
                      <div className="mb-3 grid gap-2 md:grid-cols-3">
                          <div className="rounded-[18px] border border-[#6293E9]/20 bg-[#6293E9]/10 px-3 py-2.5">
                              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-200/68">Meta 2:30</p>
                              <p className="mt-1.5 text-lg font-black text-white">{tvConsistencyLabel}</p>
                              <p className="mt-1 text-[10px] text-slate-100/68">ultimos 10 rounds dentro do tempo</p>
                          </div>
                          <div className="rounded-[18px] border border-[#5D58D3]/20 bg-[#5D58D3]/10 px-3 py-2.5">
                              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-200/68">Hoje</p>
                              <p className="mt-1.5 text-lg font-black text-white">{roundsToday}</p>
                              <p className="mt-1 text-[10px] text-slate-100/68">rounds registrados no dia</p>
                          </div>
                          <div className="rounded-[18px] border border-[#D01BF1]/20 bg-[#D01BF1]/10 px-3 py-2.5">
                              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-200/68">Media/dia</p>
                              <p className="mt-1.5 text-lg font-black text-white">{averageRoundsPerDay.toFixed(1)}</p>
                              <p className="mt-1 text-[10px] text-slate-100/68">quantas tentativas por dia</p>
                          </div>
                      </div>
                  ) : null}

                  <svg viewBox={`0 0 ${width} ${height}`} className={`w-full h-auto drop-shadow-2xl ${isFullscreen ? 'max-h-[60vh]' : ''}`}>
                      {/* Gradiente de Fundo */}
                      <defs>
                          <linearGradient id="trendLineGradient" x1="0" y1="0" x2="0" y2={height} gradientUnits="userSpaceOnUse">
                              <stop offset={`${avgPercent}%`} stopColor={chartPalette.better} />
                              <stop offset={`${avgPercent}%`} stopColor={chartPalette.worse} />
                          </linearGradient>
                          <linearGradient id="trendFillGradient" x1="0" y1="0" x2="0" y2={height} gradientUnits="userSpaceOnUse">
                              <stop offset="0%" stopColor={chartPalette.better} stopOpacity="0.2"/>
                              <stop offset={`${avgPercent}%`} stopColor={chartPalette.better} stopOpacity="0.1"/>
                              <stop offset={`${avgPercent}%`} stopColor={chartPalette.worse} stopOpacity="0.1"/>
                              <stop offset="100%" stopColor={chartPalette.worse} stopOpacity="0"/>
                          </linearGradient>
                      </defs>

                      {/* Linhas de Grade Horizontal (Baseadas na escala principal) */}
                      {[0, 0.25, 0.5, 0.75, 1].map(p => {
                          const y = height - padding - (p * (height - 2 * padding));
                          return <line key={p} x1={padding} y1={y} x2={width-padding} y2={y} stroke={chartPalette.grid} strokeDasharray="4 4" strokeWidth="1"/>
                      })}

                      {/* Linha da Média */}
                      {isTvFullRoundsView ? (
                        <>
                            <line x1={padding} y1={tvTargetY} x2={width-padding} y2={tvTargetY} stroke={chartPalette.avg} strokeDasharray="5 5" strokeWidth="1" opacity="0.75"/>
                            <text x={padding + 5} y={tvTargetY - 5} fill={chartPalette.avg} fontSize="10" fontWeight="bold" opacity="0.92">META 2:30</text>
                        </>
                      ) : (
                        <>
                            <line x1={padding} y1={avgY} x2={width-padding} y2={avgY} stroke={chartPalette.avg} strokeDasharray="5 5" strokeWidth="1" opacity="0.6"/>
                            <text x={padding + 5} y={avgY - 5} fill={chartPalette.avg} fontSize="10" fontWeight="bold" opacity="0.8">MÉDIA: {currentAvg}</text>
                        </>
                      )}

                      {/* Área Preenchida (Apenas Principal) */}
                      <path d={fillPathData} fill={isGeneral && !isTvFullRoundsView ? "url(#trendFillGradient)" : "none"} />

                      {/* SEGUNDA LINHA: TEMPO (AZUL) - Só no Geral */}
                      {isGeneral && !isTvFullRoundsView && (
                        <>
                            <path d={pathDataTime} fill="none" stroke={chartPalette.secondary} strokeWidth="2" strokeDasharray="5 5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
                            {data.map((d, i) => (
                                <circle key={`t-${d.id}`} cx={getX(i)} cy={getY(d.time || 0, 'time')} r="3" fill="#151520" stroke={chartPalette.secondary} strokeWidth="2" />
                            ))}
                        </>
                      )}

                      {/* LINHA PRINCIPAL (VERDE ou AZUL) */}
                      <path d={pathDataMain} fill="none" stroke={isTvFullRoundsView ? chartPalette.secondary : "url(#trendLineGradient)"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                      {/* Pontos */}
                      {data.map((d, i) => (
                          (() => {
                            const yPos = getY(d[valKey], isTvFullRoundsView ? 'time' : isGeneral ? 'score' : 'time');
                            const dateText = new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

                            const isBetter = isTvFullRoundsView ? Number(d.time) <= 150 : isGeneral ? d[valKey] >= currentAvg : d[valKey] <= currentAvg;
                            const ptColor = isBetter ? chartPalette.better : chartPalette.worse;

                            return (
                                <g key={d.id} className="group">
                                    <circle cx={getX(i)} cy={yPos} r="4" fill="#151520" stroke={ptColor} strokeWidth="2" />

                                    {/* Textos fixos (Sempre visíveis, alternando altura para não encavalar) */}
                                    <text x={getX(i)} y={yPos - (i % 2 === 0 ? 12 : -18)} textAnchor="middle" fill={ptColor} fontSize="10" fontWeight="bold">
                                        {d[valKey]}
                                    </text>

                                    {/* Tooltip Aprimorado */}
                                    <g className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        <rect
                                            x={getX(i) - 45}
                                            y={yPos - (isGeneral ? 60 : 48)}
                                            width="90"
                                            height={isGeneral ? 55 : 40}
                                            rx="5"
                                            fill="black"
                                            fillOpacity="0.9"
                                            stroke={chartPalette.tooltipBorder}
                                            strokeWidth="1"
                                        />

                                        {isTvFullRoundsView ? (
                                            <>
                                                <text x={getX(i)} y={yPos - 45} textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">{d.time} seg</text>
                                                <text x={getX(i)} y={yPos - 30} textAnchor="middle" fill={chartPalette.avg} fontSize="10" fontWeight="bold">{Number(d.time) <= 150 ? 'Dentro de 2:30' : 'Acima de 2:30'}</text>
                                                <text x={getX(i)} y={yPos - 15} textAnchor="middle" fill={chartPalette.tooltipSubtle} fontSize="10">{dateText}</text>
                                            </>
                                        ) : isGeneral ? (
                                            <>
                                                <text x={getX(i)} y={yPos - 45} textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">{d.score} pts</text>
                                                <text x={getX(i)} y={yPos - 30} textAnchor="middle" fill={chartPalette.secondary} fontSize="10" fontWeight="bold">{d.time ? `${d.time}s` : '--'}</text>
                                                <text x={getX(i)} y={yPos - 15} textAnchor="middle" fill={chartPalette.tooltipSubtle} fontSize="10">{dateText}</text>
                                            </>
                                        ) : (
                                            <>
                                                <text x={getX(i)} y={yPos - 35} textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">{d.time} seg</text>
                                                <text x={getX(i)} y={yPos - 20} textAnchor="middle" fill="#9ca3af" fontSize="10">{dateText}</text>
                                            </>
                                        )}
                                    </g>
                                </g>
                            )
                          })()
                      ))}
                  </svg>

                  {/* Legenda X (Datas) */}
                  <div className={`flex justify-between ${isTvMode ? 'mt-0.5 px-2 text-[8px]' : 'mt-2 px-4 text-[10px]'} text-gray-500 uppercase font-mono select-none`}>
                      <span>{new Date(data[0].date).toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'})}</span>
                      {data.length > 3 && (<span>{new Date(data[Math.floor(data.length / 2)].date).toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'})}</span>)}
                      <span>{new Date(data[data.length-1].date).toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'})}</span>
                  </div>
              </div>
              )}

              {/* HISTÓRICO COMPLETO ABAIXO DO GRÁFICO (SÓ FORA DO MODO TV E NÃO EM TELA CHEIA) */}
              {!isTvMode && !isFullscreen && data.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-white/10">
                      <div className="flex justify-between items-center mb-4">
                          <h4 className="text-gray-400 font-bold uppercase text-xs flex items-center gap-2"><ListTodo size={14}/> Histórico Detalhado</h4>
                          <div className="flex gap-4">
                              <div className="text-right bg-white/5 px-3 py-1 rounded-lg">
                                  <span className="text-[10px] text-gray-500 uppercase font-bold block">Média Pontos</span>
                                  <span className="text-green-500 font-bold">{avgScore} pts</span>
                              </div>
                              <div className="text-right bg-white/5 px-3 py-1 rounded-lg">
                                  <span className="text-[10px] text-gray-500 uppercase font-bold block">Média Tempo</span>
                                  <span className="text-blue-500 font-bold">{avgTime} s</span>
                              </div>
                              {isGeneral && (
                                  <div className="text-right bg-white/5 px-3 py-1 rounded-lg">
                                      <span className="text-[10px] text-gray-500 uppercase font-bold block">Consistencia 2:30</span>
                                      <span className={`font-bold ${attemptsWithinLimit >= 7 && recentGeneralAttempts.length >= 10 ? 'text-green-400' : 'text-yellow-300'}`}>{consistencyLabel}</span>
                                  </div>
                              )}
                          </div>
                      </div>

                      <div tabIndex={0} role="region" aria-label={"Hist\u00f3rico de treinos"} className="max-h-64 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                          {[...data].reverse().map((d, i) => (
                              <div key={d.id} className="flex items-center justify-between bg-black/40 p-3 rounded-lg border border-white/5 hover:bg-white/5 transition-colors">
                                  <div className="flex items-center gap-3">
                                      <span className="text-gray-500 text-xs font-mono font-bold w-6">#{data.length - i}</span>
                                      <div className="flex flex-col">
                                          <span className="text-gray-200 text-xs font-bold">{new Date(d.date).toLocaleDateString('pt-BR')} às {new Date(d.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                                          {d.author && <span className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5"><UserCircle size={10}/> {d.author}</span>}
                                      </div>
                                  </div>
                                  <div className="flex items-center gap-4 text-right">
                                      <div className="w-16"><span className="text-[9px] text-gray-500 uppercase block">Tempo</span><span className="text-blue-400 font-bold text-sm">{d.time || '--'}s</span></div>
                                      <div className="w-16"><span className="text-[9px] text-gray-500 uppercase block">Pontos</span><span className="text-green-400 font-bold text-sm">{d.score || '--'}</span></div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}
          </>
      );

      if (isFullscreen) {
          return (
              <div className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-sm p-4 md:p-8 flex flex-col overflow-auto animate-in fade-in">
                  <div className="max-w-7xl w-full mx-auto flex-1 flex flex-col">
                      <div className="bg-[#151520] border border-white/10 rounded-2xl p-6 md:p-10 flex-1 flex flex-col shadow-2xl relative">
                          {renderChartContent()}
                      </div>
                  </div>
              </div>
          );
      }

      return (
          <div className={`rounded-2xl ${isTvMode ? 'border-0 bg-transparent p-0 shadow-none' : 'bg-[#151520] border border-white/10 p-6 mb-8'}`}>
              {renderChartContent()}
          </div>
      );
      }
