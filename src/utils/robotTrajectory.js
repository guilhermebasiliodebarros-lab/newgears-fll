export const TRAJECTORY_MAX_POINTS = 80;
export const TRAJECTORY_ACTIONS = { none: 'Sem ação', open: 'Abrir garra', close: 'Fechar garra', raise: 'Levantar garra', lower: 'Baixar garra' };
export const TRAJECTORY_DEFAULTS = { width: 240, height: 120, robotWidth: 16, robotLength: 20, heading: 0, map: 'bioglow', robotName: 'Robô da equipe', robotVersionId: '', gripperName: '', gripperId: '', gripperLength: 0, gripperWidth: 0, gripperX: 0, gripperY: 0 };
export const trajectoryPoint = (point) => ({ direction: 'forward', path: 'line', controlX: 0, controlY: 0, ...point });
export const newTrajectory = () => ({ title: '', roundId: '', exitNumber: 0, notes: '', settings: { ...TRAJECTORY_DEFAULTS }, points: [], obstacles: [] });
export const trajectoryNumber = (value) => Math.round(value * 10) / 10;
export const normalizeHeading = (angle) => ((angle + 180) % 360 + 360) % 360 - 180;

export function validateTrajectory(input, { allowEmpty = false } = {}) {
  if (!input || typeof input !== 'object') throw new Error('Plano de trajeto inválido.');
  const settings = { ...TRAJECTORY_DEFAULTS, ...input.settings }; const { points } = input;
  const title = typeof input.title === 'string' ? input.title.trim() : '';
  const exitNumber = input.exitNumber ?? 0;
  if (!Number.isInteger(exitNumber) || exitNumber < 0 || exitNumber > 8) throw new Error('Escolha uma saída de 1 a 8, ou deixe o plano independente.');
  if ((!allowEmpty && title.length < 3) || title.length > 100) throw new Error('Dê um nome de 3 a 100 caracteres ao trajeto.');
  if (typeof input.notes !== 'string' || input.notes.length > 2000 || typeof input.roundId !== 'string' || !/^[a-zA-Z0-9_-]{0,160}$/.test(input.roundId)) throw new Error('Confira a saída vinculada e limite as observações a 2.000 caracteres.');
  if (!settings || !['grid', 'bioglow'].includes(settings.map)
    || !['width', 'height'].every((key) => Number.isFinite(settings[key]) && settings[key] >= 50 && settings[key] <= 500)
    || !['robotWidth', 'robotLength'].every((key) => Number.isFinite(settings[key]) && settings[key] >= 5 && settings[key] <= 50)
    || !Number.isFinite(settings.heading) || settings.heading < -180 || settings.heading > 180) throw new Error('Confira as medidas do campo, do robô e a orientação inicial.');
  if (!Array.isArray(points) || points.length > TRAJECTORY_MAX_POINTS || (!allowEmpty && points.length < 2)) throw new Error('Marque de 2 a 80 pontos para formar o trajeto.');
  if (!['robotName', 'gripperName'].every((key) => typeof settings[key] === 'string' && settings[key].length <= 100)
    || !['robotVersionId', 'gripperId'].every((key) => typeof settings[key] === 'string' && /^[a-zA-Z0-9_-]{0,160}$/.test(settings[key]))
    || !['gripperLength', 'gripperWidth'].every((key) => Number.isFinite(settings[key]) && settings[key] >= 0 && settings[key] <= 80)
    || !['gripperX', 'gripperY'].every((key) => Number.isFinite(settings[key]) && Math.abs(settings[key]) <= 100)
    || Boolean(settings.gripperLength) !== Boolean(settings.gripperWidth)) throw new Error('Confira o nome, as medidas e a posição da garra.');
  const ids = new Set();
  const cleanPoints = points.map((raw) => {
    const point = trajectoryPoint(raw);
    if (!point || typeof point.id !== 'string' || !/^[a-zA-Z0-9_-]{1,80}$/.test(point.id) || ids.has(point.id)
      || !Number.isFinite(point.x) || point.x < 0 || point.x > settings.width || !Number.isFinite(point.y) || point.y < 0 || point.y > settings.height
      || !Object.hasOwn(TRAJECTORY_ACTIONS, point.action) || typeof point.note !== 'string' || point.note.length > 200
      || !['forward', 'reverse'].includes(point.direction) || !['line', 'curve'].includes(point.path)
      || !Number.isFinite(point.controlX) || !Number.isFinite(point.controlY)
      || (point.path === 'curve' && (point.controlX < 0 || point.controlX > settings.width || point.controlY < 0 || point.controlY > settings.height))) throw new Error('Confira os pontos, a direção e o controle das curvas dentro do campo.');
    ids.add(point.id);
    return { id: point.id, x: point.x, y: point.y, action: point.action, note: point.note, direction: point.direction, path: point.path, controlX: point.controlX, controlY: point.controlY };
  });
  const obstacles = input.obstacles ?? [];
  if (!Array.isArray(obstacles) || obstacles.length > 40) throw new Error('Use no máximo 40 missões e obstáculos por plano.');
  const obstacleIds = new Set();
  const cleanObstacles = obstacles.map((item) => {
    if (!item || typeof item.id !== 'string' || !/^[a-zA-Z0-9_-]{1,80}$/.test(item.id) || obstacleIds.has(item.id)
      || typeof item.name !== 'string' || item.name.trim().length < 1 || item.name.length > 80 || !['mission', 'obstacle'].includes(item.type)
      || !Number.isFinite(item.x) || item.x < 0 || item.x > settings.width || !Number.isFinite(item.y) || item.y < 0 || item.y > settings.height
      || !['width', 'height'].every((key) => Number.isFinite(item[key]) && item[key] >= 1 && item[key] <= 200)
      || !Number.isFinite(item.heading) || Math.abs(item.heading) > 180) throw new Error('Confira os nomes, posições e medidas das missões e obstáculos.');
    obstacleIds.add(item.id);
    return { id: item.id, name: item.name.trim(), type: item.type, x: item.x, y: item.y, width: item.width, height: item.height, heading: item.heading };
  });
  return { title, roundId: input.roundId, exitNumber, notes: input.notes, settings: Object.fromEntries(Object.keys(TRAJECTORY_DEFAULTS).map((key) => [key, settings[key]])), points: cleanPoints, obstacles: cleanObstacles };
}

