import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertCircle,
  AlertTriangle,
  BookOpen,
  CheckCircle,
  ClipboardList,
  Crown,
  LayoutDashboard,
  Microscope,
  Pencil,
  Rocket,
  Search,
  Sparkles,
  Trash2,
  UserCircle,
  UserPlus,
  Users,
  X,
  XCircle,
} from 'lucide-react';

const STATION_CONFIGS = [
  {
    key: 'Engenharia',
    label: 'Engenharia',
    Icon: Rocket,
    tone: 'border-blue-500/20 bg-blue-500/5',
    badgeTone: 'border-blue-500/20 bg-blue-500/10 text-blue-200',
    highlightTone: 'border-blue-500/20 bg-blue-500/10',
    actionTone: 'border-blue-500/20 bg-blue-500/10 text-blue-100 hover:bg-blue-500 hover:text-white',
    dot: 'bg-blue-400',
  },
  {
    key: 'Inovação',
    label: 'Inovacao',
    Icon: Microscope,
    tone: 'border-pink-500/20 bg-pink-500/5',
    badgeTone: 'border-pink-500/20 bg-pink-500/10 text-pink-200',
    highlightTone: 'border-pink-500/20 bg-pink-500/10',
    actionTone: 'border-pink-500/20 bg-pink-500/10 text-pink-100 hover:bg-pink-500 hover:text-white',
    dot: 'bg-pink-400',
  },
  {
    key: 'Gestão',
    label: 'Gestao',
    Icon: BookOpen,
    tone: 'border-purple-500/20 bg-purple-500/5',
    badgeTone: 'border-purple-500/20 bg-purple-500/10 text-purple-200',
    highlightTone: 'border-purple-500/20 bg-purple-500/10',
    actionTone: 'border-purple-500/20 bg-purple-500/10 text-purple-100 hover:bg-purple-500 hover:text-white',
    dot: 'bg-purple-400',
  },
];

const SPECIALTY_PRESETS = [
  {
    value: 'Engenharia',
    label: 'Engenharia',
    short: 'ENG',
    Icon: Rocket,
    tone: 'border-blue-500/20 bg-blue-500/10 text-blue-100 hover:bg-blue-500 hover:text-white',
  },
  {
    value: 'Inovacao',
    label: 'Inovacao',
    short: 'INO',
    Icon: Microscope,
    tone: 'border-pink-500/20 bg-pink-500/10 text-pink-100 hover:bg-pink-500 hover:text-white',
  },
  {
    value: 'Gestao',
    label: 'Gestao',
    short: 'GES',
    Icon: Crown,
    tone: 'border-purple-500/20 bg-purple-500/10 text-purple-100 hover:bg-purple-500 hover:text-white',
  },
  {
    value: 'Multidisciplinar',
    label: 'Multidisciplinar',
    short: 'MULTI',
    Icon: Sparkles,
    tone: 'border-amber-500/20 bg-amber-500/10 text-amber-100 hover:bg-amber-400 hover:text-black',
  },
];

const SPECIALTY_GROUP_CONFIGS = [
  {
    id: 'engenharia',
    label: 'Engenharia',
    short: 'ENG',
    Icon: Rocket,
    tone: 'border-blue-500/20 bg-blue-500/10 text-blue-100',
    headerTone: 'border-blue-500/20 bg-blue-500/10',
    matches: ['engenharia', 'robotica', 'programacao', 'codigo', 'mecanica', 'mesa', 'testes'],
  },
  {
    id: 'inovacao',
    label: 'Inovacao',
    short: 'INO',
    Icon: Microscope,
    tone: 'border-pink-500/20 bg-pink-500/10 text-pink-100',
    headerTone: 'border-pink-500/20 bg-pink-500/10',
    matches: ['inovacao', 'pesquisa', 'narrativa', 'projeto', 'apresentacao', 'defesa', 'pitch'],
  },
  {
    id: 'gestao',
    label: 'Gestao',
    short: 'GES',
    Icon: Crown,
    tone: 'border-purple-500/20 bg-purple-500/10 text-purple-100',
    headerTone: 'border-purple-500/20 bg-purple-500/10',
    matches: ['gestao', 'lideranca', 'organizacao', 'estrategia', 'comunicacao', 'ritmo'],
  },
  {
    id: 'multidisciplinar',
    label: 'Multidisciplinar',
    short: 'MULTI',
    Icon: Sparkles,
    tone: 'border-amber-500/20 bg-amber-500/10 text-amber-100',
    headerTone: 'border-amber-500/20 bg-amber-500/10',
    matches: ['multidisciplinar', 'multifuncional', 'geral', 'tudo', 'all-rounder'],
  },
  {
    id: 'undefined',
    label: 'Sem frente definida',
    short: 'SEM',
    Icon: UserCircle,
    tone: 'border-white/10 bg-white/5 text-gray-200',
    headerTone: 'border-white/10 bg-white/5',
    matches: [],
  },
];

