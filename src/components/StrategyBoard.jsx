import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Image as KonvaImage, Line } from 'react-konva';
import useImage from 'use-image';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase'; // ⚠️ CONFIRA O CAMINHO!

// --- COMPONENTE DE IMAGEM ---
const MapImage = ({ src, width, height }) => {
  const [image] = useImage(src);
  return <KonvaImage image={image} width={width} height={height} />;
};

const StrategyBoard = () => {
  // --- ESTADOS ---
  const [activeMapUrl, setActiveMapUrl] = useState(null); // URL da imagem da mesa
  const [activeMapId, setActiveMapId] = useState(null);   // ID da mesa no banco
  
  const [tool, setTool] = useState('pen'); // Ferramenta (pen/eraser)
  const [color, setColor] = useState('#06b6d4'); // Cor atual (Ciano padrão)
  const [lines, setLines] = useState([]); // Os riscos
  const [isDrawing, setIsDrawing] = useState(false);
  
  const [savedStrategies, setSavedStrategies] = useState([]); // Lista de estratégias salvas
  const [strategyName, setStrategyName] = useState(""); // Nome para salvar

  const stageRef = useRef(null);
  
 // Cores disponíveis (Paleta Expandida)
  const colors = [
    { name: 'Ciano (Equipe)', code: '#06b6d4' },    // Padrão
    { name: 'Vermelho (Erro)', code: '#ef4444' },   // Erro/Proibido
    { name: 'Verde (Sucesso)', code: '#22c55e' },   // Rota Segura
    { name: 'Amarelo (Atenção)', code: '#eab308' }, // Área de Risco
    { name: 'Roxo (Rota Alt)', code: '#a855f7' },   // Rota Alternativa
    { name: 'Branco', code: '#ffffff' },            // Apagador/Detalhe
    
    // --- NOVAS CORES ---
    { name: 'Laranja (Mecânismo)', code: '#f97316' }, // Ótimo para marcar anexos
    { name: 'Rosa (Prioridade)', code: '#d946ef' },    // Missões urgentes
    { name: 'Azul Escuro (Base)', code: '#1e3a8a' },   // Área de Base/Retorno
    { name: 'Marrom (Obstáculo)', code: '#854d0e' }    // Paredes/Estruturas Fixas
  ];

  const stageWidth = 800;
  const stageHeight = 450;

  // --- 1. BUSCAR DADOS INICIAIS (Apenas Lista de Estratégias) ---
  useEffect(() => {
    const init = async () => {
      // SETA A IMAGEM LOCAL (Rápido, seguro e offline)
      // Certifique-se que você colocou a imagem 'mesa-fll.jpg' na pasta 'public'
      setActiveMapUrl('/mesaUnearthed.png'); 
      setActiveMapId('mapa_padrao_local'); 
        
      // Buscar Estratégias salvas (continua puxando do Firebase)
      loadStrategiesList('mapa_padrao_local'); 
    };
    init();
  }, []);
  const loadStrategiesList = async (mapId) => {
    try {
      const stratQ = query(collection(db, "strategies"), where("mapId", "==", mapId));
      const stratSnap = await getDocs(stratQ);
      const list = stratSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSavedStrategies(list);
    } catch (error) {
      console.error("Erro ao listar estratégias:", error);
    }
  };

  // --- 2. LÓGICA DE DESENHO (Agora com Cores!) ---
  const handleMouseDown = (e) => {
    setIsDrawing(true);
    const pos = e.target.getStage().getPointerPosition();
    // Agora salvamos a COR junto com a linha!
    setLines([...lines, { tool, color, points: [pos.x, pos.y] }]);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    let lastLine = lines[lines.length - 1];
    
    // Adiciona pontos à linha atual
    lastLine.points = lastLine.points.concat([point.x, point.y]);
    
    // Atualiza React de forma otimizada
    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
  };

  const handleMouseUp = () => setIsDrawing(false);

  // --- 3. SALVAR E CARREGAR NO FIREBASE ---
  
  const saveStrategy = async (e) => {
    e.preventDefault();
    if (!strategyName) return alert("Dê um nome para a estratégia!");
    if (lines.length === 0) return alert("Desenhe algo antes de salvar!");

    try {
      // Salva no banco "strategies"
      await addDoc(collection(db, "strategies"), {
        name: strategyName,
        mapId: activeMapId,
        lines: lines, // Salva o array de riscos JSON
        createdAt: serverTimestamp()
      });
      
      alert("Estratégia salva com sucesso! 💾");
      setStrategyName("");
      loadStrategiesList(activeMapId); // Atualiza a lista
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar.");
    }
  };

  const loadStrategy = (stratId) => {
    const selected = savedStrategies.find(s => s.id === stratId);
    if (selected) {
      setLines(selected.lines); // Carrega os riscos na tela
    }
  };

  if (!activeMapUrl) return <div className="text-white">Carregando mesa...</div>;

  return (
    <div className="flex flex-col gap-6 bg-gray-900 p-6 rounded-xl border border-gray-800">
      
      {/* --- CABEÇALHO: FERRAMENTAS E CORES --- */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gray-800 p-4 rounded-lg">
        
        {/* Lado Esquerdo: Cores */}
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-xs uppercase font-bold">Cores:</span>
          {colors.map((c) => (
            <button
              key={c.code}
              onClick={() => { setColor(c.code); setTool('pen'); }}
              className={`w-8 h-8 rounded-full border-2 transition-all ${color === c.code && tool === 'pen' ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-70 hover:opacity-100'}`}
              style={{ backgroundColor: c.code }}
              title={c.name}
            />
          ))}
        </div>

        {/* Lado Direito: Ações */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setTool('eraser')}
            className={`px-3 py-1 rounded text-sm font-bold flex items-center gap-2 ${tool === 'eraser' ? 'bg-white text-black' : 'bg-gray-700 text-gray-300'}`}
          >
            🧼 Borracha
          </button>
          <button 
            onClick={() => { if(window.confirm('Limpar tudo?')) setLines([]) }}
            className="px-3 py-1 rounded text-sm font-bold bg-red-900/50 text-red-400 hover:bg-red-900 border border-red-800"
          >
            🗑️ Limpar
          </button>
        </div>
      </div>

      {/* --- ÁREA DO DESENHO --- */}
      <div className="flex justify-center bg-black/50 rounded-lg p-2 border border-gray-700 overflow-hidden">
        {/* ... dentro do return ... */}

<Stage
  width={stageWidth}
  height={stageHeight}
  onMouseDown={handleMouseDown}
  onMousemove={handleMouseMove}
  onMouseup={handleMouseUp}
  onTouchStart={handleMouseDown}
  onTouchMove={handleMouseMove}
  onTouchEnd={handleMouseUp}
  ref={stageRef}
>
  {/* CAMADA 1: O FUNDO (MESA) - A borracha não toca aqui */}
  <Layer listening={false}> 
    <MapImage src={activeMapUrl} width={stageWidth} height={stageHeight} />
  </Layer>

  {/* CAMADA 2: O VIDRO (DESENHOS) - A borracha só funciona aqui */}
  <Layer>
    {lines.map((line, i) => (
      <Line
        key={i}
        points={line.points}
        stroke={line.tool === 'eraser' ? '#000000' : line.color} // Cor não importa na borracha, mas precisa ter
        strokeWidth={line.tool === 'eraser' ? 25 : 5}
        tension={0.5}
        lineCap="round"
        lineJoin="round"
        // O Pulo do Gato: "destination-out" só afeta ESTA camada (Layer)
        globalCompositeOperation={
          line.tool === 'eraser' ? 'destination-out' : 'source-over'
        }
      />
    ))}
  </Layer>
</Stage>
      </div>

      {/* --- RODAPÉ: SALVAR E CARREGAR --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card Salvar */}
        <form onSubmit={saveStrategy} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <h4 className="text-cyan-400 font-bold mb-3 flex items-center gap-2">💾 Salvar Estratégia</h4>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Ex: Rota 1 - 250pts" 
              className="flex-1 bg-gray-900 border border-gray-600 rounded p-2 text-white text-sm focus:border-cyan-500 outline-none"
              value={strategyName}
              onChange={(e) => setStrategyName(e.target.value)}
            />
            <button className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-4 py-2 rounded text-sm">
              Salvar
            </button>
          </div>
        </form>

        {/* Card Carregar */}
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <h4 className="text-green-400 font-bold mb-3 flex items-center gap-2">📂 Carregar Salvas</h4>
          <select 
            onChange={(e) => loadStrategy(e.target.value)}
            className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white text-sm focus:border-green-500 outline-none cursor-pointer"
          >
            <option value="">Selecione uma estratégia...</option>
            {savedStrategies.map(strat => (
              <option key={strat.id} value={strat.id}>
                {strat.name}
              </option>
            ))}
          </select>
        </div>

      </div>
    </div>
  );
};

export default StrategyBoard;