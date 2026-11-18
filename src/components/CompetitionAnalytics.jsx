import { useState } from 'react';
import { BarChart3, ArrowRight, Timer } from 'lucide-react';
import { EmptyState, InterfaceButton } from './InterfacePrimitives';
import { competitionReliability } from '../utils/competition';

export default function CompetitionAnalytics({ records, matchSeconds, onNavigate }) {
  const [version, setVersion] = useState('');
  const summary = competitionReliability(records, matchSeconds, version);
  const versions = [...new Map(records.filter((item) => item?.practiceType === 'full_round' && item.robotVersionId).map((item) => [item.robotVersionId, item.robotVersionLabel || item.robotVersionId])).entries()];
  const max = Math.max(1, ...summary.recent.map((item) => item.score));
  return <section className="ng-panel ng-competition-analytics" aria-labelledby="competition-analytics-title">
    <div className="ng-section-header"><div><p className="ng-eyebrow"><BarChart3 size={13} />Da bancada para a decisão</p><h3 id="competition-analytics-title">Consistência vale mais que um recorde.</h3></div><label><span className="sr-only">Versão do robô nos testes</span><select aria-label="Versão do robô nos testes" value={version} onChange={(event) => setVersion(event.target.value)}><option value="">Todas as versões</option>{versions.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label></div>
    {summary.count ? <>
      <div className="ng-competition-analytics__metrics"><div><span>Mediana de pontos</span><strong>{summary.median.toLocaleString('pt-BR')}</strong></div><div><span>Melhor pontuação</span><strong>{summary.best.toLocaleString('pt-BR')}</strong></div><div><span>Dentro do tempo definido</span><strong>{summary.within === null ? 'A definir' : `${summary.within}/${summary.count}`}</strong></div></div>
      <ol className="ng-competition-analytics__bars" aria-label="Pontuações dos rounds completos, do mais antigo ao mais recente">{[...summary.recent].reverse().map((item, index) => <li key={item.id || `${item.date}-${index}`}><strong>{item.score}</strong><span style={{ height: `${Math.max(2, item.score / max * 100)}%` }} data-within={matchSeconds === null ? undefined : item.time <= matchSeconds} title={`${new Date(item.date).toLocaleDateString('pt-BR')}: ${item.score} pontos em ${item.time}s`} /><small>{index + 1}</small><span className="sr-only">{item.score} pontos em {item.time} segundos</span></li>)}</ol>
      <p className="ng-competition-analytics__caption">{summary.count} round{summary.count === 1 ? '' : 's'} completo{summary.count === 1 ? '' : 's'} mais recente{summary.count === 1 ? '' : 's'}, até 10 testes. Somente registros com pontuação, tempo e data válidos.{summary.count < 3 && ' Ainda há poucos testes para avaliar a repetição.'}</p>
      {matchSeconds !== null && <p className="ng-competition-analytics__caption">Verde: dentro do tempo configurado. Amarelo: acima desse tempo.</p>}
    </> : <EmptyState compact icon={<Timer size={25} />} title="Uma boa decisão começa com testes registrados." description="Os rounds completos da área Robô vão aparecer aqui. Testes de saída não são misturados com rounds completos." />}
    <div className="ng-competition-analytics__footer"><p>{matchSeconds === null ? 'Defina o tempo de round nas configurações quando o regulamento estiver disponível.' : `Referência configurada pela equipe: ${matchSeconds}s por round. Confira o regulamento vigente.`}</p><InterfaceButton onClick={() => onNavigate('rounds')}>Abrir testes do robô<ArrowRight size={15} /></InterfaceButton></div>
  </section>;
}
