import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { Heart, RefreshCw } from 'lucide-react';
import useGearShopContext from '../hooks/useGearShopContext';
import { WORKSHOP_REACTIONS } from '../utils/gearWorkshop';

export default function GearWorkshopCheers() {
  const { db, account, isStudent } = useGearShopContext();
  const [state, setState] = useState({ loaded: false, error: '', data: [] });
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!isStudent || !account.studentId || !db) return;
    return onSnapshot(collection(db, 'students', account.studentId, 'gearWorkshopReactions'), (snapshot) => setState({ loaded: true, error: '', data: snapshot.docs.map((item) => item.data()).filter((item) => item.targetStudentId === account.studentId) }), () => setState({ loaded: true, error: 'Não foi possível carregar os incentivos da sua oficina.', data: [] }));
  }, [db, account.studentId, isStudent, retry]);
  if (!isStudent) return null;
  return <section className="giro-workshop-cheers"><h3><Heart size={16} />Incentivos recebidos</h3><div>{WORKSHOP_REACTIONS.map((entry) => <span key={entry.id}>{entry.label}<strong>{!state.loaded || state.error ? '—' : state.data.filter((item) => item.type === entry.id).length}</strong></span>)}</div>{state.error && <p role="alert">{state.error}<button type="button" className="giro-studio-button" onClick={() => setRetry((value) => value + 1)}><RefreshCw size={12} />Tentar novamente</button></p>}</section>;
}
