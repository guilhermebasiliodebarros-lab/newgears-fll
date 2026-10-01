export const DEFAULT_FINAL_SPRINT_WEIGHTS = {
  weekly: 40,
  presentation: 35,
  history: 10,
  vinicius: 10,
  xp: 5,
};

export const WEEKLY_EVALUATION_CRITERIA = [
  { id: 'commitment', label: 'Comprometimento' },
  { id: 'teamwork', label: 'Trabalho em equipe' },
  { id: 'initiative', label: 'Iniciativa' },
  { id: 'integration', label: 'Integração dos colegas' },
  { id: 'fllValues', label: 'Valores FLL' },
];

export const PRESENTATION_EVALUATION_CRITERIA = [
  { id: 'projectKnowledge', label: 'Domínio do projeto' },
  { id: 'communication', label: 'Comunicação e fala' },
  { id: 'questions', label: 'Respostas às perguntas' },
  { id: 'posture', label: 'Postura' },
  { id: 'teamwork', label: 'Trabalho em equipe' },
  { id: 'inclusion', label: 'Inclusão e participação' },
  { id: 'fllValues', label: 'Valores FLL' },
];

const formatDate = (date) => new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(date);
const dateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export const getFinalSprintEvaluationWeek = (offset = 0, referenceDate = new Date()) => {
  const monday = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate(), 12);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7) + (offset * 7));
  const friday = new Date(monday);
  friday.setDate(friday.getDate() + 4);
  return {
    id: dateKey(monday),
    startDate: dateKey(monday),
    endDate: dateKey(friday),
    label: `Semana de ${formatDate(monday)} a ${formatDate(friday)}`,
    isCurrent: offset === 0,
    isFriday: offset === 0 && referenceDate.getDay() === 5,
  };
};
