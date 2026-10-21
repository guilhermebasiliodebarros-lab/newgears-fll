import { backupValue } from "./backup.js";
import { ATTENDANCE_LABELS, sessionEntries } from "./teamProcesses.js";

const STATUS = {
  todo: "A fazer",
  doing: "Em andamento",
  review: "Em revisão",
  done: "Concluída",
  active: "Ativo",
  inactive: "Arquivado",
  planned: "Planejado",
  complete: "Concluído",
  completed: "Concluído",
  approved: "Aprovado",
  rejected: "Devolvido",
  pending: "Pendente",
  applied: "Aplicado",
  undone: "Desfeito",
  draft: "Rascunho",
  weekly: "Semanal",
  presentation: "Apresentação",
  report: "Relatório",
};
const LABELS = {
  turma: "Turma",
  text: "Descrição",
  description: "Descrição",
  content: "Conteúdo",
  status: "Situação",
  author: "Registrado por",
  actor: "Responsável",
  actorName: "Responsável",
  studentName: "Integrante",
  createdBy: "Autor",
  createdAt: "Registrado em",
  updatedAt: "Atualizado em",
  date: "Data",
  time: "Tempo / horário",
  dueDate: "Prazo",
  weekName: "Semana",
  weekLabel: "Semana",
  week: "Semana",
  startDate: "Início",
  station: "Estação",
  priority: "Prioridade",
  evidence: "Resultado apresentado",
  feedback: "Feedback",
  frontLabel: "Frente",
  commitment: "Compromisso",
  progressNote: "Andamento",
  nextStep: "Próximo passo",
  type: "Tipo",
  strengths: "Pontos fortes",
  improvement: "Melhorias",
  improvements: "Melhorias",
  note: "Observações",
  reason: "Motivo",
  total: "Pontuação registrada",
  score: "Pontuação",
  amount: "Quantidade / XP",
  xpAmount: "XP",
  reportScore: "Nota do relatório",
  reportNote: "Observações do relatório",
  selectionNote: "Observações da seleção",
  selectedForTournament: "Selecionado para o torneio",
  location: "Local",
  roundName: "Saída",
  robotVersionLabel: "Versão utilizada",
  strategy: "Estratégia",
  contributors: "Participantes",
  attachmentUse: "Mecanismo utilizado",
  programmingUse: "Programação utilizada",
  adjustment: "Ajuste",
  learning: "Aprendizado",
  version: "Versão",
  focus: "Foco",
  result: "Resultado",
  expertName: "Especialista",
  channel: "Canal",
  application: "Aplicação do feedback",
  peopleReached: "Pessoas alcançadas",
  people: "Pessoas alcançadas",
  impact: "Impacto",
  feasibility: "Viabilidade",
  novelty: "Originalidade",
  difficulty: "Dificuldade",
  mood: "Humor / energia",
  battery: "Energia",
  action: "Ação",
  detail: "Detalhes",
  specialty: "Área de atuação",
  specialties: "Áreas de atuação",
  purpose: "Finalidade",
  materials: "Materiais",
  mechanism: "Mecanismo",
  code: "Código",
  programming: "Programação",
  notes: "Observações",
  participants: "Participantes",
  title: "Título",
  name: "Nome",
  reportDate: "Data do relatório",
  fileName: "Arquivo original",
  problem: "Problema",
  solution: "Solução",
  sharing: "Compartilhamento",
  updatedBy: "Atualizado por",
  target: "Meta",
  deadline: "Prazo",
  comunicacao: "Comunicação",
  identificacao: "Identificação",
  design: "Design",
  criacao: "Criação",
  iteracao: "Iteração",
  commitmentScore: "Comprometimento",
  teamwork: "Trabalho em equipe",
  initiative: "Iniciativa",
  integration: "Integração",
  fllValues: "Valores FLL",
  projectKnowledge: "Conhecimento do projeto",
  communication: "Comunicação",
  questions: "Respostas às perguntas",
  posture: "Postura",
  inclusion: "Inclusão",
  score1: "Critério 1",
  score2: "Critério 2",
  score3: "Critério 3",
};
const CORE_FIELDS = [
  "date",
  "reportDate",
  "createdAt",
  "updatedAt",
  "studentName",
  "author",
  "createdBy",
  "weekName",
  "weekLabel",
  "week",
  "status",
  "type",
  "description",
  "text",
  "content",
];
const SECTIONS = [
  [
    "tasks",
    "Tarefas e entregas",
    [...CORE_FIELDS, "dueDate", "priority", "evidence", "feedback"],
  ],
  ["events", "Agenda da equipe", [...CORE_FIELDS, "time", "location"]],
  [
    "finalSprintAssignments",
    "Frentes da reta final",
    [...CORE_FIELDS, "frontLabel", "commitment", "progressNote", "nextStep"],
  ],
  [
    "finalSprintEvaluations",
    "Avaliações da equipe",
    [...CORE_FIELDS, "strengths", "improvement", "note", "total"],
  ],
  [
    "finalSprintSelectionScores",
    "Preparação para o torneio",
    [
      "studentName",
      "selectedForTournament",
      "selectionNote",
      "reportScore",
      "reportNote",
    ],
  ],
  ["attendanceSessions", "Chamadas e frequência", ["date", "updatedBy"]],
  [
    "rotationApplications",
    "Histórico do rodízio",
    ["weekName", "startDate", "status", "appliedAt", "appliedBy"],
  ],
  ["logbook", "Diário de bordo", [...CORE_FIELDS]],
  [
    "score_history",
    "Treinos e pontuações",
    [
      ...CORE_FIELDS,
      "roundName",
      "score",
      "time",
      "robotVersionLabel",
      "strategy",
      "contributors",
      "attachmentUse",
      "programmingUse",
      "adjustment",
      "learning",
    ],
  ],
  [
    "prototypeIterations",
    "Evolução do protótipo",
    [
      ...CORE_FIELDS,
      "version",
      "focus",
      "participants",
      "feedback",
      "improvement",
      "improvements",
      "result",
    ],
  ],
  [
    "expertContacts",
    "Contato com especialistas",
    [
      ...CORE_FIELDS,
      "expertName",
      "channel",
      "feedback",
      "application",
      "result",
    ],
  ],
  [
    "outreach",
    "Divulgação e impacto",
    [...CORE_FIELDS, "location", "peopleReached", "people", "result"],
  ],
  [
    "decisionMatrix",
    "Matriz de ideias",
    [...CORE_FIELDS, "impact", "feasibility", "novelty", "difficulty", "score"],
  ],
  [
    "xpRecords",
    "Movimentações de XP",
    [...CORE_FIELDS, "reason", "amount", "xpAmount"],
  ],
  [
    "xpLossRecords",
    "Ajustes de XP",
    [...CORE_FIELDS, "reason", "amount", "xpAmount"],
  ],
  [
    "leaderPenaltyRequests",
    "Solicitações de revisão",
    [...CORE_FIELDS, "reason", "feedback"],
  ],
  [
    "dailyMoods",
    "Check-ins da equipe",
    [...CORE_FIELDS, "mood", "battery", "note"],
  ],
  [
    "activityLogs",
    "Histórico de atividades",
    [...CORE_FIELDS, "action", "detail", "actor", "actorName"],
  ],
  [
    "weeklyReports",
    "Relatórios semanais publicados",
    ["studentName", "title", "week", "reportDate", "description", "fileName"],
  ],
];
const SHARED_SECTIONS = [
  [
    "robotVersions",
    "Versões do robô",
    [
      "version",
      "date",
      "author",
      "description",
      "changes",
      "improvements",
      "learning",
      "notes",
    ],
  ],
  [
    "attachments",
    "Mecanismos e anexos",
    ["description", "purpose", "materials", "mechanism", "notes"],
  ],
  [
    "codeSnippets",
    "Programas e códigos",
    ["description", "date", "author", "code", "notes"],
  ],
  [
    "rounds",
    "Plano de saídas do robô",
    ["description", "strategy", "estimatedTime", "notes"],
  ],
  [
    "missions",
    "Missões cadastradas",
    ["text", "description", "score", "notes"],
  ],
  [
    "experts",
    "Especialistas cadastrados",
    ["specialty", "description", "notes"],
  ],
  ["compliments", "Reconhecimentos da equipe", [...CORE_FIELDS]],
  [
    "strategies",
    "Estratégias registradas",
    ["description", "author", "notes", "date"],
  ],
  [
    "pitstop_records",
    "Registros de pit stop",
    [...CORE_FIELDS, "time", "notes"],
  ],
  [
    "publicGalleryPhotos",
    "Legendas da galeria",
    ["description", "caption", "date"],
  ],
];
const clean = (value) =>
  String(value ?? "")
    .replace(/\r\n?/g, "\n")
    .trim();