export function curvePosition(from, to, fraction) {
  const t = fraction; const u = 1 - t;
  return { x: u * u * from.x + 2 * u * t * to.controlX + t * t * to.x, y: u * u * from.y + 2 * u * t * to.controlY + t * t * to.y };
}
function curveHeading(from, to, fraction) {
  let x = (1 - fraction) * (to.controlX - from.x) + fraction * (to.x - to.controlX);
  let y = (1 - fraction) * (to.controlY - from.y) + fraction * (to.y - to.controlY);
  if (Math.hypot(x, y) < 0.001) { x = to.x - from.x; y = to.y - from.y; }
  return Math.atan2(y, x) * 180 / Math.PI + (to.direction === 'reverse' ? 180 : 0);
}
function curveLength(from, to) {
  let length = 0; let previous = from;
  for (let index = 1; index <= 40; index++) { const next = curvePosition(from, to, index / 40); length += Math.hypot(next.x - previous.x, next.y - previous.y); previous = next; }
  return length;
}
export function trajectoryPath(plan) {
  return plan.points.map((point, index) => !index ? `M ${point.x} ${plan.settings.height - point.y}` : point.path === 'curve' ? `Q ${point.controlX} ${plan.settings.height - point.controlY} ${point.x} ${plan.settings.height - point.y}` : `L ${point.x} ${plan.settings.height - point.y}`).join(' ');
}

export function trajectoryExitNumber(plan, rounds = []) {
  if (Number.isInteger(plan?.exitNumber) && plan.exitNumber >= 1 && plan.exitNumber <= 8) return plan.exitNumber;
  const name = rounds.find((round) => round.id === plan?.roundId)?.name || plan?.title || '';
  return Number(name.match(/^sa[ií]da\s*0?([1-8])(?:\D|$)/i)?.[1] || 0);
}

