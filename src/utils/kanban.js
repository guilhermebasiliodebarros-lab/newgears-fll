export const resolveTaskTagFromStation = (station) => {
  if (!station) return 'geral';

  const normalizedStation = String(station)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  if (normalizedStation.includes('engenh')) return 'engenharia';
  if (normalizedStation.includes('inov')) return 'inovacao';
  if (normalizedStation.includes('gest')) return 'gestao';

  return 'geral';
};

export const buildInitialKanbanTaskDraft = (station, dueDate = '') => ({
  text: '',
  dueDate,
  tag: resolveTaskTagFromStation(station),
  priority: 'normal'
});
