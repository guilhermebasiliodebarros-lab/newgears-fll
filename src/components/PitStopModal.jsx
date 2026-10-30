import { useState, useEffect, useRef } from 'react';
import { Trophy } from 'lucide-react';
import { doc, runTransaction } from 'firebase/firestore';
import { db } from '../firebase';
import { assertActiveSeason } from '../services/teamProcesses';

const PitStopModal = ({ viewAsStudent, pitStopRecords, showNotification, seasonId }) => {
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [saving, setSaving] = useState(false);
  const pending = useRef(false);
  const [attempt, setAttempt] = useState(null);

  useEffect(() => {
      let interval;
      if (running) {
          interval = setInterval(() => setTime(Date.now() - startTime), 33);
      }
      return () => clearInterval(interval);
  }, [running, startTime]);

  const saveAttempt = async (value = attempt) => {
      if (pending.current || !value) return;
      pending.current = true; setSaving(true);
      const { id, elapsed } = value;
      const finalTime = (elapsed / 1000).toFixed(3);
      try {
              const name = viewAsStudent ? viewAsStudent.name : "Técnico";
              await runTransaction(db, async (transaction) => {
                  await assertActiveSeason(transaction, db, seasonId || 'legacy');
                  const ref = doc(db, 'pitstop_records', id);
                  const existing = await transaction.get(ref);
                  if (!existing.exists()) transaction.set(ref, { name, studentId: viewAsStudent?.id || '', seasonId: seasonId || 'legacy', time: Number(finalTime), date: new Date().toISOString() });
              });
              setAttempt(null);
              showNotification(`⏱️ ${finalTime}s registrado!`);
      } catch {
          showNotification('Não foi possível salvar o tempo. Tente novamente.', 'error');
      } finally {
          pending.current = false; setSaving(false);
      }
  };
const handleStartStop = async () => {
      if (pending.current) return;
      if (running) {
          setRunning(false);
          const elapsed = Math.max(0, Date.now() - startTime);
          setTime(elapsed);
          const result = { id: crypto.randomUUID(), elapsed };
          setAttempt(result);
          const finalTime = (elapsed / 1000).toFixed(3);
          if (window.confirm(`Salvar tempo de ${finalTime}s no Ranking?`)) await saveAttempt(result);
      } else {
          setAttempt(null);
          setTime(0);
          setStartTime(Date.now());
          setRunning(true);
      }
  };

  const ranking = pitStopRecords.filter((record) => Number.isFinite(Number(record.time)) && Number(record.time) > 0 && (!record.seasonId || record.seasonId === (seasonId || 'legacy'))).sort((a, b) => Number(a.time) - Number(b.time)).slice(0, 5);

  return (
      <div className="text-center">
          <h3 className="text-2xl font-black mb-2 text-white italic">PIT STOP F1</h3>
          <p className="text-xs text-gray-400 mb-8 uppercase tracking-widest">Treino de Troca de Garras</p>
          
          <div className="bg-black/50 border border-white/10 rounded-2xl p-8 mb-8">
              <div className={`text-6xl font-mono font-black tabular-nums tracking-tighter ${running ? 'text-yellow-400' : 'text-white'}`}>
                  {(time / 1000).toFixed(3)}<span className="text-lg text-gray-500 ml-1">s</span>
              </div>
          </div>
          <button disabled={saving} onClick={handleStartStop} className={`w-full py-6 rounded-xl font-black text-xl uppercase tracking-widest transition-all shadow-lg ${running ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/20' : 'bg-green-600 hover:bg-green-500 text-white shadow-green-900/20'}`}>
              {running ? '🛑 PARAR' : '🚀 INICIAR'}
          </button>
          {!running && attempt && <button disabled={saving} onClick={() => saveAttempt()} className="mt-3 w-full rounded-xl border border-white/20 p-3 text-white">{saving ? 'Salvando…' : 'Salvar este tempo'}</button>}
          <div className="mt-8 pt-8 border-t border-white/10 text-left">
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-4 flex items-center gap-2"><Trophy size={12} className="text-yellow-500"/> Top 5 Mais Rápidos</h4>
              <div className="space-y-2">{ranking.map((rec, i) => (<div key={rec.id} className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/5"><div className="flex items-center gap-3"><span className={`font-black text-sm w-4 ${i===0?'text-yellow-500':i===1?'text-gray-300':i===2?'text-orange-500':'text-gray-600'}`}>#{i+1}</span><span className="text-white text-sm font-bold">{rec.name}</span></div><span className="font-mono text-blue-400 font-bold">{Number(rec.time).toFixed(3)}s</span></div>))}{ranking.length === 0 && <p className="text-xs text-gray-600 italic text-center">Nenhum recorde ainda. Seja o primeiro!</p>}</div>
          </div>
      </div>
  );
}
export default PitStopModal;
