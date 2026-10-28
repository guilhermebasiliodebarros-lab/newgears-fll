import { Check, LockKeyhole, Play, X } from 'lucide-react';
import { GearWorkshopScene } from './GearWorkshop';
import useWorkshopInteraction from '../hooks/useWorkshopInteraction';
import { gearCollectionProgress } from '../utils/gearCollections';

export default function GearCollectionCard({ collection, owned, ready, onExplore }) {
  const progress = gearCollectionProgress(collection.id, owned);
  const complete = ready && progress.complete;
  const performance = useWorkshopInteraction({ equipment: collection.equipment, owned: ready ? owned : [] });
  const remainingPrice = progress.missing.reduce((sum, item) => sum + item.price, 0);
  return <article className={`giro-collection ${complete ? 'giro-collection--complete' : ''}`} style={{ '--collection-accent': collection.accent }}>
    <GearWorkshopScene equipment={collection.equipment} activity={performance.activity} animationKey={performance.animationKey} lightOn={performance.lightOn} compact still={!performance.activity} />
    <div className="giro-collection__body">
      <div className="giro-collection__title"><h3>{collection.name}</h3>{complete && <span><Check size={13} />Completa</span>}</div>
      <p>{collection.description}</p>
      <div className="giro-collection__progress" role="progressbar" aria-label={`Coleção ${collection.name}`} aria-valuemin={0} aria-valuemax={progress.items.length} aria-valuenow={progress.count}><span style={{ width: `${progress.count / progress.items.length * 100}%` }} /></div>
      <p>{progress.count} de {progress.items.length} peças na sua coleção</p>
      <div className="giro-collection__reward">
        <strong>{complete ? <Check size={15} /> : <LockKeyhole size={15} />}{complete ? 'Interação liberada' : 'Bônus da coleção'} · {progress.reward.name}</strong>
        <p>{progress.reward.description}</p>
        <p>{complete ? 'Já é sua! Experimente aqui ou na Minha oficina.' : 'Liberada automaticamente ao possuir todas as peças, sem custo adicional.'}</p>
        <button type="button" className="giro-studio-button" disabled={!complete} onClick={() => performance.play('collection', collection.id)}><Play size={14} />{complete ? `Reproduzir ${progress.reward.name}` : 'Complete para liberar'}</button>
        {performance.activity && <button type="button" className="giro-studio-button" onClick={performance.stop}><X size={14} />Encerrar prévia</button>}
        {performance.activity && <p role="status">{performance.activity.status}</p>}
      </div>
      {progress.missing.length > 0 && <details className="giro-collection__missing"><summary>Ver {progress.missing.length} peça(s) que faltam · {remainingPrice} Gears</summary><ul>{progress.missing.map((item) => <li key={item.id}><button type="button" onClick={() => onExplore(item.id)}><span>{item.name}</span><strong>{item.price} Gears</strong></button></li>)}</ul></details>}
      <button type="button" className="giro-studio-button mt-4 w-full" onClick={() => onExplore()}>Explorar {collection.name}</button>
    </div>
  </article>;
}