export function reportDate(value) {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value))
    return value.split("-").reverse().join("/");
  const date =
    value?.$type === "timestamp"
      ? new Date(value.seconds * 1000)
      : new Date(value?.value || value);
  return Number.isNaN(date.getTime())
    ? clean(value)
    : date.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
}
function displayValue(value, key = "") {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (typeof value === "object" && ["$type"].some((field) => value[field]))
    return ["timestamp", "date"].includes(value.$type) ? reportDate(value) : "";
  if (Array.isArray(value))
    return value
      .map((item) =>
        item && typeof item === "object"
          ? item.name || item.label || ""
          : displayValue(item),
      )
      .filter(Boolean)
      .join(", ");
  if (typeof value === "object") return "";
  const raw = clean(value);
  if (/^data:/i.test(raw)) return "Arquivo registrado no sistema";
  if (/date|at$|deadline/i.test(key)) return reportDate(value);
  if (["time", "estimatedTime"].includes(key) && typeof value === "number")
    return `${value} s`;
  if (["status", "type"].includes(key)) return STATUS[raw] || raw;
  return raw;
}
const label = (key) =>
  LABELS[key] ||
  {
    changes: "Alterações",
    estimatedTime: "Tempo estimado",
    caption: "Legenda",
    appliedAt: "Aplicado em",
    appliedBy: "Aplicado por",
  }[key] ||
  key;
