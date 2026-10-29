export const TRAJECTORY_MAX_POINTS = 80;
export const TRAJECTORY_ACTIONS = { none: 'Sem ação', open: 'Abrir garra', close: 'Fechar garra', raise: 'Levantar garra', lower: 'Baixar garra' };
export const TRAJECTORY_DEFAULTS = { width: 240, height: 120, robotWidth: 16, robotLength: 20, heading: 0, map: 'bioglow' };
export const newTrajectory = () => ({ title: '', roundId: '', notes: '', settings: { ...TRAJECTORY_DEFAULTS }, points: [] });
export const trajectoryNumber = (value) => Math.round(value * 10) / 10;
export const normalizeHeading = (angle) => ((angle + 180) % 360 + 360) % 360 - 180;

export function validateTrajectory(input, { allowEmpty = false } = {}) {
  if (!input || typeof input !== 'object') throw new Error('Plano de trajeto inválido.');
  const { settings, points } = input;
  const title = typeof input.title === 'string' ? input.title.trim() : '';
  if ((!allowEmpty && title.length < 3) || title.length > 100) throw new Error('Dê um nome de 3 a 100 caracteres ao trajeto.');
  if (typeof input.notes !== 'string' || input.notes.length > 2000 || typeof input.roundId !== 'string' || !/^[a-zA-Z0-9_-]{0,160}$/.test(input.roundId)) throw new Error('Confira a saída vinculada e limite as observações a 2.000 caracteres.');
  if (!settings || !['grid', 'bioglow'].includes(settings.map)
    || !['width', 'height'].every((key) => Number.isFinite(settings[key]) && settings[key] >= 50 && settings[key] <= 500)
    || !['robotWidth', 'robotLength'].every((key) => Number.isFinite(settings[key]) && settings[key] >= 5 && settings[key] <= 50)
    || !Number.isFinite(settings.heading) || settings.heading < -180 || settings.heading > 180) throw new Error('Confira as medidas do campo, do robô e a orientação inicial.');
  if (!Array.isArray(points) || points.length > TRAJECTORY_MAX_POINTS || (!allowEmpty && points.length < 2)) throw new Error('Marque de 2 a 80 pontos para formar o trajeto.');
  const ids = new Set();
  const cleanPoints = points.map((point) => {
    if (!point || typeof point.id !== 'string' || !/^[a-zA-Z0-9_-]{1,80}$/.test(point.id) || ids.has(point.id)
      || !Number.isFinite(point.x) || point.x < 0 || point.x > settings.width || !Number.isFinite(point.y) || point.y < 0 || point.y > settings.height
      || !Object.hasOwn(TRAJECTORY_ACTIONS, point.action) || typeof point.note !== 'string' || point.note.length > 200) throw new Error('Confira os pontos: use posições dentro do campo e notas de até 200 caracteres.');
    ids.add(point.id);
    return { id: point.id, x: point.x, y: point.y, action: point.action, note: point.note };
  });
  return { title, roundId: input.roundId, notes: input.notes, settings: Object.fromEntries(Object.keys(TRAJECTORY_DEFAULTS).map((key) => [key, settings[key]])), points: cleanPoints };
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
    const distance = Math.hypot(to.x - from.x, to.y - from.y);
    if (distance > 0.001) {
      const nextHeading = Math.atan2(to.y - from.y, to.x - from.x) * 180 / Math.PI;
      const angle = normalizeHeading(nextHeading - heading);
      if (Math.abs(angle) > 0.05) commands.push({ type: 'turn', angle, fromHeading: heading, heading: heading + angle, x: from.x, y: from.y, point: index, label: `Virar ${trajectoryNumber(Math.abs(angle))}° à ${angle > 0 ? 'esquerda' : 'direita'}` });
      heading += angle;
      commands.push({ type: 'move', distance, fromX: from.x, fromY: from.y, x: to.x, y: to.y, heading, point: index, label: `Avançar ${trajectoryNumber(distance)} cm até o ponto ${index + 1}` });
    }
    action(to, index);
  }
  return commands;
}

export function trajectoryTimeline(plan) {
  let elapsed = 0;
  return trajectoryCommands(plan).map((command) => {
    const duration = Math.round(command.type === 'move' ? Math.max(250, command.distance / 35 * 1000) : command.type === 'turn' ? Math.max(200, Math.abs(command.angle) / 150 * 1000) : 700);
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
    if (command.type === 'turn') pose.heading = command.fromHeading + command.angle * fraction;
    if (command.type === 'gripper') pose.action = command.action;
    if (fraction < 1) break;
  }
  return pose;
}

export function trajectoryOutside(plan, pose) {
  const radians = pose.heading * Math.PI / 180;
  const halfX = Math.abs(Math.cos(radians)) * plan.settings.robotLength / 2 + Math.abs(Math.sin(radians)) * plan.settings.robotWidth / 2;
  const halfY = Math.abs(Math.sin(radians)) * plan.settings.robotLength / 2 + Math.abs(Math.cos(radians)) * plan.settings.robotWidth / 2;
  return pose.x - halfX < 0 || pose.y - halfY < 0 || pose.x + halfX > plan.settings.width || pose.y + halfY > plan.settings.height;
}

export const trajectoryDocument = (plan) => JSON.stringify({ format: 'newgears-trajectory', version: 1, plan: validateTrajectory(plan) }, null, 2);
export function importTrajectory(text) {
  if (typeof text !== 'string' || text.length > 100000) throw new Error('O arquivo de trajeto deve ter até 100 KB.');
  let data; try { data = JSON.parse(text); } catch { throw new Error('Não foi possível ler este arquivo JSON.'); }
  if (data?.format !== 'newgears-trajectory' || data.version !== 1) throw new Error('Selecione um trajeto exportado pela New Gears.');
  return validateTrajectory(data.plan);
}
