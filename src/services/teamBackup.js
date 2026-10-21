import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
} from "firebase/firestore";
import { SEASON_COLLECTIONS } from "../utils/teamProcesses";
import { createBackupArchive } from "../utils/backup";
import { getWeeklyReportFile, loadBackupPrivateData } from "./weeklyReports";

const SHARED = [
  "students",
  "teamSeasons",
  "project",
  "robotVersions",
  "attachments",
  "codeSnippets",
  "rounds",
  "missions",
  "experts",
  "compliments",
  "publicGalleryPhotos",
  "strategies",
  "pitstop_records",
];
const SETTINGS = [
  "admin_profile",
  "workspace_season",
  "team_stats",
  "weekly_missions",
  "rubric_innovation",
  "rubric_robot_design",
  "public_showcase",
];
const safeName = (value) =>
  String(value || "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 130) || "arquivo";
async function collectTeamData({
  db,
  user,
  scope,
  reportsEnabled,
  includePrivateData = true,
  onProgress = () => {},
}) {
  if (user?.type !== "admin")
    throw new Error("Apenas o técnico pode exportar os dados da equipe.");
  const startedAt = new Date().toISOString();
  const settingsRef = doc(db, "settings", "workspace_season");
  const before = (await getDoc(settingsRef)).data() || {};
  if (before.transitionLock)
    throw new Error("Conclua o encerramento da temporada antes de exportar.");
  const documents = [];
  const omissions = [];
  const sources = [...new Set([...SHARED, ...SEASON_COLLECTIONS])];
  let reportRecords = [];
  const inScope = (name, record) =>
    scope === "all" ||
    (name === "teamSeasons"
      ? record.id === scope
      : SHARED.includes(name) ||
        (record.seasonId ||
          (name === "weeklyReports"
            ? "legacy"
            : before.activeSeasonId || "legacy")) === scope);
  for (let index = 0; index < sources.length; index += 1) {
    const name = sources[index];
    onProgress(`Lendo dados da equipe (${index + 1}/${sources.length})…`);
    const snapshot = await getDocs(
      name === "logbook" ? collectionGroup(db, name) : collection(db, name),
    );
    snapshot.docs.forEach((item) => {
      if (inScope(name, { ...item.data(), id: item.id }))
        documents.push({ path: item.ref.path, data: item.data() });
    });
  }
  for (const name of SETTINGS) {
    const snapshot = await getDoc(doc(db, "settings", name));
    if (snapshot.exists())
      documents.push({ path: snapshot.ref.path, data: snapshot.data() });
  }
  for (const season of documents.filter(
    (item) =>
      item.path.startsWith("teamSeasons/") && item.path.split("/").length === 2,
  )) {
    for (const child of ["students", "workspace"]) {
      const snapshot = await getDocs(collection(db, season.path, child));
      snapshot.docs.forEach((item) =>
        documents.push({ path: item.ref.path, data: item.data() }),
      );
    }
  }
  if (reportsEnabled && user.uid) {
    const snapshot = await getDocs(collection(db, "weeklyReports"));
    reportRecords = snapshot.docs
      .map((item) => ({ ...item.data(), id: item.id, path: item.ref.path }))
      .filter((record) => inScope("weeklyReports", record));
    reportRecords.forEach((report) => {
      const data = { ...report };
      delete data.path;
      delete data.id;
      documents.push({ path: report.path, data });
    });
    if (includePrivateData) {
      const privateData = await loadBackupPrivateData(scope);
      documents.push(...privateData.documents);
    }
  } else
    omissions.push(
      "Relatórios privados não exportados: acesso autenticado indisponível.",
    );
  await assertStableSeason(db, before);
  return { documents, reportRecords, omissions, startedAt, before, scope };
}

async function assertStableSeason(db, before) {
  const after =
    (await getDoc(doc(db, "settings", "workspace_season"))).data() || {};
  if (
    after.transitionLock ||
    (after.activeSeasonId || "legacy") !== (before.activeSeasonId || "legacy")
  )
    throw new Error(
      "A temporada mudou durante a exportação. Exporte novamente.",
    );
}

async function renderTeamPdf(
  { documents, scope, startedAt, before, omissions },
  onProgress,
) {
  onProgress("Preparando relatório da equipe em PDF…");
  const { createTeamPdf } = await import("../utils/teamPdf");
  return createTeamPdf({
    documents,
    scope,
    startedAt,
    activeSeasonId: before.activeSeasonId || "legacy",
    activeSeasonName: before.activeSeasonName || "Temporada atual",
    omissions,
    onProgress,
  });
}

export async function exportTeamPdf(options) {
  const onProgress = options.onProgress || (() => {});
  const data = await collectTeamData({
    ...options,
    includePrivateData: false,
    onProgress,
  });
  const pdf = await renderTeamPdf(data, onProgress);
  await assertStableSeason(options.db, data.before);
  return pdf;
}

export async function exportTeamBackup({
  db,
  user,
  scope,
  reportsEnabled,
  includeFiles = false,
  includePdf = true,
  onProgress = () => {},
}) {
  if (includeFiles && !(reportsEnabled && user?.uid))
    throw new Error(
      "Os anexos originais exigem acesso autenticado aos relatórios. O relatório da equipe em PDF está disponível sem essa opção.",
    );
  const data = await collectTeamData({
    db,
    user,
    scope,
    reportsEnabled,
    onProgress,
  });
  const { documents, reportRecords, omissions, startedAt, before } = data;
  const files = [];
  let totalBytes = 0;
  if (includeFiles && reportsEnabled) {
    if (
      reportRecords.reduce(
        (sum, report) => sum + (Number(report.fileSize) || 0),
        0,
      ) >
      250 * 1024 * 1024
    )
      throw new Error(
        "Os relatórios excedem 250 MB. Exporte uma temporada menor ou somente os dados.",
      );
    for (let index = 0; index < reportRecords.length; index += 1) {
      const report = reportRecords[index];
      onProgress(`Baixando relatório ${index + 1}/${reportRecords.length}…`);
      const link = await getWeeklyReportFile(report.id, true);
      if (link.reportUpdatedAt !== (report.updatedAt || ""))
        throw new Error(
          "Um relatório mudou durante o backup. Exporte novamente.",
        );
      const response = await fetch(link.url);
      if (!response.ok)
        throw new Error(
          `Não foi possível incluir ${report.fileName}. Nenhum backup parcial foi baixado.`,
        );
      const bytes = new Uint8Array(await response.arrayBuffer());
      totalBytes += bytes.length;
      if (bytes.length !== report.fileSize)
        throw new Error(
          "Um arquivo foi alterado durante a exportação. Tente novamente.",
        );
      if (totalBytes > 250 * 1024 * 1024)
        throw new Error(
          "Os relatórios excedem 250 MB. Exporte uma temporada menor ou somente os dados.",
        );
      files.push({
        name: `relatorios/${safeName(report.id)}/${safeName(report.fileName)}`,
        bytes,
      });
    }
  } else if (reportRecords.length)
    omissions.push(
      "Arquivos PDF e Word não incluídos; somente metadados e referências.",
    );
  if (includePdf)
    files.push({
      name: "relatorio-da-equipe.pdf",
      bytes: new Uint8Array(
        await (await renderTeamPdf(data, onProgress)).arrayBuffer(),
      ),
    });
  await assertStableSeason(db, before);
  onProgress("Preparando ZIP e verificações dos arquivos…");
  return createBackupArchive({
    documents,
    files,
    scope,
    startedAt,
    filesIncluded: Boolean(includeFiles && reportsEnabled && user.uid),
    omissions,
  });
}