export function trajectoriesForExit(records, number, rounds = []) {
  return records.filter((record) => trajectoryExitNumber(record, rounds) === number).sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')));
}

// Coordinates are in cm, with origin at the lower left and positive angles counterclockwise.
export function trajectoryCommands(plan) {
  const commands = [];
  let heading = plan.settings.heading;
  const action = (point, index) => {
    if (point.action !== 'none') commands.push({ type: 'gripper', action: point.action, point: index, x: point.x, y: point.y, heading, label: TRAJECTORY_ACTIONS[point.action] });
  };
  if (!plan.points.length) return commands;
  action(plan.points[0], 0);
  for (let index = 1; index < plan.points.length; index++) {
    const from = plan.points[index - 1]; const to = plan.points[index];
    const curved = to.path === 'curve'; const reverse = to.direction === 'reverse';
    const distance = curved ? curveLength(from, to) : Math.hypot(to.x - from.x, to.y - from.y);
    if (distance > 0.001) {
      const nextHeading = curved ? curveHeading(from, to, 0) : Math.atan2(to.y - from.y, to.x - from.x) * 180 / Math.PI + (reverse ? 180 : 0);
      const angle = normalizeHeading(nextHeading - heading);
      if (Math.abs(angle) > 0.05) commands.push({ type: 'turn', angle, fromHeading: heading, heading: heading + angle, x: from.x, y: from.y, point: index, label: `Virar ${trajectoryNumber(Math.abs(angle))}° à ${angle > 0 ? 'esquerda' : 'direita'}` });
      heading += angle;
      const fromHeading = heading;
      if (curved) heading += normalizeHeading(curveHeading(from, to, 1) - heading);
      commands.push({ type: curved ? 'curve' : 'move', direction: reverse ? 'reverse' : 'forward', distance, fromX: from.x, fromY: from.y, controlX: to.controlX ?? 0, controlY: to.controlY ?? 0, fromHeading, x: to.x, y: to.y, heading, point: index, label: `${curved ? 'Curva suave' + (reverse ? ' de ré' : '') : reverse ? 'Recuar' : 'Avançar'} ${trajectoryNumber(distance)} cm até o ponto ${index + 1}` });
    }
    action(to, index);
  }
  return commands;
}

export function trajectoryTimeline(plan) {
  let elapsed = 0;
  return trajectoryCommands(plan).map((command) => {
    const duration = Math.round(['move', 'curve'].includes(command.type) ? Math.max(250, command.distance / 35 * 1000) : command.type === 'turn' ? Math.max(200, Math.abs(command.angle) / 150 * 1000) : 700);
    const entry = { ...command, start: elapsed, end: elapsed + duration };
    elapsed = entry.end; return entry;
  });
}

export function trajectoryPose(plan, timeline, elapsed = 0) {
  const start = plan.points[0] || { x: 0, y: 0 };
  let pose = { x: start.x, y: start.y, heading: plan.settings.heading, action: 'none', point: 0, commandIndex: -1 };
  for (const [index, command] of timeline.entries()) {
    if (elapsed < command.start) break;
    const fraction = Math.min(1, Math.max(0, (elapsed - command.start) / (command.end - command.start)));
    pose = { ...pose, point: command.point, commandIndex: index, heading: command.heading, x: command.x, y: command.y };
    if (command.type === 'move') { pose.x = command.fromX + (command.x - command.fromX) * fraction; pose.y = command.fromY + (command.y - command.fromY) * fraction; }
    if (command.type === 'curve') {
      const from = { x: command.fromX, y: command.fromY }; const to = { ...command };
      Object.assign(pose, curvePosition(from, to, fraction));
      pose.heading = command.fromHeading + normalizeHeading(curveHeading(from, to, fraction) - command.fromHeading);
    }
    if (command.type === 'turn') pose.heading = command.fromHeading + command.angle * fraction;
    if (command.type === 'gripper') pose.action = command.action;
    if (fraction < 1) break;
  }
  return pose;
}