const normalizeValue = (value) =>
  `${value || ''}`
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

const SCHOOL_REPORT_STAGES = [
  { id: 'etapa1', label: '1ª etapa', shortLabel: '1ª Etapa' },
  { id: 'etapa2', label: '2ª etapa', shortLabel: '2ª Etapa' },
];

const getSchoolStageRecord = (student, stageId) => {
  const schoolGrades = student?.schoolGrades;

  if (!schoolGrades || typeof schoolGrades !== 'object') return null;

  if (schoolGrades.etapa1 || schoolGrades.etapa2) {
    return schoolGrades[stageId] || null;
  }

  if (stageId === 'etapa1') {
    return {
      grades: schoolGrades,
      migratedFromLegacy: true,
    };
  }

  return null;
};

const hasSchoolStageGrades = (student, stageId) => {
  const stageRecord = getSchoolStageRecord(student, stageId);
  return Boolean(stageRecord?.grades && Object.keys(stageRecord.grades).length > 0);
};

const resolveSpecialtyGroupId = (specialty) => {
  const normalized = normalizeValue(specialty);
  if (!normalized) return 'undefined';

  if (SPECIALTY_GROUP_CONFIGS.find((group) => group.id === 'multidisciplinar')?.matches.some((term) => normalized.includes(term))) {
    return 'multidisciplinar';
  }

  const matchedGroups = SPECIALTY_GROUP_CONFIGS
    .filter((group) => group.id !== 'multidisciplinar' && group.id !== 'undefined')
    .filter((group) => group.matches.some((term) => normalized.includes(term)))
    .map((group) => group.id);

  const uniqueMatches = Array.from(new Set(matchedGroups));
  if (uniqueMatches.length > 1) return 'multidisciplinar';
  if (uniqueMatches.length === 1) return uniqueMatches[0];

  return 'undefined';
};

const getSpecialtyGroupConfig = (specialty) =>
  SPECIALTY_GROUP_CONFIGS.find((group) => group.id === resolveSpecialtyGroupId(specialty))
  || SPECIALTY_GROUP_CONFIGS[SPECIALTY_GROUP_CONFIGS.length - 1];

const getSubmissionMeta = (student) => {
  if (student.submission?.status === 'approved') {
    return {
      badgeClass: 'border-green-500/30 bg-green-500/15 text-green-200',
      cardClass: 'border-green-500/30 bg-green-500/8 shadow-[0_0_0_1px_rgba(34,197,94,0.05)]',
      label: 'Aprovado',
      icon: <CheckCircle size={12} className="text-green-400" />,
    };
  }

  if (student.submission?.status === 'rejected') {
    return {
      badgeClass: 'border-red-500/30 bg-red-500/15 text-red-200',
      cardClass: 'border-red-500/30 bg-red-500/8 shadow-[0_0_0_1px_rgba(239,68,68,0.05)]',
      label: 'Recusado',
      icon: <AlertTriangle size={12} className="text-red-400" />,
    };
  }

  if (student.submission?.status === 'pending') {
    return {
      badgeClass: 'border-yellow-500/30 bg-yellow-500/15 text-yellow-100',
      cardClass: 'border-yellow-500/20 bg-yellow-500/5 shadow-[0_0_0_1px_rgba(234,179,8,0.04)]',
      label: 'Avaliar',
      icon: <AlertCircle size={12} className="text-yellow-400" />,
    };
  }

  return {
    badgeClass: 'border-white/10 bg-white/5 text-gray-300',
    cardClass: 'border-white/10 bg-black/25',
    label: 'Sem entrega',
    icon: <ClipboardList size={12} className="text-gray-400" />,
  };
};

const SummaryMetricCard = ({ label, value, helper, tone = 'border-white/10 bg-black/25' }) => (
  <div className={`rounded-[24px] border p-4 backdrop-blur-sm ${tone}`}>
    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">{label}</p>
    <p className="text-3xl font-black text-white mt-3 leading-none">{value}</p>
    {helper && <p className="text-xs text-gray-300/85 mt-2 leading-relaxed">{helper}</p>}
  </div>
);