const fieldsFrom = (record, keys) =>
  [...new Set(keys)].flatMap((key) => {
    const value = displayValue(record[key], key);
    return value ? [[label(key), value]] : [];
  });
const sortRecords = (records) =>
  [...records].sort(
    (a, b) =>
      String(
        b.data.date || b.data.reportDate || b.data.createdAt || "",
      ).localeCompare(
        String(a.data.date || a.data.reportDate || a.data.createdAt || ""),
      ) ||
      String(a.data.title || a.data.name || "").localeCompare(
        String(b.data.title || b.data.name || ""),
        "pt-BR",
      ),
  );

export function buildTeamReport({
  documents,
  scope,
  startedAt,
  activeSeasonId = "legacy",
  activeSeasonName = "Temporada atual",
  omissions = [],
}) {
  const records = documents.map((entry) => ({
    path: entry.path,
    parts: entry.path.split("/"),
    data: backupValue(entry.data),
  }));
  const collection = (name) =>
    records.filter(
      (entry) => entry.parts.length === 2 && entry.parts[0] === name,
    );
  const seasons = collection("teamSeasons");
  const seasonName = (id) =>
    seasons.find((item) => item.parts[1] === id)?.data.name ||
    (id === activeSeasonId
      ? activeSeasonName
      : id === "legacy"
        ? "Ciclo legado"
        : "Temporada arquivada");
  const scopeName = scope === "all" ? "Todas as temporadas" : seasonName(scope);
  const currentRoster = collection("students").map((item) => ({
    ...item.data,
    id: item.parts[1],
  }));
  const archived = seasons.find(
    (item) => item.parts[1] === scope && item.data.status === "archived",
  );
  const roster = archived?.data.teamSnapshot || currentRoster;
  const studentName = (id) =>
    roster.find((item) => item.id === id)?.name ||
    currentRoster.find((item) => item.id === id)?.name ||
    "Integrante não identificado";
  const sections = [];
  const add = (title, items, description = "") => {
    if (items.length) sections.push({ title, description, items });
  };
  add(
    "Integrantes da equipe",
    roster.map((student) => ({
      title: student.name || "Integrante sem nome",
      fields: [
        ["Situação", student.status === "inactive" ? "Arquivado" : "Ativo"],
        ...fieldsFrom(student, ["turma", "station"]),
        ["XP registrado", String(Number(student.xp) || 0)],
        [
          "Frequência acumulada",
          Number(student.totalClasses) > 0
            ? `${Number(student.attendedClasses) || 0} de ${student.totalClasses} encontros (${Math.round(((Number(student.attendedClasses) || 0) / student.totalClasses) * 100)}%)`
            : "Sem base registrada",
        ],
        [
          "Conquistas registradas",
          String(Array.isArray(student.badges) ? student.badges.length : 0),
        ],
      ],
    })),
    archived
      ? "Retrato dos integrantes ao encerrar a temporada selecionada."
      : "Cadastro compartilhado atual. XP e frequência são acumulados do cadastro, não apenas do período selecionado.",
  );
  const projectSnapshots = records.filter(
    (entry) =>
      entry.parts[0] === "teamSeasons" &&
      entry.parts[2] === "workspace" &&
      entry.parts[3] === "project",
  );
  const projects = archived
    ? projectSnapshots
    : collection("project").filter(
        (item, index, list) =>
          item.parts[1] === "main" ||
          (!list.some((candidate) => candidate.parts[1] === "main") &&
            index === 0),
      );
  add(
    "Projeto de Inovação",
    projects.map((item) => {
      const data = item.data.data || item.data;
      return {
        title: data.title || "Projeto de Inovação",
        fields: fieldsFrom(data, [
          "problem",
          "solution",
          "sharing",
          "description",
          "impact",
        ]),
      };
    }),
    archived
      ? "Projeto preservado no encerramento da temporada."
      : "Resumo atual do projeto compartilhado.",
  );
  const seasonIds =
    scope === "all"
      ? [
          ...new Set([
            activeSeasonId,
            ...seasons.map((item) => item.parts[1]),
            ...records
              .filter((item) =>
                SECTIONS.some(([name]) => name === item.parts[0]),
              )
              .map((item) => item.data.seasonId || activeSeasonId),
          ]),
        ]
      : [scope];
  for (const seasonId of seasonIds) {
    for (const [name, title, keys] of SECTIONS) {
      const selected = sortRecords(
        records.filter(
          (item) =>
            (name === "logbook"
              ? item.parts.at(-2) === "logbook"
              : item.parts.length === 2 && item.parts[0] === name) &&
            (item.data.seasonId ||
              (name === "weeklyReports" ? "legacy" : activeSeasonId)) ===
              seasonId,
        ),
      );
      add(
        scope === "all" ? `${title} · ${seasonName(seasonId)}` : title,
        selected.map((item, index) => {
          const record = item.data;
          const fields = fieldsFrom(record, keys);
          if (name === "tasks") {
            if (record.participants?.length)
              fields.push([
                "Responsáveis",
                record.participants
                  .map((person) => person.name || studentName(person.id))
                  .join(", "),
              ]);
            if (record.block && !record.block.resolvedAt)
              fields.push(["Impedimento aberto", clean(record.block.reason)]);
          }
          if (name === "attendanceSessions") {
            for (const [id, entry] of Object.entries(sessionEntries(record)))
              fields.push([
                studentName(id),
                `${ATTENDANCE_LABELS[entry.status] || entry.status}${entry.note ? ` · ${entry.note}` : ""}`,
              ]);
          }
          if (name === "rotationApplications")
            for (const entry of record.entries || [])
              fields.push([
                entry.name || studentName(entry.studentId),
                entry.station || "Estação a definir",
              ]);
          if (name === "finalSprintEvaluations")
            fields.push(
              ...fieldsFrom(
                record.ratings || {},
                Object.keys(record.ratings || {}),
              ),
            );
          const title =
            record.title ||
            record.name ||
            record.text ||
            record.studentName ||
            record.weekName ||
            record.roundName ||
            (record.studentId ? studentName(record.studentId) : "") ||
            `${name === "logbook" ? "Registro de diário" : "Registro"} ${index + 1}`;
          const firstLine = clean(title).split("\n")[0];
          return {
            title:
              firstLine.length > 160
                ? firstLine.slice(0, 157) + "…"
                : firstLine,
            fields,
          };
        }),
      );
    }
    const submissions = records.filter(
      (item) =>
        item.parts[0] === "teamSeasons" &&
        item.parts[1] === seasonId &&
        item.parts[2] === "students" &&
        item.data.submission,
    );
    add(
      `Entregas preservadas · ${seasonName(seasonId)}`,
      submissions.map((item) => ({
        title: item.data.name || "Integrante",
        fields: fieldsFrom(item.data.submission, [
          "status",
          "text",
          "date",
          "feedback",
          "fileName",
        ]),
      })),
    );
    const workspace = records.filter(
      (item) =>
        item.parts[0] === "teamSeasons" &&
        item.parts[1] === seasonId &&
        item.parts[2] === "workspace" &&
        item.parts[3] !== "project",
    );
    add(
      `Metas e rubricas preservadas · ${seasonName(seasonId)}`,
      workspace.map((item) => {
        const data = item.data.data || {};
        const fields = [];
        for (const [key, value] of Object.entries(data)) {
          if (value && typeof value === "object" && !value.$type)
            for (const pair of fieldsFrom(value, ["text", "deadline"]))
              fields.push([`${label(key)} · ${pair[0]}`, pair[1]]);
          else {
            const formatted = displayValue(value, key);
            if (formatted && !["id", "seasonId"].includes(key))
              fields.push([label(key), formatted]);
          }
        }
        return { title: item.data.title || "Registro coletivo", fields };
      }),
    );
  }
  if (!archived)
    add(
      "Entregas atuais das estações",
      currentRoster
        .filter((student) => student.submission)
        .map((student) => ({
          title: student.name || "Integrante",
          fields: fieldsFrom(student.submission, [
            "status",
            "text",
            "date",
            "feedback",
            "fileName",
          ]),
        })),
      "Situação atual das entregas associadas ao cadastro dos integrantes.",
    );
  if (scope === "all")
    add(
      "Projetos preservados de temporadas anteriores",
      projectSnapshots.map((item) => ({
        title: `${seasonName(item.parts[1])} · ${item.data.data?.title || "Projeto"}`,
        fields: fieldsFrom(item.data.data || {}, [
          "problem",
          "solution",
          "sharing",
          "description",
          "impact",
        ]),
      })),
    );
  for (const [name, title, keys] of SHARED_SECTIONS)
    add(
      title,
      sortRecords(collection(name)).map((item, index) => ({
        title:
          item.data.name ||
          item.data.title ||
          item.data.version ||
          `${title} ${index + 1}`,
        fields: fieldsFrom(item.data, keys),
      })),
      "Acervo compartilhado atual, utilizado entre temporadas.",
    );
  if (!archived)
    for (const [id, title] of [
      ["rubric_innovation", "Rubrica atual do Projeto de Inovação"],
      ["rubric_robot_design", "Rubrica atual do Design do Robô"],
    ]) {
      const rubric = records.find(
        (entry) => entry.path === `settings/${id}`,
      )?.data;
      if (rubric)
        add(title, [
          {
            title: "Critérios registrados",
            fields: fieldsFrom(rubric, [
              "identificacao",
              "design",
              "criacao",
              "iteracao",
              "comunicacao",
            ]),
          },
        ]);
    }
  return {
    scopeName,
    startedAt,
    recordCount: records.length,
    sections,
    omissions,
    rosterCount: roster.length,
  };
}
