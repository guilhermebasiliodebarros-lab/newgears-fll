import React, { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

const PitStopModal = ({ viewAsStudent, pitStopRecords, showNotification }) => {
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [startTime, setStartTime] = useState(0);

  useEffect(() => {
      let interval;
      if (running) {
          interval = setInterval(() => setTime(Date.now() - startTime), 10);
      }
      return () => clearInterval(interval);
  }, [running, startTime]);

  const handleStartStop = async () => {
      if (running) {
          setRunning(false);
          const finalTime = (time / 1000).toFixed(3);
          if (window.confirm(`Salvar tempo de ${finalTime}s no Ranking?`)) {
              const name = viewAsStudent ? viewAsStudent.name : "Técnico";
              await addDoc(collection(db, "pitstop_records"), {
                  name, time: parseFloat(finalTime), date: new Date().toISOString()
              });
              showNotification(`⏱️ ${finalTime}s registrado!`);
          }
      } else {
          setTime(0);
          setStartTime(Date.now());
          setRunning(true);
      }
  };

  return (
      <div className="text-center">
          <h3 className="text-2xl font-black mb-2 text-white italic">PIT STOP F1</h3>
          <p className="text-xs text-gray-400 mb-8 uppercase tracking-widest">Treino de Troca de Garras</p>
          
          <div className="bg-black/50 border border-white/10 rounded-2xl p-8 mb-8">
              <div className={`text-6xl font-mono font-black tabular-nums tracking-tighter ${running ? 'text-yellow-400' : 'text-white'}`}>
                  {(time / 1000).toFixed(3)}<span className="text-lg text-gray-500 ml-1">s</span>
              </div>
          </div>
          <button onClick={handleStartStop} className={`w-full py-6 rounded-xl font-black text-xl uppercase tracking-widest transition-all shadow-lg ${running ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/20' : 'bg-green-600 hover:bg-green-500 text-white shadow-green-900/20'}`}>
              {running ? '🛑 PARAR' : '🚀 INICIAR'}
          </button>
          <div className="mt-8 pt-8 border-t border-white/10 text-left">
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-4 flex items-center gap-2"><Trophy size={12} className="text-yellow-500"/> Top 5 Mais Rápidos</h4>
              <div className="space-y-2">{pitStopRecords.map((rec, i) => (<div key={rec.id} className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/5"><div className="flex items-center gap-3"><span className={`font-black text-sm w-4 ${i===0?'text-yellow-500':i===1?'text-gray-300':i===2?'text-orange-500':'text-gray-600'}`}>#{i+1}</span><span className="text-white text-sm font-bold">{rec.name}</span></div><span className="font-mono text-blue-400 font-bold">{rec.time.toFixed(3)}s</span></div>))}{pitStopRecords.length === 0 && <p className="text-xs text-gray-600 italic text-center">Nenhum recorde ainda. Seja o primeiro!</p>}</div>
          </div>
      </div>
  );
}
export default PitStopModal;