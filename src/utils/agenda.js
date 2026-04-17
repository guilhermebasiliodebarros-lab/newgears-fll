export const EVENT_TYPE_VALUES = Object.freeze({
  VISITA: 'Visita',
  ESPECIALISTA: 'Especialista',
  REUNIAO: 'Reuniao',
  TREINO: 'Treino',
  PRAZO: 'Prazo',
  COMPETICAO: 'Competicao',
  OUTRO: 'Outro'
});

export const EVENT_TYPE_OPTIONS = [
  { value: EVENT_TYPE_VALUES.VISITA, label: 'Visita Tecnica' },
  { value: EVENT_TYPE_VALUES.ESPECIALISTA, label: 'Mentoria / Especialista' },
  { value: EVENT_TYPE_VALUES.REUNIAO, label: 'Reuniao Extra' },
  { value: EVENT_TYPE_VALUES.TREINO, label: 'Treino' },
  { value: EVENT_TYPE_VALUES.PRAZO, label: 'Prazo / Entrega' },
  { value: EVENT_TYPE_VALUES.COMPETICAO, label: 'Competicao' },
  { value: EVENT_TYPE_VALUES.OUTRO, label: 'Outro' }
];

export const EVENT_PRIORITY_OPTIONS = [
  { value: 'normal', label: 'Rotina' },
  { value: 'alta', label: 'Alta prioridade' },
  { value: 'critica', label: 'Critica' }
];

export const EVENT_STATUS_OPTIONS = [
  { value: 'planejado', label: 'Planejado' },
  { value: 'confirmado', label: 'Confirmado' },
  { value: 'concluido', label: 'Concluido' }
];

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export const normalizeEventTypeValue = (type) => {
  const raw = (type || '').toString().trim();
  if (!raw) return EVENT_TYPE_VALUES.OUTRO;

  const lowered = raw.toLowerCase();

  if (lowered.includes('especial')) return EVENT_TYPE_VALUES.ESPECIALISTA;
  if (lowered.includes('visita')) return EVENT_TYPE_VALUES.VISITA;
  if (lowered.includes('reuni')) return EVENT_TYPE_VALUES.REUNIAO;
  if (lowered.includes('treino')) return EVENT_TYPE_VALUES.TREINO;
  if (lowered.includes('prazo')) return EVENT_TYPE_VALUES.PRAZO;
  if (lowered.includes('competi')) return EVENT_TYPE_VALUES.COMPETICAO;
  if (lowered.includes('outro')) return EVENT_TYPE_VALUES.OUTRO;

  return raw;
};

export const parseAgendaDate = (dateString) => {
  if (!dateString) return null;
  const [year, month, day] = dateString.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

export const getEventDateTime = (event) => {
  const eventDate = parseAgendaDate(event?.date);
  if (!eventDate) return new Date(0);

  const safeTime = event?.time || '23:59';
  const [hours, minutes] = safeTime.split(':').map(Number);
  eventDate.setHours(Number.isFinite(hours) ? hours : 23, Number.isFinite(minutes) ? minutes : 59, 0, 0);
  return eventDate;
};

export const compareEventsByDate = (left, right) => getEventDateTime(left) - getEventDateTime(right);

export const formatAgendaDate = (dateString, options = {}) => {
  const parsed = parseAgendaDate(dateString);
  if (!parsed) return 'Data nao definida';
  return parsed.toLocaleDateString('pt-BR', options);
};

export const getAgendaDayOffset = (dateString, referenceStart) => {
  const parsed = parseAgendaDate(dateString);
  if (!parsed) return Number.POSITIVE_INFINITY;
  return Math.round((parsed - referenceStart) / DAY_IN_MS);
};

export const getAgendaRelativeLabel = (dateString, referenceStart) => {
  const dayOffset = getAgendaDayOffset(dateString, referenceStart);

  if (dayOffset === 0) return 'Hoje';
  if (dayOffset === 1) return 'Amanha';
  if (dayOffset === -1) return 'Ontem';
  if (dayOffset > 1) return `Em ${dayOffset} dias`;
  return `${Math.abs(dayOffset)} dias atras`;
};

export const getEventPriorityValue = (event) => event?.priority || 'normal';

export const getEventStatusValue = (event, todayStr = '') =>
  event?.status || (event?.date && todayStr && event.date < todayStr ? 'concluido' : 'confirmado');

export const getEventTypeMeta = (type) => {
  const normalizedType = normalizeEventTypeValue(type);

  if (normalizedType === EVENT_TYPE_VALUES.ESPECIALISTA) {
    return {
      label: 'Especialista',
      tone: 'border-purple-500/20 bg-purple-500/10 text-purple-200',
      accent: 'from-purple-500/25 via-fuchsia-500/10 to-transparent'
    };
  }

  if (normalizedType === EVENT_TYPE_VALUES.VISITA) {
    return {
      label: 'Visita Tecnica',
      tone: 'border-blue-500/20 bg-blue-500/10 text-blue-200',
      accent: 'from-blue-500/25 via-cyan-500/10 to-transparent'
    };
  }

  if (normalizedType === EVENT_TYPE_VALUES.REUNIAO) {
    return {
      label: 'Reuniao',
      tone: 'border-yellow-500/20 bg-yellow-500/10 text-yellow-100',
      accent: 'from-yellow-500/25 via-amber-500/10 to-transparent'
    };
  }

  if (normalizedType === EVENT_TYPE_VALUES.TREINO) {
    return {
      label: 'Treino',
      tone: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200',
      accent: 'from-emerald-500/25 via-green-500/10 to-transparent'
    };
  }

  if (normalizedType === EVENT_TYPE_VALUES.PRAZO) {
    return {
      label: 'Prazo',
      tone: 'border-orange-500/20 bg-orange-500/10 text-orange-100',
      accent: 'from-orange-500/25 via-red-500/10 to-transparent'
    };
  }

  if (normalizedType === EVENT_TYPE_VALUES.COMPETICAO) {
    return {
      label: 'Competicao',
      tone: 'border-red-500/20 bg-red-500/10 text-red-100',
      accent: 'from-red-500/25 via-pink-500/10 to-transparent'
    };
  }

  return {
    label: normalizedType || EVENT_TYPE_VALUES.OUTRO,
    tone: 'border-white/10 bg-white/5 text-gray-200',
    accent: 'from-white/15 via-white/5 to-transparent'
  };
};

export const getEventPriorityMeta = (priority) => {
  if (priority === 'critica') {
    return { label: 'Critica', tone: 'border-red-500/20 bg-red-500/10 text-red-100' };
  }

  if (priority === 'alta') {
    return { label: 'Alta prioridade', tone: 'border-orange-500/20 bg-orange-500/10 text-orange-100' };
  }

  return { label: 'Rotina', tone: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200' };
};

export const getEventStatusMeta = (status) => {
  if (status === 'planejado') {
    return { label: 'Planejado', tone: 'border-white/10 bg-white/5 text-gray-200' };
  }

  if (status === 'concluido') {
    return { label: 'Concluido', tone: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200' };
  }

  return { label: 'Confirmado', tone: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-200' };
};

export const matchesAgendaScope = (event, scope, referenceStart) => {
  const dayOffset = getAgendaDayOffset(event.date, referenceStart);

  if (scope === 'urgent') return dayOffset >= 0 && dayOffset <= 1;
  if (scope === 'week') return dayOffset >= 0 && dayOffset <= 7;
  if (scope === 'upcoming') return dayOffset >= 0;
  if (scope === 'past') return dayOffset < 0;
  return true;
};
