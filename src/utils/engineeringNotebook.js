export const ENGINEERING_TYPES = [
  { id: 'robot-test', label: 'Teste do robô', tag: '#teste-robo' }, { id: 'code', label: 'Alteração de programação', tag: '#programacao' },
  { id: 'problem', label: 'Problema e solução', tag: '#problema-solucao' }, { id: 'strategy', label: 'Estratégia de saída', tag: '#estrategia' },
  { id: 'project', label: 'Teste do projeto', tag: '#teste-projeto' },
];
export function buildEngineeringEntry(value) {
  const type = ENGINEERING_TYPES.find((item) => item.id === value.type);
  if (!type) throw Error('Selecione um tipo de registro.');
  const text = (key, max = 1500) => { if (typeof value[key] !== 'string' || value[key].length > max) throw Error('Revise o tamanho dos campos do registro.'); return value[key].trim(); };
  const date = text('date', 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(`${date}T12:00:00Z`).toISOString().slice(0, 10) !== date) throw Error('Informe a data do treino.');
  const objective = text('objective'); const result = text('result'); const nextStep = text('nextStep');
  if (!objective || !result || !nextStep) throw Error('Preencha objetivo, resultado e próximo passo.');
  const numeric = (key, max) => {
    const raw = value[key]; if (raw === '' || raw === null || raw === undefined) return null;
    if (typeof raw !== 'string' && typeof raw !== 'number') throw Error('Informe números válidos no teste.');
    const number = Number(raw); if (!Number.isInteger(number) || number < 0 || number > max) throw Error('Revise acertos, tentativas ou pontos.'); return number;
  };
  const attempts = numeric('attempts', 1000); const successes = numeric('successes', 1000); const score = numeric('score', 10000);
  if ((attempts === null) !== (successes === null) || (attempts !== null && (attempts < 1 || successes > attempts))) throw Error('Informe acertos e tentativas juntos; acertos não podem superar tentativas.');
  const lines = [`${type.tag} #engenharia`, `${type.label} · ${date}`, `Responsáveis: ${text('responsible', 300) || 'Não informado'}`, `Objetivo: ${objective}`,
    text('configuration') && `Configuração / versão / saída: ${value.configuration.trim()}`, text('hypothesis') && `Problema ou hipótese: ${value.hypothesis.trim()}`,
    text('change') && `Alteração / solução aplicada: ${value.change.trim()}`, `Resultado: ${result}`,
    attempts !== null && `Consistência neste teste: ${successes}/${attempts} (${Math.round(successes / attempts * 100)}%). Não é previsão de desempenho no torneio.`,
    score !== null && `Pontuação observada no treino: ${score}. Conferir conforme regras da temporada.`, `Próximo passo: ${nextStep}`];
  return lines.filter((line) => line !== false && line !== '').join('\n');
}