const SpecialtyHeaderBadge = ({ specialty }) => {
  const specialtyGroup = getSpecialtyGroupConfig(specialty);
  const SpecialtyGroupIcon = specialtyGroup.Icon;
  const badgeLabel = specialtyGroup.id === 'undefined' ? 'Sem frente' : specialtyGroup.label;

  return (
    <span
      title={specialty || badgeLabel}
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[9px] font-black uppercase tracking-[0.16em] ${specialtyGroup.tone}`}
    >
      <SpecialtyGroupIcon size={10} />
      {badgeLabel}
    </span>
  );
};

const StudentAvatar = ({ student }) => (
  student.avatarImage ? (
    <img src={student.avatarImage} alt={student.name} className="h-11 w-11 rounded-2xl object-cover border border-white/10" />
  ) : (
    <div className="h-11 w-11 rounded-2xl border border-white/10 bg-black/30 flex items-center justify-center">
      <UserCircle size={22} className="text-gray-500" />
    </div>
  )
);

const SpecialtyQuickPanel = ({
  student,
  canManage,
  onUpdateStudentSpecialty,
  onOpenNewStudentModal,
  compact = false,
}) => {
  const normalizedSpecialty = normalizeValue(student.specialty);
  const specialtyGroup = getSpecialtyGroupConfig(student.specialty);
  const SpecialtyGroupIcon = specialtyGroup.Icon;

  return (
    <div className={`rounded-[20px] border border-white/10 bg-black/25 ${compact ? 'p-3' : 'p-3.5'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500 font-bold">Especialidade fixa</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[9px] font-black uppercase tracking-[0.16em] ${specialtyGroup.tone}`}>
              <SpecialtyGroupIcon size={11} />
              {specialtyGroup.short}
            </span>
            <p className={`font-bold leading-relaxed text-white ${compact ? 'text-xs' : 'text-sm'}`}>
              {student.specialty || 'Sem especialidade definida'}
            </p>
          </div>
          {!student.specialty && (
            <p className="mt-1 text-[11px] text-gray-500">Escolha um preset rapido ou personalize.</p>
          )}
        </div>

        <button
          type="button"
          onClick={() => onOpenNewStudentModal(student)}
          className="rounded-2xl border border-white/10 bg-white/5 p-2 text-gray-400 transition-all hover:bg-white/10 hover:text-white"
          title="Editar especialidade personalizada"
        >
          <Pencil size={13} />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-1.5">
        {SPECIALTY_PRESETS.map((preset) => {
          const isActive = normalizedSpecialty === normalizeValue(preset.value);
          const PresetIcon = preset.Icon;

          return (
            <button
              key={preset.value}
              type="button"
              onClick={() => onUpdateStudentSpecialty(student, preset.value)}
              disabled={!canManage}
              title={preset.label}
              className={`rounded-[14px] border px-1.5 py-2 text-center transition-all ${
                isActive
                  ? preset.tone
                  : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
              } ${canManage ? 'hover:-translate-y-0.5' : 'cursor-not-allowed opacity-50'}`}
            >
              <span className="flex flex-col items-center justify-center gap-1 text-[9px] font-black uppercase tracking-[0.14em]">
                <PresetIcon size={12} />
                {preset.short}
              </span>
            </button>
          );
        })}
      </div>

      {student.specialty && (
        <button
          type="button"
          onClick={() => onUpdateStudentSpecialty(student, '')}
          disabled={!canManage}
          className={`mt-2.5 w-full rounded-[14px] border px-3 py-2 text-[9px] font-black uppercase tracking-[0.18em] transition-all ${
            canManage
              ? 'border-white/10 bg-white/5 text-gray-300 hover:-translate-y-0.5 hover:bg-white/10 hover:text-white'
              : 'cursor-not-allowed opacity-50 border-white/10 bg-white/5 text-gray-500'
          }`}
        >
          Limpar especialidade
        </button>
      )}
    </div>
  );
};

const BenchStudentManagementDrawer = ({
  student,
  level,
  canManage,
  onClose,
  onOpenXPModal,
  onOpenGradesModal,
  onOpenProfileModal,
  onOpenNewStudentModal,
  onSetBadgeStudent,
  onToggleEnglishChallenge,
  onDeleteStudent,
  onToggleActivityStatus,
  onUpdateStudentSpecialty,
}) => {
  const submissionMeta = getSubmissionMeta(student);
  const currentStationConfig = STATION_CONFIGS.find((item) => item.key === student.station);
  const CurrentStationIcon = currentStationConfig?.Icon || LayoutDashboard;
  const handleCloseAndRun = (callback, ...args) => {
    onClose();
    callback(...(args.length > 0 ? args : [student]));
  };

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const drawerContent = (
    <div className="fixed inset-0 z-[80] animate-in fade-in duration-300">
      <button
        type="button"
        aria-label="Fechar gestao do aluno"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-4 lg:p-6">
        <aside className="relative flex max-h-[92vh] w-full max-w-[1040px] flex-col overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(12,16,28,0.98),rgba(10,12,20,0.98))] shadow-[0_30px_100px_rgba(0,0,0,0.45)] animate-in slide-in-from-bottom-4 duration-300">
          <div className="border-b border-white/10">
            <div className="mx-auto flex w-full max-w-[920px] flex-col gap-4 px-4 py-5 sm:px-5 lg:px-6 xl:px-8 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <StudentAvatar student={student} />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-300 font-bold">Gestao do aluno</p>
                  <p className="mt-2 text-lg font-black text-white line-clamp-2">{student.name}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${submissionMeta.badgeClass}`}>
                      {submissionMeta.icon}
                      {submissionMeta.label}
                    </span>
                    <SpecialtyHeaderBadge specialty={student.specialty} />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="self-end rounded-2xl border border-white/10 bg-white/5 p-2 text-gray-400 transition-all hover:bg-white/10 hover:text-white sm:self-start"
                title="Fechar painel"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="mx-auto flex w-full max-w-[920px] flex-1 flex-col overflow-y-auto px-4 py-5 sm:px-5 lg:px-6 xl:px-8 custom-scrollbar">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,0.96fr),minmax(0,1.04fr)] xl:items-start">
              <div className="space-y-4">
                <div className="rounded-[24px] border border-white/10 bg-black/25 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold text-gray-300">
                      {student.turma || 'Turma nao informada'}
                    </span>
                    <span className={`rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase ${level.color}`}>
                      {level.name}
                    </span>
                    <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-2.5 py-1 text-[10px] font-bold text-yellow-100">
                      {student.xp || 0} XP
                    </span>
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${currentStationConfig ? currentStationConfig.badgeTone : 'border-white/10 bg-white/5 text-gray-300'}`}>
                      <CurrentStationIcon size={12} />
                      {currentStationConfig ? currentStationConfig.label : 'Sem estacao definida'}
                    </span>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-gray-300">
                    Painel rapido para badges, XP, especialidade, notas e acoes de acompanhamento.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => handleCloseAndRun(onOpenNewStudentModal)}
                    className="rounded-[20px] border border-white/10 bg-white/5 px-3 py-3 text-xs font-black uppercase tracking-[0.14em] text-white transition-all hover:-translate-y-0.5 hover:bg-white/10"
                  >
                    Editar aluno
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCloseAndRun(onOpenProfileModal)}
                    className="rounded-[20px] border border-cyan-500/20 bg-cyan-500/10 px-3 py-3 text-xs font-black uppercase tracking-[0.14em] text-cyan-100 transition-all hover:-translate-y-0.5 hover:bg-cyan-500 hover:text-black"
                  >
                    Ver perfil
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => handleCloseAndRun(onOpenXPModal)}
                    disabled={!canManage}
                    className={`rounded-[20px] border border-yellow-500/20 bg-yellow-500/10 px-3 py-3 text-xs font-black uppercase tracking-[0.14em] text-yellow-100 transition-all ${canManage ? 'hover:-translate-y-0.5 hover:bg-yellow-500 hover:text-black' : 'opacity-50 cursor-not-allowed'}`}
                  >
                    Ajustar XP
                  </button>
                  {SCHOOL_REPORT_STAGES.map((stage) => {
                    const alreadyLaunched = hasSchoolStageGrades(student, stage.id);

                    return (
                      <button
                        key={stage.id}
                        type="button"
                        onClick={() => handleCloseAndRun(onOpenGradesModal, student, stage.id)}
                        disabled={!canManage}
                        className={`rounded-[20px] border px-3 py-3 text-left transition-all ${!canManage ? 'opacity-50 cursor-not-allowed border-white/10 bg-white/5 text-white' : alreadyLaunched ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-100 hover:-translate-y-0.5 hover:bg-emerald-500 hover:text-black' : 'border-white/10 bg-white/5 text-white hover:-translate-y-0.5 hover:bg-white/10'}`}
                      >
                        <span className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em]">
                          {alreadyLaunched && <CheckCircle size={13} />}
                          {stage.shortLabel}
                        </span>
                        <span className="mt-1 block text-[10px] font-semibold opacity-80">
                          {alreadyLaunched ? 'Editar notas' : 'Lançar notas'}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="rounded-[24px] border border-white/10 bg-black/25 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCloseAndRun(onSetBadgeStudent)}
                      className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-3 py-2.5 text-[11px] font-black text-yellow-100 transition-all hover:bg-yellow-500 hover:text-black"
                    >
                      Conquista
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleEnglishChallenge(student)}
                      className={`rounded-2xl border px-3 py-2.5 text-[11px] font-black transition-all ${student.englishChallengeUnlocked ? 'border-green-500/20 bg-green-500/10 text-green-100 hover:bg-green-500 hover:text-black' : 'border-blue-500/20 bg-blue-500/10 text-blue-100 hover:bg-blue-500 hover:text-white'}`}
                    >
                      {student.englishChallengeUnlocked ? 'Ingles ativo' : 'Ativar ingles'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <SpecialtyQuickPanel
                  student={student}
                  canManage={canManage}
                  onUpdateStudentSpecialty={onUpdateStudentSpecialty}
                  onOpenNewStudentModal={(targetStudent) => handleCloseAndRun(onOpenNewStudentModal, targetStudent)}
                  compact
                />

                <div className="rounded-[24px] border border-white/10 bg-black/25 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500 font-bold">Status rapido</p>
                    <div className="flex items-center gap-1 rounded-2xl border border-white/10 bg-black/30 p-1">
                      <button type="button" onClick={() => onToggleActivityStatus(student, 'approved')} className={`rounded-xl p-2 transition-all ${student.submission?.status === 'approved' ? 'bg-green-500 text-black' : 'text-gray-400 hover:text-green-300 hover:bg-green-500/10'}`} title="Aprovar atividade">
                        <CheckCircle size={13} />
                      </button>
                      <button type="button" onClick={() => onToggleActivityStatus(student, 'rejected')} className={`rounded-xl p-2 transition-all ${student.submission?.status === 'rejected' ? 'bg-red-500 text-white' : 'text-gray-400 hover:text-red-300 hover:bg-red-500/10'}`} title="Recusar atividade">
                        <XCircle size={13} />
                      </button>
                      {student.submission && (
                        <button type="button" onClick={() => onToggleActivityStatus(student, null)} className="rounded-xl p-2 text-gray-400 transition-all hover:bg-white/10 hover:text-white" title="Limpar status">
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onDeleteStudent(student.id);
                  }}
                  className="w-full rounded-[20px] border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-red-100 transition-all hover:-translate-y-0.5 hover:bg-red-500 hover:text-white"
                >
                  {student.status === 'inactive' ? 'Reativar aluno' : 'Arquivar aluno'}
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;

  return createPortal(drawerContent, document.body);
};

export const StudentManagementPanel = ({
  students,
  getCurrentLevel,
  canManage,
  onMoveStudent,
  onOpenXPModal,
  onOpenGradesModal,
  onOpenProfileModal,
  onOpenNewStudentModal,
  onSetBadgeStudent,
  onToggleEnglishChallenge,
  onDeleteStudent,
  onToggleActivityStatus,
  onUpdateStudentSpecialty,
}) => {
  const [search, setSearch] = useState('');
  const [stationFilter, setStationFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('active');
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const normalizedSearch = normalizeValue(search);

  const countsByStation = useMemo(() => Object.fromEntries(
    STATION_CONFIGS.map((station) => [station.key, students.filter((student) => student.station === station.key).length]),
  ), [students]);
  const unassignedCount = students.filter((student) => !STATION_CONFIGS.some((station) => station.key === student.station)).length;
  const pendingCount = students.filter((student) => student.submission?.status === 'pending').length;

  const filteredStudents = useMemo(() => students
    .filter((student) => {
      const matchesSearch = normalizeValue(`${student.name} ${student.turma || ''} ${student.specialty || ''}`).includes(normalizedSearch);
      const matchesStation = stationFilter === 'all'
        || (stationFilter === 'unassigned'
          ? !STATION_CONFIGS.some((station) => station.key === student.station)
          : student.station === stationFilter);
      const matchesStatus = statusFilter === 'all' || (statusFilter === 'inactive' ? student.status === 'inactive' : student.status !== 'inactive');
      return matchesSearch && matchesStation && matchesStatus;
    })
    .sort((left, right) => left.name.localeCompare(right.name)), [students, normalizedSearch, stationFilter, statusFilter]);

  const selectedStudent = students.find((student) => student.id === selectedStudentId) || null;
  const filters = [
    { key: 'all', label: 'Todos', count: students.length },
    ...STATION_CONFIGS.map((station) => ({ key: station.key, label: station.label, count: countsByStation[station.key] || 0 })),
    { key: 'unassigned', label: 'Sem estacao', count: unassignedCount },
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_32%),linear-gradient(135deg,rgba(13,17,28,0.98),rgba(11,12,20,0.98))] p-5 shadow-[0_25px_70px_rgba(0,0,0,0.28)] md:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200"><Users size={13} /> Cadastro e acompanhamento</p>
            <h2 className="mt-3 text-2xl font-black text-white md:text-3xl">Gerenciar alunos</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-300">Consulte a equipe, atualize a estação e abra as ações de cada aluno sem passar pela tela do rodízio.</p>
          </div>
          <button onClick={() => onOpenNewStudentModal()} className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-gradient-to-r from-emerald-500/20 to-teal-400/10 px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-emerald-100 shadow-[0_12px_28px_rgba(16,185,129,0.08)] transition-all hover:-translate-y-0.5 hover:bg-emerald-500 hover:text-black">
            <UserPlus size={15} /> Novo aluno
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {[
            { label: 'Alunos cadastrados', value: students.length, icon: <Users size={16} />, color: 'text-emerald-200', tone: 'border-emerald-400/15 bg-emerald-400/[0.06]' },
            { label: 'Sem estacao', value: unassignedCount, icon: <UserCircle size={16} />, color: unassignedCount > 0 ? 'text-amber-200' : 'text-gray-300', tone: unassignedCount > 0 ? 'border-amber-400/15 bg-amber-400/[0.06]' : 'border-white/10 bg-white/[0.025]' },
            { label: 'Para avaliar', value: pendingCount, icon: <ClipboardList size={16} />, color: pendingCount > 0 ? 'text-yellow-200' : 'text-gray-300', tone: pendingCount > 0 ? 'border-yellow-400/15 bg-yellow-400/[0.06]' : 'border-white/10 bg-white/[0.025]' },
          ].map((metric) => (
            <div key={metric.label} className={`flex items-center justify-between gap-3 rounded-[20px] border px-4 py-3 ${metric.tone}`}>
              <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-gray-400"><span className={metric.color}>{metric.icon}</span>{metric.label}</span>
              <span className={`text-xl font-black ${metric.color}`}>{metric.value}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[30px] border border-white/10 bg-[linear-gradient(145deg,rgba(17,23,34,0.98),rgba(12,16,25,0.98))] p-3 shadow-[0_20px_55px_rgba(0,0,0,0.22)] md:p-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <label className="flex min-w-0 items-center gap-3 rounded-full border border-white/10 bg-black/25 px-4 py-3 transition focus-within:border-emerald-300/30 xl:max-w-md xl:flex-1">
            <Search size={16} className="shrink-0 text-gray-500" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nome, turma ou especialidade" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500" />
          </label>
          <div className="flex flex-wrap gap-2">
            <select aria-label="Situação dos alunos" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-full border border-white/10 bg-[#151b27] px-3 py-2 text-xs text-white"><option value="active">Ativos</option><option value="inactive">Arquivados</option><option value="all">Todos os cadastros</option></select>
            {filters.map((filter) => (
              <button key={filter.key} type="button" onClick={() => setStationFilter(filter.key)} className={`rounded-full border px-3 py-2 text-[10px] font-black uppercase tracking-[0.1em] transition-colors ${stationFilter === filter.key ? 'border-emerald-400/40 bg-emerald-400/15 text-emerald-100' : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'}`}>
                {filter.label}<span className="ml-2 opacity-70">{filter.count}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-[24px] border border-white/10 bg-black/15">
          <div className="hidden grid-cols-[minmax(0,1.5fr)_minmax(170px,0.8fr)_minmax(180px,0.8fr)_auto] gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-3 text-[9px] font-black uppercase tracking-[0.16em] text-gray-500 lg:grid">
            <span>Aluno</span><span>Estacao atual</span><span>Especialidade</span><span>Acoes</span>
          </div>
          <div className="max-h-[min(66vh,760px)] overflow-y-auto custom-scrollbar">
            {filteredStudents.length > 0 ? filteredStudents.map((student) => {
              const submissionMeta = getSubmissionMeta(student);
              const level = getCurrentLevel(student.xp || 0);

              return (
                <div key={student.id} className="grid gap-3 border-b border-white/[0.06] px-3 py-3 transition-colors hover:bg-white/[0.025] last:border-b-0 lg:grid-cols-[minmax(0,1.5fr)_minmax(170px,0.8fr)_minmax(180px,0.8fr)_auto] lg:items-center lg:px-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <StudentAvatar student={student} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-black text-white">{student.name}{student.status === 'inactive' ? ' · Arquivado' : ''}</p>
                        <span className={`rounded-full border px-2 py-1 text-[9px] font-bold ${submissionMeta.badgeClass}`}>{submissionMeta.label}</span>
                      </div>
                      <p className="mt-1 truncate text-[11px] text-gray-400">{student.turma || 'Turma nao informada'} · {level.name} · {student.xp || 0} XP</p>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.1em] text-gray-500 lg:block">
                    <span className="lg:hidden">Estacao:</span>
                    <select value={student.station || ''} disabled={!canManage || student.status === 'inactive'} onChange={(event) => onMoveStudent(student.id, event.target.value || null)} className="min-w-0 flex-1 rounded-full border border-white/10 bg-[#151b27] px-3.5 py-2.5 text-xs font-bold text-white outline-none transition focus:border-emerald-400/40 disabled:opacity-50 lg:mt-1 lg:w-full">
                      <option value="">Sem estacao</option>
                      {STATION_CONFIGS.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
                    </select>
                  </label>
                  <div className="flex items-center gap-2 text-xs text-gray-300">
                    <SpecialtyHeaderBadge specialty={student.specialty} />
                    <span className="truncate">{student.specialty || 'Sem especialidade definida'}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    <button type="button" onClick={() => setSelectedStudentId(student.id)} className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-cyan-100 transition-all hover:-translate-y-0.5 hover:bg-cyan-300 hover:text-black">Gerenciar</button>
                    <button type="button" onClick={() => onOpenNewStudentModal(student)} disabled={!canManage} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-white transition hover:bg-white/10 disabled:opacity-50">Editar</button>
                  </div>
                </div>
              );
            }) : (
              <div className="p-10 text-center">
                <p className="text-sm font-bold text-white">Nenhum aluno encontrado</p>
                <p className="mt-2 text-xs text-gray-400">Ajuste a busca ou escolha outra estação.</p>
              </div>
            )}
          </div>
          <div className="border-t border-white/10 px-4 py-2 text-[10px] text-gray-500">Mostrando {filteredStudents.length} de {students.length} alunos</div>
        </div>
      </section>

      {selectedStudent && (
        <BenchStudentManagementDrawer
          student={selectedStudent}
          level={getCurrentLevel(selectedStudent.xp || 0)}
          canManage={canManage}
          onClose={() => setSelectedStudentId(null)}
          onOpenXPModal={onOpenXPModal}
          onOpenGradesModal={onOpenGradesModal}
          onOpenProfileModal={onOpenProfileModal}
          onOpenNewStudentModal={onOpenNewStudentModal}
          onSetBadgeStudent={onSetBadgeStudent}
          onToggleEnglishChallenge={onToggleEnglishChallenge}
          onDeleteStudent={onDeleteStudent}
          onToggleActivityStatus={onToggleActivityStatus}
          onUpdateStudentSpecialty={onUpdateStudentSpecialty}
        />
      )}
    </div>
  );
};

const resolveAssignmentName = (assignment) => {
  if (!assignment) return 'Vago';
  if (typeof assignment === 'object' && assignment.name) return assignment.name;
  return `${assignment}`;
};

const formatDate = (value) => {
  if (!value) return 'Sem data';
  const [year, month, day] = `${value}`.split('-');
  return year && month && day ? `${day}/${month}/${year}` : value;
};

const RotationOperationsPanel = ({ students, currentWeekData, canManage, onApplyRotation, onOpenSchedule, applications = [], busy, onUndoRotation }) => {
  const assignments = currentWeekData?.assignments || {};
  const totalAssigned = STATION_CONFIGS.reduce((total, station) => total + (assignments[station.key] || []).filter((entry) => resolveAssignmentName(entry) !== 'Vago').length, 0);
  const applied = applications.find((item) => item.startDate === currentWeekData?.startDate && item.status === 'applied');

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <section className="rounded-[30px] border border-white/10 bg-[linear-gradient(135deg,rgba(13,17,28,0.98),rgba(11,12,20,0.98))] p-5 shadow-[0_25px_70px_rgba(0,0,0,0.28)] md:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-100"><LayoutDashboard size={13} /> Planejamento semanal</p>
            <h2 className="mt-3 text-2xl font-black text-white md:text-3xl">Rodizio da equipe</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-300">Consulte a escala semanal e aplique as estacoes planejadas quando o rodizio estiver em uso.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={onOpenSchedule} className="rounded-[16px] border border-white/10 bg-white/5 px-4 py-3 text-xs font-black uppercase tracking-[0.1em] text-white hover:bg-white/10">Ver cronograma completo</button>
            {canManage && <button onClick={onApplyRotation} disabled={!currentWeekData || busy || Boolean(applied)} className="rounded-[16px] border border-blue-400/20 bg-blue-400/10 px-4 py-3 text-xs font-black uppercase tracking-[0.1em] text-blue-100 hover:bg-blue-400 hover:text-black disabled:cursor-not-allowed disabled:opacity-50">{busy ? 'Salvando…' : applied ? 'Semana já aplicada' : 'Aplicar rodízio'}</button>}
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <SummaryMetricCard label="Semana" value={currentWeekData?.weekName || 'Sem escala'} helper={currentWeekData ? `${formatDate(currentWeekData.startDate)} ate ${formatDate(currentWeekData.endDate)}` : 'Escolha uma semana no cronograma'} />
          <SummaryMetricCard label="Alunos escalados" value={totalAssigned} helper="Nomes previstos nas estacoes" />
          <SummaryMetricCard label="Equipe cadastrada" value={students.length} helper="Gerencie alunos na aba Alunos" />
        </div>
      </section>

      <p className="rounded-2xl border border-white/10 p-4 text-sm text-slate-300">Prévia da distribuição. As entregas atuais serão preservadas. {Math.max(0, students.length - totalAssigned)} integrante(s) fora da escala manterão sua estação atual.</p>
      <section className="grid gap-4 xl:grid-cols-3">
        {STATION_CONFIGS.map((station) => {
          const stationAssignments = assignments[station.key] || [];
          return (
            <div key={station.key} className={`rounded-[26px] border p-5 ${station.tone}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-[15px] border ${station.badgeTone}`}><station.Icon size={17} /></span>
                  <div><h3 className="font-black text-white">{station.label}</h3><p className="mt-0.5 text-[10px] text-gray-400">Escala da semana</p></div>
                </div>
                <span className="rounded-full border border-white/10 bg-black/25 px-2.5 py-1 text-[10px] font-bold text-gray-200">{stationAssignments.length}</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {stationAssignments.length > 0 ? stationAssignments.map((entry, index) => (
                  <span key={`${station.key}-${resolveAssignmentName(entry)}-${index}`} className="rounded-full border border-white/10 bg-black/25 px-3 py-2 text-xs font-semibold text-gray-200">{resolveAssignmentName(entry)}</span>
                )) : <p className="rounded-xl border border-dashed border-white/10 px-3 py-4 text-xs text-gray-500">Nenhum nome previsto nesta estacao.</p>}
              </div>
            </div>
          );
        })}
      </section>
      <section className="rounded-2xl border border-white/10 p-4"><h3 className="font-bold text-white">Aplicações do rodízio</h3><div className="mt-3 space-y-2">{applications.length ? [...applications].sort((a, b) => String(b.appliedAt).localeCompare(String(a.appliedAt))).map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white/5 p-3 text-sm text-slate-300"><span>{item.weekName} · {formatDate(item.startDate)} · {item.status === 'applied' ? 'Aplicada' : 'Desfeita'} por {item.appliedBy}</span>{canManage && item.status === 'applied' && <button disabled={busy} onClick={() => onUndoRotation(item)} className="rounded-full border border-white/20 px-3 py-2 disabled:opacity-50">Desfazer distribuição</button>}</div>) : <p className="text-sm text-slate-400">Nenhuma aplicação registrada nesta temporada.</p>}</div></section>
    </div>
  );
};

export default RotationOperationsPanel;
