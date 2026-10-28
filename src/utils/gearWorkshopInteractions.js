import { gearItem, resolveGearEquipment } from './gearShop.js';
import { gearCollectionProgress } from './gearCollections.js';
import { clampWorkshopPoint, resolveGearWorkshop } from './gearWorkshop.js';

const step = (action, target, duration, status, extra = {}) => ({ action, target, duration, status, ...extra });
const walk = (target, status = 'O Giro está caminhando pela oficina.') => step('walk', target, 1100, status);
const home = () => walk('home', 'O Giro está voltando para seu cantinho.');

export const workshopResidentPosition = (target, layout) => {
  const positions = resolveGearWorkshop({ layout }).layout;
  if (target === 'bench') return clampWorkshopPoint('giro', { x: positions.bench.x + (positions.bench.x > 480 ? -95 : 95), y: positions.bench.y + 5 });
  if (target === 'decor') return clampWorkshopPoint('giro', { x: positions.decor.x + (positions.decor.x > 400 ? -85 : 85), y: positions.decor.y + 65 });
  if (target === 'light') return clampWorkshopPoint('giro', { x: positions.light.x, y: 310 });
  if (target === 'center') return { x: 400, y: 320 };
  return positions.giro;
};

const accessoryMoment = (accessory) => {
  const variants = {
    headphones: ['stage', 'music', 'O Giro ajustou os fones e entrou no ritmo!'],
    visor: ['scan', 'scan', 'O visor está verificando os circuitos da oficina.'],
    goggles: ['scan', 'scan', 'Os óculos de inventor revelaram uma nova ideia.'],
    helmet: ['discover', 'orbit', 'Capacete pronto! O Giro está explorando as estrelas.'],
    antenna: ['discover', 'signal', 'A antena captou um sinal cheio de ideias!'],
    crown: ['salute', 'victory', 'O Giro celebra a cooperação com sua coroa.'],
    medal: ['salute', 'victory', 'O Giro mostra com orgulho a medalha da equipe.'],
  };
  const [action, effect, status] = variants[accessory] || ['wave', '', 'O Giro acenou para você!'];
  return step(action, 'home', 2400, status, { effect });
};

export const buildWorkshopInteraction = ({ action, equipment, lightOn = true, collectionId, owned = [] }) => {
  const selected = resolveGearEquipment(equipment);
  const decor = gearItem(selected.decor).variant;
  const accessory = gearItem(selected.accessory).variant;
  const work = step('work', 'bench', 2400, 'O Giro está montando uma invenção com sua chave de ferramentas.', { heldItem: 'wrench', effect: 'forge' });
  const decorate = step(decor === 'planet' ? 'discover' : decor === 'tools' ? 'work' : 'wave', 'decor', 2400,
    decor === 'planet' ? 'O Giro colocou o mini planeta para girar!' : decor === 'tools' ? 'O Giro está escolhendo as ferramentas para a próxima invenção.' : decor === 'trophy' ? 'O Giro levantou o troféu da cooperação!' : 'O Giro está admirando a placa da equipe.',
    { heldItem: decor === 'tools' ? 'wrench' : decor === 'trophy' ? 'trophy' : '', effect: decor === 'planet' ? 'orbit' : decor === 'trophy' ? 'victory' : '' });
  if (action === 'work') return [walk('bench', 'O Giro está indo até a bancada.'), work, home()];
  if (action === 'decorate') return [walk('decor', 'O Giro foi investigar sua decoração.'), decorate, home()];
  if (action === 'light') return [walk('light', 'O Giro está indo até o controle da luminária.'), step('switch', 'light', 1400, lightOn ? 'O Giro apagou a luminária.' : 'O Giro acendeu a luminária!', { lightOn: !lightOn, effect: 'signal' }), home()];
  if (action === 'accessory') return [accessoryMoment(accessory)];
  if (action === 'tour') return [walk('bench'), work, walk('light'), step('switch', 'light', 1400, 'O Giro conferiu a iluminação da oficina.', { effect: 'signal' }), walk('decor'), decorate, home(), accessoryMoment(accessory)];
  if (action === 'collection') {
    if (!gearCollectionProgress(collectionId, owned).complete) return [];
    const performances = {
      mechanic: [walk('bench'), { ...work, duration: 3000 }, step('celebrate', 'bench', 1800, 'Invenção pronta! A forja está cheia de ideias.', { effect: 'forge' }), home()],
      space: [walk('decor'), step('discover', 'decor', 3200, 'Missão gravidade zero: o Giro descobriu uma nova órbita!', { effect: 'orbit' }), step('hop', 'decor', 1800, 'Um salto entre as estrelas!', { effect: 'orbit' }), home()],
      neon: [walk('center'), step('stage', 'center', 4200, 'Show de circuitos! O Giro dança com o equalizador da oficina.', { effect: 'music' }), home()],
      tournament: [walk('decor'), step('salute', 'decor', 2400, 'Esse troféu é de toda a equipe!', { heldItem: 'trophy', effect: 'victory' }), walk('center'), step('celebrate', 'center', 1800, 'Uma volta para celebrar a cooperação.', { heldItem: 'trophy', effect: 'victory' }), home()],
      racing: [walk('bench'), step('scan', 'bench', 1400, 'Motor conferido. Preparar para a largada!', { effect: 'scan' }), step('race', 'decor', 1900, 'Bandeira liberada! O Giro acelera pela oficina.', { heldItem: 'flag', effect: 'racing' }), step('celebrate', 'decor', 1600, 'Linha de chegada! Mais uma volta cheia de ideias.', { heldItem: 'flag', effect: 'racing' }), home()],
    };
    return (performances[collectionId] || []).map((entry) => ({ ...entry, collectionId }));
  }
  if (['stage', 'celebrate'].includes(action)) return [step(action, 'home', 3600, 'O Giro está comemorando com você!')];
  return [];
};