export function trajectoryOutside(plan, pose) {
  return trajectoryFootprints(plan, pose).some((part) => rectangleCorners(part).some((point) => point.x < 0 || point.y < 0 || point.x > plan.settings.width || point.y > plan.settings.height));
}

export function trajectoryFootprints(plan, pose) {
  const settings = { ...TRAJECTORY_DEFAULTS, ...plan.settings };
  const result = [{ x: pose.x, y: pose.y, width: settings.robotLength, height: settings.robotWidth, heading: pose.heading, part: 'robot' }];
  if (settings.gripperLength > 0 && settings.gripperWidth > 0) {
    const angle = pose.heading * Math.PI / 180;
    result.push({ x: pose.x + settings.gripperX * Math.cos(angle) - settings.gripperY * Math.sin(angle), y: pose.y + settings.gripperX * Math.sin(angle) + settings.gripperY * Math.cos(angle), width: settings.gripperLength, height: settings.gripperWidth, heading: pose.heading, part: 'gripper' });
  }
  return result;
}
function rectangleCorners(rectangle) {
  const angle = rectangle.heading * Math.PI / 180; const c = Math.cos(angle); const s = Math.sin(angle);
  return [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy]) => ({ x: rectangle.x + sx * rectangle.width / 2 * c - sy * rectangle.height / 2 * s, y: rectangle.y + sx * rectangle.width / 2 * s + sy * rectangle.height / 2 * c }));
}
export function rectanglesOverlap(first, second) {
  const a = rectangleCorners(first); const b = rectangleCorners(second);
  return [...a, ...b].every((point, index) => {
    const next = index < 4 ? a[(index + 1) % 4] : b[(index - 3) % 4];
    const axis = { x: -(next.y - point.y), y: next.x - point.x };
    const ap = a.map((p) => p.x * axis.x + p.y * axis.y); const bp = b.map((p) => p.x * axis.x + p.y * axis.y);
    return Math.max(...ap) >= Math.min(...bp) - 1e-8 && Math.max(...bp) >= Math.min(...ap) - 1e-8;
  });
}
export function trajectoryCollisions(plan, pose) {
  const parts = trajectoryFootprints(plan, pose);
  return (plan.obstacles || []).flatMap((obstacle) => parts.filter((part) => rectanglesOverlap(part, obstacle)).map((part) => ({ id: obstacle.id, name: obstacle.name, type: obstacle.type, part: part.part })));
}
export function analyzeTrajectory(plan) {
  const timeline = trajectoryTimeline(plan); const contacts = new Map(); let outside = false; let samples = 0;
  const inspect = (elapsed) => { const pose = trajectoryPose(plan, timeline, elapsed); outside ||= trajectoryOutside(plan, pose); trajectoryCollisions(plan, pose).forEach((contact) => contacts.set(`${contact.id}:${contact.part}`, contact)); samples++; };
  if (!plan.points.length) return { contacts: [], outside: false, samples: 0 };
  inspect(0);
  for (const command of timeline) {
    const count = command.type === 'turn' ? Math.ceil(Math.abs(command.angle) / 5) : command.type === 'curve' ? Math.max(180, Math.ceil(command.distance / 1)) : Math.ceil((command.distance || 0) / 2);
    for (let index = 1; index <= Math.max(1, count); index++) inspect(command.start + (command.end - command.start) * index / Math.max(1, count));
  }
  return { contacts: [...contacts.values()], outside, samples };
}

export const trajectoryDocument = (plan) => JSON.stringify({ format: 'newgears-trajectory', version: 1, plan: validateTrajectory(plan) }, null, 2);
export function importTrajectory(text) {
  if (typeof text !== 'string' || text.length > 100000) throw new Error('O arquivo de trajeto deve ter até 100 KB.');
  let data; try { data = JSON.parse(text); } catch { throw new Error('Não foi possível ler este arquivo JSON.'); }
  if (data?.format !== 'newgears-trajectory' || data.version !== 1) throw new Error('Selecione um trajeto exportado pela New Gears.');
  return validateTrajectory(data.plan);
}
