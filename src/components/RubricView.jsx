import React from 'react';
import { Search, Lightbulb, Wrench, RotateCcw, Megaphone } from 'lucide-react';

const getRubricSummary = (items, values) => {
  const total = items.reduce((sum, item) => sum + (values[item.key] || 1), 0);
  const average = total / items.length;
  const progress = (average / 4) * 100;

  let label = 'Base Inicial';
  if (average >= 3.5) label = 'Nivel Exemplar';
  else if (average >= 2.5) label = 'Nivel Forte';
  else if (average >= 1.5) label = 'Em Evolucao';

  return { average: average.toFixed(1), progress, label };
};

const RubricView = ({ innovationRubric, robotDesignRubric, handleRubricUpdate }) => {
  const innovationRubricItems = [
    { key: 'identificacao', name: 'Identificacao', icon: <Search size={16} />, color: 'text-blue-400' },
    { key: 'design', name: 'Design', icon: <Lightbulb size={16} />, color: 'text-yellow-400' },
    { key: 'criacao', name: 'Criacao', icon: <Wrench size={16} />, color: 'text-pink-400' },
    { key: 'iteracao', name: 'Iteracao', icon: <RotateCcw size={16} />, color: 'text-green-400' },
    { key: 'comunicacao', name: 'Comunicacao', icon: <Megaphone size={16} />, color: 'text-purple-400' },
  ];

  const robotDesignRubricItems = [
    { key: 'identificacao', name: 'Identificacao', icon: <Search size={16} />, color: 'text-blue-400' },
    { key: 'design', name: 'Design', icon: <Lightbulb size={16} />, color: 'text-yellow-400' },
    { key: 'criacao', name: 'Criacao', icon: <Wrench size={16} />, color: 'text-pink-400' },
    { key: 'iteracao', name: 'Iteracao', icon: <RotateCcw size={16} />, color: 'text-green-400' },
    { key: 'comunicacao', name: 'Comunicacao', icon: <Megaphone size={16} />, color: 'text-purple-400' },
  ];

  const innovationSize = 300;
  const innovationCenter = innovationSize / 2;
  const innovationRadius = (innovationSize / 2) - 60;
  const innovationMaxVal = 4;
  const innovationAngleSlice = (Math.PI * 2) / innovationRubricItems.length;

  const getInnovationCoords = (value, index) => {
    const angle = index * innovationAngleSlice - (Math.PI / 2);
    const r = (value / innovationMaxVal) * innovationRadius;
    return {
      x: innovationCenter + Math.cos(angle) * r,
      y: innovationCenter + Math.sin(angle) * r,
    };
  };

  const innovationPoints = innovationRubricItems.map((item, i) => {
    const val = innovationRubric[item.key] || 1;
    const { x, y } = getInnovationCoords(val, i);
    return `${x},${y}`;
  }).join(' ');

  const robotSize = 300;
  const robotCenter = robotSize / 2;
  const robotRadius = (robotSize / 2) - 60;
  const robotMaxVal = 4;
  const robotAngleSlice = (Math.PI * 2) / robotDesignRubricItems.length;

  const getRobotCoords = (value, index) => {
    const angle = index * robotAngleSlice - (Math.PI / 2);
    const r = (value / robotMaxVal) * robotRadius;
    return {
      x: robotCenter + Math.cos(angle) * r,
      y: robotCenter + Math.sin(angle) * r,
    };
  };

  const robotPoints = robotDesignRubricItems.map((item, i) => {
    const val = robotDesignRubric[item.key] || 1;
    const { x, y } = getRobotCoords(val, i);
    return `${x},${y}`;
  }).join(' ');

  const innovationSummary = getRubricSummary(innovationRubricItems, innovationRubric);
  const robotSummary = getRubricSummary(robotDesignRubricItems, robotDesignRubric);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-[#151520] border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6"><Lightbulb className="text-yellow-500" /> Rubrica: Projeto de Inovacao</h3>
        <div className="mb-6 rounded-2xl border border-yellow-500/20 bg-black/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-yellow-400 font-bold">Media Geral</span>
            <span className="text-white font-black text-xl">{innovationSummary.average}<span className="text-xs text-gray-500 ml-1">/4</span></span>
          </div>
          <div className="w-full h-2 rounded-full bg-black/60 overflow-hidden mb-2">
            <div className="h-full rounded-full bg-gradient-to-r from-yellow-500 via-orange-400 to-pink-500" style={{ width: `${innovationSummary.progress}%` }}></div>
          </div>
          <p className="text-xs text-gray-300">{innovationSummary.label}</p>
        </div>
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="relative flex-shrink-0">
            <svg width={innovationSize} height={innovationSize} className="mx-auto bg-black/20 rounded-full border border-white/5">
              {[1, 2, 3, 4].map(level => <circle key={level} cx={innovationCenter} cy={innovationCenter} r={(level / innovationMaxVal) * innovationRadius} fill="none" stroke="#333" strokeWidth="1" strokeDasharray="4 4" />)}
              {innovationRubricItems.map((_, i) => { const { x, y } = getInnovationCoords(innovationMaxVal, i); return <line key={i} x1={innovationCenter} y1={innovationCenter} x2={x} y2={y} stroke="#333" strokeWidth="1" />; })}
              <polygon points={innovationPoints} fill="rgba(234, 179, 8, 0.3)" stroke="#eab308" strokeWidth="2" />
              {innovationRubricItems.map((item, i) => { const val = innovationRubric[item.key] || 1; const { x, y } = getInnovationCoords(val, i); return <circle key={i} cx={x} cy={y} r="4" fill="#eab308" />; })}
              {innovationRubricItems.map((item, i) => { const { x, y } = getInnovationCoords(innovationMaxVal + 1.2, i); return <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="10" fontWeight="bold">{item.name}</text>; })}
            </svg>
          </div>
          <div className="flex-1 w-full grid grid-cols-1 gap-6">
            {innovationRubricItems.map(item => (
              <div key={item.key}>
                <div className="flex justify-between items-center mb-2">
                  <label className={`font-bold text-sm flex items-center gap-2 ${item.color}`}>{item.icon} {item.name}</label>
                  <span className="text-white font-black text-lg bg-black/30 px-2 rounded">{innovationRubric[item.key] || 1}</span>
                </div>
                <input type="range" min="1" max="4" value={innovationRubric[item.key] || 1} onChange={(e) => handleRubricUpdate('innovation', item.key, e.target.value)} className={`w-full h-2 rounded-lg appearance-none cursor-pointer slider-${item.key} bg-gray-700`} />
                <div className="flex justify-between text-[10px] text-gray-500 mt-1 px-1"><span>Iniciante</span><span>Em Desenv.</span><span>Praticante</span><span>Exemplar</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#151520] border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6"><Wrench className="text-blue-500" /> Rubrica: Design do Robo</h3>
        <div className="mb-6 rounded-2xl border border-blue-500/20 bg-black/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-blue-400 font-bold">Media Geral</span>
            <span className="text-white font-black text-xl">{robotSummary.average}<span className="text-xs text-gray-500 ml-1">/4</span></span>
          </div>
          <div className="w-full h-2 rounded-full bg-black/60 overflow-hidden mb-2">
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500" style={{ width: `${robotSummary.progress}%` }}></div>
          </div>
          <p className="text-xs text-gray-300">{robotSummary.label}</p>
        </div>
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="relative flex-shrink-0">
            <svg width={robotSize} height={robotSize} className="mx-auto bg-black/20 rounded-full border border-white/5">
              {[1, 2, 3, 4].map(level => <circle key={level} cx={robotCenter} cy={robotCenter} r={(level / robotMaxVal) * robotRadius} fill="none" stroke="#333" strokeWidth="1" strokeDasharray="4 4" />)}
              {robotDesignRubricItems.map((_, i) => { const { x, y } = getRobotCoords(robotMaxVal, i); return <line key={i} x1={robotCenter} y1={robotCenter} x2={x} y2={y} stroke="#333" strokeWidth="1" />; })}
              <polygon points={robotPoints} fill="rgba(59, 130, 246, 0.3)" stroke="#3b82f6" strokeWidth="2" />
              {robotDesignRubricItems.map((item, i) => { const val = robotDesignRubric[item.key] || 1; const { x, y } = getRobotCoords(val, i); return <circle key={i} cx={x} cy={y} r="4" fill="#3b82f6" />; })}
              {robotDesignRubricItems.map((item, i) => { const { x, y } = getRobotCoords(robotMaxVal + 1.2, i); return <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="10" fontWeight="bold">{item.name}</text>; })}
            </svg>
          </div>
          <div className="flex-1 w-full grid grid-cols-1 gap-6">
            {robotDesignRubricItems.map(item => (
              <div key={item.key}>
                <div className="flex justify-between items-center mb-2">
                  <label className={`font-bold text-sm flex items-center gap-2 ${item.color}`}>{item.icon} {item.name}</label>
                  <span className="text-white font-black text-lg bg-black/30 px-2 rounded">{robotDesignRubric[item.key] || 1}</span>
                </div>
                <input type="range" min="1" max="4" value={robotDesignRubric[item.key] || 1} onChange={(e) => handleRubricUpdate('robot_design', item.key, e.target.value)} className={`w-full h-2 rounded-lg appearance-none cursor-pointer slider-${item.key} bg-gray-700`} />
                <div className="flex justify-between text-[10px] text-gray-500 mt-1 px-1"><span>Iniciante</span><span>Em Desenv.</span><span>Praticante</span><span>Exemplar</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RubricView;
