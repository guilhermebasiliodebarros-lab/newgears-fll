import React from 'react';
import { Trophy, X, AlertTriangle } from 'lucide-react';

const RankingPanel = ({ students, setActiveTab }) => {
  // Organiza os alunos do maior XP para o menor
  const sortedStudents = [...students].sort((a, b) => (b.xp || 0) - (a.xp || 0));

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-[#151520] w-full max-w-5xl p-6 rounded-2xl shadow-2xl border border-white/10 relative flex flex-col max-h-[85vh]">
        
        {/* Botão Fechar */}
        <button 
          onClick={() => setActiveTab('dashboard')}
          className="absolute top-4 right-4 text-gray-500 hover:text-white p-2 bg-white/5 rounded-lg z-10 transition-colors"
        >
          <X size={24}/>
        </button>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4 pr-12">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Trophy className="w-7 h-7 mr-3 text-yellow-500" />
            Ranking da Temporada
          </h2>
          <span className="bg-white/5 border border-white/10 text-gray-400 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
            Meta Mínima: 420 XP
          </span>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {sortedStudents.map((student, index) => {
          // A regra implacável: Menos de 420 vai pro vermelho!
          const inRiskZone = (student.xp || 0) < 420;
          
          // Pódio: Ouro, Prata e Bronze
          let positionColor = "text-gray-500";
          if (index === 0) positionColor = "text-yellow-500 drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]";
          if (index === 1) positionColor = "text-gray-300 drop-shadow-[0_0_5px_rgba(209,213,219,0.5)]";
          if (index === 2) positionColor = "text-amber-600 drop-shadow-[0_0_5px_rgba(217,119,6,0.5)]";

          return (
            <div key={student.id} className={`flex items-center justify-between p-3 rounded-xl border-l-4 transition-all ${inRiskZone ? 'bg-red-500/5 border-red-500 hover:bg-red-500/10' : 'bg-black/40 border-green-500 hover:bg-white/5'}`}>
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className={`font-black text-lg w-6 shrink-0 ${positionColor}`}>
                  #{index + 1}
                </div>
                <div className="overflow-hidden">
                  <p className={`font-bold text-sm truncate ${inRiskZone ? 'text-red-400' : 'text-gray-200'}`}>
                    {student.name}
                  </p>
                  {inRiskZone && (
                    <p className="text-[10px] font-bold text-red-500 flex items-center mt-0.5 truncate">
                      <AlertTriangle className="w-3 h-3 mr-1 shrink-0" />
                      Abaixo da meta
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center text-right shrink-0 pl-2">
                <span className={`text-lg font-black ${inRiskZone ? 'text-red-500' : 'text-green-500'}`}>{student.xp || 0}</span>
                <span className={`text-[10px] font-bold ml-1 ${inRiskZone ? 'text-red-700' : 'text-green-700'}`}>XP</span>
              </div>
            </div>
          );
        })}
          </div>
        </div>
      </div>
    </div>
  );
};
export default RankingPanel;