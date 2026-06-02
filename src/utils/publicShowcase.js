export const PUBLIC_BADGE_LABELS = Object.freeze({
  pitstop: 'Pit Stop F1',
  engineer: 'Engenheiro Minimalista',
  ice_blood: 'Sangue Frio',
  repetition: 'Rei da Repeticao',
  helper: 'Braco Direito',
  data_keeper: 'Guardiao dos Dados',
  legend: 'Lenda do XP',
  ambassador: 'Embaixador',
  mission_captain: 'Capitao das Missoes',
  robot_driver: 'Piloto do Robo',
  code_debugger: 'Cacador de Bugs',
  innovation_scout: 'Explorador de Inovacao',
  core_values: 'Valores FLL',
  pit_presenter: 'Voz dos Juizes',
  logbook_keeper: 'Guardiao do Diario',
  strategy_builder: 'Arquiteto da Estrategia',
});

const cleanText = (value) => `${value || ''}`.trim();

const toTimestamp = (value) => {
  const timestamp = new Date(value || 0).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

export const buildTrainingGallery = ({ robotVersions = [], attachments = [] } = {}) => [
  ...robotVersions
    .filter((item) => item?.image)
    .map((item) => ({
      id: `robot-${item.id}`,
      image: item.image,
      title: cleanText(item.name) || cleanText(item.version) || 'Evolucao do robo',
      detail: cleanText(item.version) || 'Versao registrada',
      date: item.date || '',
      type: 'Versao do robo',
    })),
  ...attachments
    .filter((item) => item?.image)
    .map((item) => ({
      id: `attachment-${item.id}`,
      image: item.image,
      title: cleanText(item.name) || 'Anexo em teste',
      detail: cleanText(item.changes) || 'Teste de anexo registrado',
      date: item.date || '',
      type: 'Treino de anexo',
    })),
].sort((left, right) => toTimestamp(right.date) - toTimestamp(left.date));

export const buildPublicAchievements = ({
  students = [],
  teamSeasonStats = {},
  trainingPhotos = [],
  totalImpactPeople = 0,
} = {}) => {
  const individualAchievements = students.flatMap((student) => {
    const activeBadges = new Set(Array.isArray(student?.badges) ? student.badges : []);
    const datedAchievements = Array.isArray(student?.badgeAchievements) ? student.badgeAchievements : [];
    const datedBadgeIds = new Set(datedAchievements.map((item) => item?.badgeId).filter(Boolean));

    const dated = datedAchievements
      .filter((item) => item?.badgeId && activeBadges.has(item.badgeId))
      .map((item) => ({
        id: `${student.id}-${item.badgeId}-${item.awardedAt || 'dated'}`,
        title: PUBLIC_BADGE_LABELS[item.badgeId] || item.badgeName || 'Conquista FLL',
        detail: `${student.name} conquistou uma nova badge.`,
        date: item.awardedAt || '',
        type: 'Badge individual',
      }));

    const legacy = [...activeBadges]
      .filter((badgeId) => !datedBadgeIds.has(badgeId))
      .map((badgeId) => ({
        id: `${student.id}-${badgeId}-legacy`,
        title: PUBLIC_BADGE_LABELS[badgeId] || 'Conquista FLL',
        detail: `${student.name} conquistou uma badge na temporada.`,
        date: '',
        type: 'Badge individual',
      }));

    return [...dated, ...legacy];
  });

  const successfulWeeks = Math.max(
    Number(teamSeasonStats.successfulWeeks) || 0,
    Array.isArray(teamSeasonStats.successfulWeekIds) ? teamSeasonStats.successfulWeekIds.length : 0,
  );
  const collectiveAchievements = [
    successfulWeeks > 0 && {
      id: 'successful-weeks',
      title: `${successfulWeeks} semana${successfulWeeks === 1 ? '' : 's'} fechada${successfulWeeks === 1 ? '' : 's'}`,
      detail: 'A equipe concluiu ciclos de trabalho com entregas validadas.',
      date: teamSeasonStats.updatedAt || '',
      type: 'Marco coletivo',
    },
    totalImpactPeople > 0 && {
      id: 'community-impact',
      title: `${totalImpactPeople} pessoas alcancadas`,
      detail: 'O projeto ja saiu da bancada e chegou ate a comunidade.',
      date: '',
      type: 'Impacto',
    },
    trainingPhotos.length > 0 && {
      id: 'training-gallery',
      title: `${trainingPhotos.length} registro${trainingPhotos.length === 1 ? '' : 's'} de treino`,
      detail: 'A evolucao do robo esta sendo documentada com evidencias.',
      date: trainingPhotos[0]?.date || '',
      type: 'Engenharia',
    },
  ].filter(Boolean);

  return [...individualAchievements, ...collectiveAchievements]
    .sort((left, right) => toTimestamp(right.date) - toTimestamp(left.date))
    .slice(0, 6);
};

export const getTournamentCountdown = (targetDate, now = new Date()) => {
  const difference = new Date(targetDate).getTime() - new Date(now).getTime();
  if (!Number.isFinite(difference) || difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, arrived: true };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    arrived: false,
  };
};
