import { resolveGearEquipment } from './gearShop.js';

export const GIRO_EXPRESSIONS = [
  { id: 'auto', label: 'Automática', description: 'O Giro muda de expressão conforme a interação.' },
  { id: 'happy', label: 'Feliz', description: 'Olhos sorridentes e muita alegria.' },
  { id: 'curious', label: 'Curioso', description: 'Um olhar atento à próxima descoberta.' },
  { id: 'focused', label: 'Concentrado', description: 'Foco total na próxima invenção.' },
  { id: 'surprised', label: 'Surpreso', description: 'Uma nova ideia acabou de aparecer!' },
];
export const WORKSHOP_OBJECTS = {
  bench: { label: 'Bancada', x: 188, y: 315, minX: 120, maxX: 680, minY: 250, maxY: 360 },
  decor: { label: 'Decoração', x: 637, y: 255, minX: 100, maxX: 700, minY: 190, maxY: 320 },
  giro: { label: 'Giro', x: 400, y: 320, minX: 135, maxX: 665, minY: 275, maxY: 350 },
  light: { label: 'Luminária', x: 400, y: 59, minX: 230, maxX: 570, minY: 34, maxY: 85 },
};
export const WORKSHOP_REACTIONS = [
  { id: 'creative', label: 'Oficina criativa!', icon: 'sparkles' },
  { id: 'style', label: 'Gostei da combinação!', icon: 'palette' },
  { id: 'inspiring', label: 'Me inspirou!', icon: 'heart' },
];
export const clampWorkshopPoint = (id, point) => {
  const bounds = WORKSHOP_OBJECTS[id];
  if (!bounds) throw new Error('Objeto da oficina inválido.');
  const coordinate = (value, fallback, min, max) => Math.round(Math.max(min, Math.min(max, Number.isFinite(value) ? value : fallback)));
  return { x: coordinate(point?.x, bounds.x, bounds.minX, bounds.maxX), y: coordinate(point?.y, bounds.y, bounds.minY, bounds.maxY) };
};
export const resolveGearWorkshop = (value) => ({
  layout: Object.fromEntries(Object.keys(WORKSHOP_OBJECTS).map((id) => [id, clampWorkshopPoint(id, value?.layout?.[id])])),
  expression: GIRO_EXPRESSIONS.some((item) => item.id === value?.expression) ? value.expression : 'auto',
  updatedAt: typeof value?.updatedAt === 'string' ? value.updatedAt : '',
});
export const validWorkshopLayout = (layout) => Boolean(layout && Object.keys(layout).length === Object.keys(WORKSHOP_OBJECTS).length
  && Object.entries(WORKSHOP_OBJECTS).every(([id, bounds]) => {
    const point = layout[id];
    return point && Object.keys(point).length === 2 && Number.isInteger(point.x) && Number.isInteger(point.y)
      && point.x >= bounds.minX && point.x <= bounds.maxX && point.y >= bounds.minY && point.y <= bounds.maxY;
  }));
export const giroExpression = (mood, preference = 'auto') => {
  if (GIRO_EXPRESSIONS.some((entry) => entry.id === preference) && preference !== 'auto') return preference;
  if (mood === 'thinking') return 'thinking';
  if (mood === 'excited') return 'excited';
  if (['work', 'pending'].includes(mood)) return 'focused';
  if (['surprised', 'discover'].includes(mood)) return 'surprised';
  if (['celebrate', 'dance', 'stage', 'hop', 'salute', 'greet'].includes(mood)) return 'happy';
  return mood === 'idle' ? 'neutral' : 'curious';
};
// Only these fields are supplied to the workshop gallery; wallets and school data stay outside it.
export const workshopMember = (student) => ({ id: String(student.id), name: String(student.name || 'Integrante'), avatarImage: typeof student.avatarImage === 'string' ? student.avatarImage : null, gearAppearance: resolveGearEquipment(student.gearAppearance), gearWorkshop: resolveGearWorkshop(student.gearWorkshop) });
