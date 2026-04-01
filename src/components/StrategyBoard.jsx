import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Stage,
  Layer,
  Image as KonvaImage,
  Line,
  Rect,
  Circle,
  Text,
  Shape,
} from 'react-konva';
import useImage from 'use-image';
import { collection, query, where, getDocs, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { FolderOpen, Maximize, Minimize, Trash2 } from 'lucide-react';

const ROUTE_PALETTE = [
  { number: 1, label: 'Saida 1', detail: 'Azul', code: '#3b82f6' },
  { number: 2, label: 'Saida 2', detail: 'Vermelho', code: '#ef4444' },
  { number: 3, label: 'Saida 3', detail: 'Verde', code: '#22c55e' },
  { number: 4, label: 'Saida 4', detail: 'Amarelo', code: '#eab308' },
  { number: 5, label: 'Saida 5', detail: 'Roxo', code: '#a855f7' },
  { number: 6, label: 'Saida 6', detail: 'Branco', code: '#ffffff' },
  { number: 7, label: 'Saida 7', detail: 'Laranja', code: '#f97316' },
  { number: 8, label: 'Saida 8', detail: 'Rosa', code: '#d946ef' },
  { number: 9, label: 'Saida 9', detail: 'Azul Escuro', code: '#1e3a8a' },
  { number: 10, label: 'Saida 10', detail: 'Marrom', code: '#854d0e' },
];

const STAGE_WIDTH = 800;
const STAGE_HEIGHT = 450;

const createRouteId = () => `route-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const getPaletteEntry = (colorCode) => ROUTE_PALETTE.find((item) => item.code === colorCode) || ROUTE_PALETTE[0];

const getContrastTextColor = (colorCode) => colorCode === '#ffffff' || colorCode === '#eab308' ? '#111827' : '#ffffff';

const getStrategyTimestamp = (strategy) => {
  if (!strategy?.createdAt) return 0;
  if (typeof strategy.createdAt?.seconds === 'number') return strategy.createdAt.seconds * 1000;

  const fallbackDate = new Date(strategy.createdAt).getTime();
  return Number.isNaN(fallbackDate) ? 0 : fallbackDate;
};

const formatStrategyDate = (strategy) => {
  const timestamp = getStrategyTimestamp(strategy);
  if (!timestamp) return 'Agora';

  return new Date(timestamp).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });
};

const normalizeRoute = (route, index) => {
  const palette = getPaletteEntry(route?.color);
  const points = Array.isArray(route?.points) ? route.points.filter((value) => Number.isFinite(value)) : [];

  if (points.length < 2) return null;

  return {
    id: route?.id || `legacy-route-${index}`,
    kind: route?.kind || 'freehand',
    tool: route?.tool || 'pen',
    color: route?.color || palette.code,
    routeNumber: route?.routeNumber || palette.number,
    routeLabel: route?.routeLabel || palette.label,
    points,
  };
};

const getRouteStart = (route) => ({
  x: route.points[0] || 0,
  y: route.points[1] || 0,
});

const getRouteEnd = (route) => {
  if (route.kind === 'curve' && route.points.length >= 6) {
    return { x: route.points[4], y: route.points[5] };
  }

  return {
    x: route.points[route.points.length - 2] || 0,
    y: route.points[route.points.length - 1] || 0,
  };
};

const getRouteLabelPosition = (route) => {
  if (route.kind === 'curve' && route.points.length >= 6) {
    const [x1, y1, cx, cy, x2, y2] = route.points;
    const t = 0.5;
    const x = ((1 - t) ** 2 * x1) + (2 * (1 - t) * t * cx) + ((t ** 2) * x2);
    const y = ((1 - t) ** 2 * y1) + (2 * (1 - t) * t * cy) + ((t ** 2) * y2);
    return { x, y };
  }

  if (route.kind === 'segment' && route.points.length >= 4) {
    return {
      x: (route.points[0] + route.points[2]) / 2,
      y: (route.points[1] + route.points[3]) / 2,
    };
  }

  const middleIndex = Math.max(0, Math.floor(route.points.length / 2) - 1);
  return {
    x: route.points[middleIndex] || route.points[0] || 0,
    y: route.points[middleIndex + 1] || route.points[1] || 0,
  };
};

const MapImage = ({ src, width, height }) => {
  const [image, status] = useImage(src);

  if (status === 'loading') {
    return <Rect width={width} height={height} fill="#333" />;
  }

  if (status === 'error') {
    return <Rect width={width} height={height} fill="#550000" />;
  }

  return <KonvaImage image={image} width={width} height={height} />;
};

const StrategyBoard = () => {
  const [activeMapUrl, setActiveMapUrl] = useState(null);
  const [activeMapId, setActiveMapId] = useState(null);
  const [tool, setTool] = useState('line');
  const [activeColor, setActiveColor] = useState(ROUTE_PALETTE[0].code);
  const [lines, setLines] = useState([]);
  const [draftRoute, setDraftRoute] = useState(null);
  const [hoverPoint, setHoverPoint] = useState(null);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [savedStrategies, setSavedStrategies] = useState([]);
  const [selectedSavedStrategyIds, setSelectedSavedStrategyIds] = useState([]);
  const [loadedStrategyId, setLoadedStrategyId] = useState(null);
  const [strategyName, setStrategyName] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const stageRef = useRef(null);
  const activePalette = useMemo(() => getPaletteEntry(activeColor), [activeColor]);
  const sortedSavedStrategies = useMemo(
    () => [...savedStrategies].sort((left, right) => getStrategyTimestamp(right) - getStrategyTimestamp(left)),
    [savedStrategies]
  );
  const boardMetrics = useMemo(() => {
    const routeNumbers = [...new Set(lines.map((route) => route.routeNumber).filter(Boolean))].sort((left, right) => left - right);
    return {
      totalRoutes: lines.length,
      straightRoutes: lines.filter((route) => route.kind !== 'curve').length,
      curvedRoutes: lines.filter((route) => route.kind === 'curve').length,
      routeNumbers,
    };
  }, [lines]);
  const areAllSavedStrategiesSelected = sortedSavedStrategies.length > 0 && selectedSavedStrategyIds.length === sortedSavedStrategies.length;

  const loadStrategiesList = async (mapId) => {
    try {
      const strategyQuery = query(collection(db, 'strategies'), where('mapId', '==', mapId));
      const strategySnapshot = await getDocs(strategyQuery);
      const list = strategySnapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      setSavedStrategies(list);
      setSelectedSavedStrategyIds((current) => current.filter((id) => list.some((strategy) => strategy.id === id)));
    } catch (error) {
      console.error('Erro ao listar estrategias:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      const localMapId = 'mapa_padrao_local';
      setActiveMapUrl(`/Unearthed.jpg?t=${new Date().getTime()}`);
      setActiveMapId(localMapId);
      await loadStrategiesList(localMapId);
    };

    init();
  }, []);

  const switchTool = (nextTool) => {
    setTool(nextTool);
    setDraftRoute(null);
    if (nextTool !== 'select') {
      setSelectedRouteId(null);
    }
  };

  const handleSelectPalette = (colorCode) => {
    setActiveColor(colorCode);
    setDraftRoute(null);
    setSelectedRouteId(null);
    if (tool === 'select') {
      setTool('line');
    }
  };

  const handleStagePointerMove = (event) => {
    const stage = event.target.getStage();
    const point = stage?.getPointerPosition();
    if (!point) return;
    setHoverPoint({ x: Math.round(point.x), y: Math.round(point.y) });
  };

  const handleStagePointerDown = (event) => {
    const stage = event.target.getStage();
    const point = stage?.getPointerPosition();

    if (!point) return;

    const nextPoint = { x: Math.round(point.x), y: Math.round(point.y) };

    if (tool === 'select') {
      setSelectedRouteId(null);
      return;
    }

    if (!draftRoute) {
      setDraftRoute({
        kind: tool === 'curve' ? 'curve' : 'segment',
        color: activePalette.code,
        routeNumber: activePalette.number,
        routeLabel: activePalette.label,
        points: [nextPoint.x, nextPoint.y],
      });
      return;
    }

    if (tool === 'line') {
      const newRoute = {
        ...draftRoute,
        id: createRouteId(),
        points: [draftRoute.points[0], draftRoute.points[1], nextPoint.x, nextPoint.y],
      };
      setLines((current) => [...current, newRoute]);
      setDraftRoute(null);
      setSelectedRouteId(newRoute.id);
      return;
    }

    if (draftRoute.points.length === 2) {
      setDraftRoute({
        ...draftRoute,
        points: [...draftRoute.points, nextPoint.x, nextPoint.y],
      });
      return;
    }

    const newRoute = {
      ...draftRoute,
      id: createRouteId(),
      points: [
        draftRoute.points[0],
        draftRoute.points[1],
        draftRoute.points[2],
        draftRoute.points[3],
        nextPoint.x,
        nextPoint.y,
      ],
    };
    setLines((current) => [...current, newRoute]);
    setDraftRoute(null);
    setSelectedRouteId(newRoute.id);
  };

  const handleUndoLastRoute = () => {
    setDraftRoute(null);
    setSelectedRouteId(null);
    setLines((current) => current.slice(0, -1));
  };

  const handleCancelDraftRoute = () => {
    setDraftRoute(null);
  };

  const handleDeleteSelectedRoute = () => {
    if (!selectedRouteId) return;
    setLines((current) => current.filter((route) => route.id !== selectedRouteId));
    setSelectedRouteId(null);
  };

  const handleClearRoutes = () => {
    if (!window.confirm('Limpar todas as rotas desta estrategia?')) return;
    setLines([]);
    setDraftRoute(null);
    setSelectedRouteId(null);
  };

  const saveStrategy = async (event) => {
    event.preventDefault();

    if (!strategyName.trim()) {
      alert('De um nome para a estrategia.');
      return;
    }

    if (lines.length === 0) {
      alert('Crie pelo menos uma rota antes de salvar.');
      return;
    }

    try {
      await addDoc(collection(db, 'strategies'), {
        name: strategyName.trim(),
        mapId: activeMapId,
        lines,
        createdAt: serverTimestamp(),
      });

      alert('Estrategia salva com sucesso.');
      setStrategyName('');
      setLoadedStrategyId(null);
      await loadStrategiesList(activeMapId);
    } catch (error) {
      console.error('Erro ao salvar estrategia:', error);
      alert('Erro ao salvar.');
    }
  };

  const loadStrategy = (strategyId) => {
    const selectedStrategy = savedStrategies.find((strategy) => strategy.id === strategyId);
    if (!selectedStrategy) return;

    setLines((selectedStrategy.lines || []).map(normalizeRoute).filter(Boolean));
    setDraftRoute(null);
    setSelectedRouteId(null);
    setLoadedStrategyId(selectedStrategy.id);
  };

  const toggleSavedStrategySelection = (strategyId) => {
    setSelectedSavedStrategyIds((current) => (
      current.includes(strategyId)
        ? current.filter((id) => id !== strategyId)
        : [...current, strategyId]
    ));
  };

  const handleToggleAllSavedStrategies = () => {
    if (areAllSavedStrategiesSelected) {
      setSelectedSavedStrategyIds([]);
      return;
    }

    setSelectedSavedStrategyIds(sortedSavedStrategies.map((strategy) => strategy.id));
  };

  const handleClearSavedStrategySelection = () => {
    setSelectedSavedStrategyIds([]);
  };

  const handleDeleteSavedStrategy = async (strategyId, strategyNameToDelete) => {
    if (!window.confirm(`Excluir a estrategia "${strategyNameToDelete}"?`)) return;

    try {
      await deleteDoc(doc(db, 'strategies', strategyId));
      setSavedStrategies((current) => current.filter((strategy) => strategy.id !== strategyId));
      setSelectedSavedStrategyIds((current) => current.filter((id) => id !== strategyId));

      if (loadedStrategyId === strategyId) {
        setLoadedStrategyId(null);
      }
    } catch (error) {
      console.error('Erro ao excluir estrategia salva:', error);
      alert('Nao foi possivel excluir a estrategia.');
    }
  };

  const handleDeleteSelectedSavedStrategies = async () => {
    if (selectedSavedStrategyIds.length === 0) return;

    const selectedStrategies = sortedSavedStrategies.filter((strategy) => selectedSavedStrategyIds.includes(strategy.id));
    if (!window.confirm(`Excluir ${selectedStrategies.length} estrategia(s) selecionada(s)?`)) return;

    try {
      await Promise.all(selectedStrategies.map((strategy) => deleteDoc(doc(db, 'strategies', strategy.id))));
      setSavedStrategies((current) => current.filter((strategy) => !selectedSavedStrategyIds.includes(strategy.id)));

      if (loadedStrategyId && selectedSavedStrategyIds.includes(loadedStrategyId)) {
        setLoadedStrategyId(null);
      }

      setSelectedSavedStrategyIds([]);
    } catch (error) {
      console.error('Erro ao excluir estrategias selecionadas:', error);
      alert('Nao foi possivel excluir todas as estrategias selecionadas.');
    }
  };

  const renderRouteBadge = (route, isSelected) => {
    const badge = getRouteLabelPosition(route);
    const textColor = getContrastTextColor(route.color);

    return (
      <>
        <Circle
          x={badge.x}
          y={badge.y}
          radius={11}
          fill={route.color}
          stroke={isSelected ? '#ffffff' : 'rgba(255,255,255,0.55)'}
          strokeWidth={isSelected ? 2.5 : 1.5}
          listening={false}
        />
        <Text
          x={badge.x - 12}
          y={badge.y - 7}
          width={24}
          align="center"
          text={`${route.routeNumber || getPaletteEntry(route.color).number}`}
          fontSize={11}
          fontStyle="bold"
          fill={textColor}
          listening={false}
        />
      </>
    );
  };

  const renderRouteEndpoints = (route) => {
    const start = getRouteStart(route);
    const end = getRouteEnd(route);

    return (
      <>
        <Circle x={start.x} y={start.y} radius={4.5} fill={route.color} stroke="#ffffff" strokeWidth={1.4} listening={false} />
        <Circle x={end.x} y={end.y} radius={4.5} fill="#ffffff" stroke={route.color} strokeWidth={2} listening={false} />
      </>
    );
  };

  const renderRouteShape = (route, isSelected) => {
    const commonProps = {
      stroke: route.tool === 'eraser' ? '#000000' : route.color,
      strokeWidth: route.tool === 'eraser' ? 22 : isSelected ? 6.5 : 5,
      lineCap: 'round',
      lineJoin: 'round',
      opacity: route.tool === 'eraser' ? 1 : 0.98,
      shadowColor: route.tool === 'eraser' ? undefined : route.color,
      shadowBlur: route.tool === 'eraser' ? 0 : isSelected ? 18 : 8,
      shadowOpacity: route.tool === 'eraser' ? 0 : 0.35,
      globalCompositeOperation: route.tool === 'eraser' ? 'destination-out' : 'source-over',
      listening: tool === 'select',
      onMouseDown: (event) => {
        if (tool !== 'select') return;
        event.cancelBubble = true;
        setSelectedRouteId(route.id);
      },
      onTouchStart: (event) => {
        if (tool !== 'select') return;
        event.cancelBubble = true;
        setSelectedRouteId(route.id);
      },
    };

    if (route.kind === 'curve' && route.points.length >= 6) {
      const [x1, y1, cx, cy, x2, y2] = route.points;

      return (
        <Shape
          {...commonProps}
          sceneFunc={(context, shape) => {
            context.beginPath();
            context.moveTo(x1, y1);
            context.quadraticCurveTo(cx, cy, x2, y2);
            context.strokeShape(shape);
          }}
        />
      );
    }

    return (
      <Line
        {...commonProps}
        points={route.points}
        tension={route.kind === 'freehand' ? 0.35 : 0}
      />
    );
  };

  const renderDraftRoute = () => {
    if (!draftRoute || !hoverPoint) return null;

    if (draftRoute.kind === 'segment' && draftRoute.points.length === 2) {
      return (
        <Line
          points={[draftRoute.points[0], draftRoute.points[1], hoverPoint.x, hoverPoint.y]}
          stroke={draftRoute.color}
          strokeWidth={4}
          dash={[12, 8]}
          lineCap="round"
          lineJoin="round"
          opacity={0.85}
        />
      );
    }

    if (draftRoute.kind === 'curve' && draftRoute.points.length === 2) {
      return (
        <>
          <Line
            points={[draftRoute.points[0], draftRoute.points[1], hoverPoint.x, hoverPoint.y]}
            stroke={draftRoute.color}
            strokeWidth={3}
            dash={[10, 8]}
            lineCap="round"
            lineJoin="round"
            opacity={0.7}
          />
          <Circle x={hoverPoint.x} y={hoverPoint.y} radius={4} fill={draftRoute.color} opacity={0.9} />
        </>
      );
    }

    if (draftRoute.kind === 'curve' && draftRoute.points.length === 4) {
      const [x1, y1, cx, cy] = draftRoute.points;
      return (
        <>
          <Shape
            stroke={draftRoute.color}
            strokeWidth={4}
            dash={[12, 8]}
            lineCap="round"
            lineJoin="round"
            opacity={0.85}
            sceneFunc={(context, shape) => {
              context.beginPath();
              context.moveTo(x1, y1);
              context.quadraticCurveTo(cx, cy, hoverPoint.x, hoverPoint.y);
              context.strokeShape(shape);
            }}
          />
          <Circle x={cx} y={cy} radius={4.5} fill={draftRoute.color} opacity={0.9} />
          <Line points={[x1, y1, cx, cy]} stroke={draftRoute.color} strokeWidth={2} dash={[6, 6]} opacity={0.4} />
          <Line points={[cx, cy, hoverPoint.x, hoverPoint.y]} stroke={draftRoute.color} strokeWidth={2} dash={[6, 6]} opacity={0.4} />
        </>
      );
    }

    return null;
  };

  const selectedRoute = lines.find((route) => route.id === selectedRouteId) || null;
  const helperText = (() => {
    if (tool === 'line') {
      return draftRoute
        ? 'Clique no ponto final para concluir a linha reta.'
        : 'Ferramenta reta: clique no inicio e depois no fim da rota.';
    }

    if (tool === 'curve') {
      if (!draftRoute) return 'Ferramenta curva: clique no inicio da rota.';
      if (draftRoute.points.length === 2) return 'Agora clique no ponto de controle para moldar a curva.';
      return 'Agora clique no ponto final para concluir a curva.';
    }

    return selectedRoute
      ? `Rota selecionada: ${selectedRoute.routeLabel} (${selectedRoute.routeNumber}).`
      : 'Clique em uma rota para destacar e apagar se precisar.';
  })();

  if (!activeMapUrl) {
    return <div className="text-white">Carregando mesa...</div>;
  }

  return (
    <div className={`flex flex-col gap-6 bg-gray-900 p-6 rounded-xl border border-gray-800 ${isFullscreen ? 'fixed inset-0 z-[100] h-screen w-screen overflow-hidden justify-center' : ''}`}>
      <div className="grid gap-4 lg:grid-cols-[1.15fr,0.85fr]">
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-gray-400 text-[10px] uppercase font-bold tracking-[0.22em]">Rotas da Mesa</p>
              <h3 className="text-white text-lg font-black mt-2">Trajetos retos, curvas limpas e saidas numeradas</h3>
            </div>
            <div className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[11px] font-bold text-blue-200">
              Saida ativa: {activePalette.number} | {activePalette.detail}
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5 mt-4">
            {ROUTE_PALETTE.map((entry) => {
              const isActive = entry.code === activeColor;
              const textColor = getContrastTextColor(entry.code);

              return (
                <button
                  key={entry.code}
                  type="button"
                  onClick={() => handleSelectPalette(entry.code)}
                  className={`rounded-2xl border px-3 py-3 text-left transition-all ${isActive ? 'border-white shadow-[0_12px_35px_rgba(0,0,0,0.25)] scale-[1.02]' : 'border-white/10 hover:border-white/30'}`}
                  style={{ backgroundColor: entry.code }}
                  title={`${entry.label} - ${entry.detail}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-black uppercase tracking-[0.18em]" style={{ color: textColor }}>
                      {entry.label}
                    </span>
                    <span className="w-7 h-7 rounded-full border border-black/20 bg-black/20 flex items-center justify-center text-xs font-black" style={{ color: textColor }}>
                      {entry.number}
                    </span>
                  </div>
                  <p className="text-xs mt-2 font-semibold opacity-90" style={{ color: textColor }}>
                    {entry.detail}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 mt-4">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500 font-bold">Rotas no quadro</p>
              <p className="text-2xl font-black text-white mt-2">{boardMetrics.totalRoutes}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500 font-bold">Linhas retas</p>
              <p className="text-2xl font-black text-white mt-2">{boardMetrics.straightRoutes}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500 font-bold">Curvas</p>
              <p className="text-2xl font-black text-white mt-2">{boardMetrics.curvedRoutes}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500 font-bold">Saidas usadas</p>
              <p className="text-sm font-black text-white mt-3">
                {boardMetrics.routeNumbers.length > 0 ? boardMetrics.routeNumbers.map((number) => `S${number}`).join(', ') : 'Nenhuma'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <p className="text-gray-400 text-[10px] uppercase font-bold tracking-[0.22em]">Modo de desenho</p>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {[
              { id: 'line', label: 'Reta' },
              { id: 'curve', label: 'Curva' },
              { id: 'select', label: 'Selecionar' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => switchTool(item.id)}
                className={`rounded-xl border px-3 py-3 text-sm font-bold transition-all ${tool === item.id ? 'border-blue-500 bg-blue-500 text-white shadow-lg shadow-blue-900/20' : 'border-white/10 bg-black/20 text-gray-300 hover:border-white/30 hover:text-white'}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 mt-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500 font-bold">Como usar</p>
            <p className="text-sm text-white mt-3 leading-relaxed">{helperText}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-gray-200">
                Azul = Saida 1
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-gray-200">
                Curva = inicio, controle, fim
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-gray-200">
                Clique errado = cancelar rota atual
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-gray-200">
                Selecionar = destacar ou apagar
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-800 p-4 rounded-lg border border-gray-700">
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setIsFullscreen((current) => !current)} className="px-3 py-2 rounded-lg text-sm font-bold bg-blue-600/15 text-blue-300 hover:bg-blue-600/25 border border-blue-500/40 flex items-center gap-2">
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
            {isFullscreen ? 'Sair' : 'Expandir'}
          </button>
          <button onClick={handleUndoLastRoute} className="px-3 py-2 rounded-lg text-sm font-bold bg-white/5 text-gray-200 hover:bg-white/10 border border-white/10">
            Desfazer ultima
          </button>
          <button
            onClick={handleCancelDraftRoute}
            disabled={!draftRoute}
            className={`px-3 py-2 rounded-lg text-sm font-bold border ${draftRoute ? 'bg-amber-500/10 text-amber-200 border-amber-500/30 hover:bg-amber-500/20' : 'bg-white/5 text-gray-500 border-white/10 cursor-not-allowed'}`}
          >
            Cancelar rota atual
          </button>
          <button
            onClick={handleDeleteSelectedRoute}
            disabled={!selectedRoute}
            className={`px-3 py-2 rounded-lg text-sm font-bold border ${selectedRoute ? 'bg-red-500/10 text-red-300 border-red-500/30 hover:bg-red-500/20' : 'bg-white/5 text-gray-500 border-white/10 cursor-not-allowed'}`}
          >
            Apagar selecionada
          </button>
          <button onClick={handleClearRoutes} className="px-3 py-2 rounded-lg text-sm font-bold bg-red-900/40 text-red-300 hover:bg-red-900/60 border border-red-800/80">
            Limpar tudo
          </button>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {selectedRoute && (
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-gray-100">
              Selecionada: {selectedRoute.routeLabel} ({selectedRoute.routeNumber})
            </div>
          )}
          {draftRoute && (
            <div className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[11px] font-bold text-amber-200">
              Rota em andamento
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center bg-black/50 rounded-lg p-2 border border-gray-700 overflow-hidden" style={{ cursor: tool === 'select' ? 'pointer' : 'crosshair' }}>
        <Stage
          width={STAGE_WIDTH}
          height={STAGE_HEIGHT}
          onMouseDown={handleStagePointerDown}
          onMouseMove={handleStagePointerMove}
          onTouchStart={handleStagePointerDown}
          onTouchMove={handleStagePointerMove}
          ref={stageRef}
        >
          <Layer listening={false}>
            <MapImage src={activeMapUrl} width={STAGE_WIDTH} height={STAGE_HEIGHT} />
          </Layer>

          <Layer>
            {lines.map((route) => {
              const isSelected = route.id === selectedRouteId;
              return (
                <React.Fragment key={route.id}>
                  {renderRouteShape(route, isSelected)}
                  {route.tool !== 'eraser' && renderRouteEndpoints(route)}
                  {route.tool !== 'eraser' && renderRouteBadge(route, isSelected)}
                </React.Fragment>
              );
            })}

            {renderDraftRoute()}

            {draftRoute && draftRoute.points.length >= 2 && (
              <Circle
                x={draftRoute.points[0]}
                y={draftRoute.points[1]}
                radius={5}
                fill={draftRoute.color}
                stroke="#ffffff"
                strokeWidth={1.4}
                listening={false}
              />
            )}
          </Layer>
        </Stage>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <form onSubmit={saveStrategy} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <h4 className="text-blue-400 font-bold mb-3">Salvar estrategia</h4>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ex: Saida 1 + retorno central"
              className="flex-1 bg-gray-900 border border-gray-600 rounded p-2 text-white text-sm focus:border-blue-500 outline-none"
              value={strategyName}
              onChange={(event) => setStrategyName(event.target.value)}
            />
            <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded text-sm">
              Salvar
            </button>
          </div>
        </form>

        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h4 className="text-green-400 font-bold">Estrategias salvas</h4>
            <span className="text-[11px] text-gray-400">{sortedSavedStrategies.length} registrada(s)</span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-3 mb-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleToggleAllSavedStrategies}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-gray-200 hover:bg-white/10 transition-all"
                >
                  {areAllSavedStrategiesSelected ? 'Limpar tudo' : 'Selecionar tudo'}
                </button>
                <button
                  type="button"
                  onClick={handleClearSavedStrategySelection}
                  disabled={selectedSavedStrategyIds.length === 0}
                  className={`rounded-xl border px-3 py-2 text-xs font-bold transition-all ${selectedSavedStrategyIds.length > 0 ? 'border-white/10 bg-white/5 text-gray-200 hover:bg-white/10' : 'border-white/10 bg-white/5 text-gray-500 cursor-not-allowed'}`}
                >
                  Limpar selecao
                </button>
              </div>

              <button
                type="button"
                onClick={handleDeleteSelectedSavedStrategies}
                disabled={selectedSavedStrategyIds.length === 0}
                className={`rounded-xl border px-3 py-2 text-xs font-bold transition-all flex items-center gap-2 ${selectedSavedStrategyIds.length > 0 ? 'border-red-500/20 bg-red-500/10 text-red-200 hover:bg-red-500 hover:text-white' : 'border-white/10 bg-white/5 text-gray-500 cursor-not-allowed'}`}
              >
                <Trash2 size={14} /> Excluir selecionadas ({selectedSavedStrategyIds.length})
              </button>
            </div>
          </div>

          <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
            {sortedSavedStrategies.map((strategy) => {
              const isLoaded = loadedStrategyId === strategy.id;
              const isSelectedForDelete = selectedSavedStrategyIds.includes(strategy.id);

              return (
                <div
                  key={strategy.id}
                  className={`rounded-2xl border p-3 ${isSelectedForDelete ? 'border-red-500/30 bg-red-500/10' : isLoaded ? 'border-green-500/30 bg-green-500/10' : 'border-white/10 bg-black/20'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <label className="flex items-start gap-3 flex-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSelectedForDelete}
                        onChange={() => toggleSavedStrategySelection(strategy.id)}
                        className="mt-1 h-4 w-4 accent-red-500 cursor-pointer"
                      />
                      <div>
                        <p className="text-sm font-bold text-white">{strategy.name}</p>
                        <p className="text-[11px] text-gray-400 mt-1">Salva em {formatStrategyDate(strategy)}</p>
                      </div>
                    </label>
                    <div className="flex items-center gap-2">
                      {isSelectedForDelete && (
                        <span className="rounded-full border border-red-500/20 bg-red-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-red-200">
                          Marcada
                        </span>
                      )}
                      {isLoaded && (
                        <span className="rounded-full border border-green-500/20 bg-green-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-green-200">
                          Aberta
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => loadStrategy(strategy.id)}
                      className="flex-1 rounded-xl border border-green-500/20 bg-green-500/10 px-3 py-2 text-xs font-bold text-green-200 hover:bg-green-500 hover:text-black transition-all flex items-center justify-center gap-2"
                    >
                      <FolderOpen size={14} /> Carregar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSavedStrategy(strategy.id, strategy.name)}
                      className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-200 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 size={14} /> Excluir
                    </button>
                  </div>
                </div>
              );
            })}

            {sortedSavedStrategies.length === 0 && (
              <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 px-4 py-6 text-center text-sm italic text-gray-500">
                Nenhuma estrategia salva ainda.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrategyBoard;
