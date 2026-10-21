import { useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";
import { exportTeamBackup, exportTeamPdf } from "../services/teamBackup";
import { downloadBlob } from "../utils/download";

export default function TeamBackupPanel({
  db,
  user,
  seasonId,
  seasons = [],
  reportsEnabled,
}) {
  const [selectedScope, setScope] = useState(seasonId);
  const [includePdf, setIncludePdf] = useState(true);
  const [includeFiles, setIncludeFiles] = useState(false);
  const [busy, setBusy] = useState("");
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const scope =
    selectedScope === "all" ||
    selectedScope === seasonId ||
    seasons.some((season) => season.id === selectedScope)
      ? selectedScope
      : seasonId;
  const canIncludeOriginals = Boolean(reportsEnabled && user?.uid);
  const exportData = async (format) => {
    if (busy) return;
    setBusy(format);
    setError("");
    setSuccess("");
    setProgress("Consultando os dados da equipe…");
    try {
      const options = {
        db,
        user,
        scope,
        reportsEnabled: canIncludeOriginals,
        onProgress: setProgress,
      };
      const file =
        format === "pdf"
          ? await exportTeamPdf(options)
          : await exportTeamBackup({
              ...options,
              includePdf,
              includeFiles: includeFiles && canIncludeOriginals,
            });
      const filename =
        (format === "pdf" ? "newgears-relatorio-" : "newgears-backup-") +
        scope +
        "-" +
        new Date().toISOString().slice(0, 10) +
        "." +
        format;
      downloadBlob(file, filename);
      setSuccess(
        format === "pdf"
          ? "Relatório em PDF preparado para download."
          : "Backup preparado para download." +
              (includePdf
                ? " O arquivo relatorio-da-equipe.pdf está dentro do ZIP."
                : ""),
      );
    } catch (issue) {
      setError(
        issue.message ||
          "Não foi possível concluir a exportação. Tente novamente.",
      );
    } finally {
      setBusy("");
      setProgress("");
    }
  };
  const choices = [
    { id: seasonId, name: "Temporada ativa" },
    ...seasons
      .filter((season) => season.id !== seasonId)
      .map((season) => ({ id: season.id, name: season.name })),
    { id: "all", name: "Todas as temporadas" },
  ];
  return (
    <section
      aria-busy={Boolean(busy)}
      className="space-y-5 rounded-[26px] border border-white/10 bg-[#121722] p-5 md:p-6"
    >
      <div>
        <h2 className="text-xl font-black text-white">
          Relatório em PDF e backup
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          Baixe um relatório legível dos dados da equipe em PDF ou um ZIP com a
          cópia dos dados. O PDF está disponível no seu acesso atual.
        </p>
      </div>
      <label className="block text-sm text-slate-300">
        Registros da temporada
        <select
          disabled={Boolean(busy)}
          value={scope}
          onChange={(event) => setScope(event.target.value)}
          className="mt-2 w-full rounded-xl border border-white/15 bg-[#111827] p-3 text-white"
        >
          {choices.map((choice) => (
            <option key={choice.id} value={choice.id}>
              {choice.name}
            </option>
          ))}
        </select>
      </label>
      <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
        <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-200">
          <input
            type="checkbox"
            disabled={Boolean(busy)}
            checked={includePdf}
            onChange={(event) => setIncludePdf(event.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 accent-cyan-300"
          />
          <span>
            Incluir o relatório da equipe em PDF no ZIP
            <span className="mt-1 block text-xs leading-relaxed text-slate-400">
              Integrantes, projeto, tarefas, frequência, agenda e demais
              registros textuais disponíveis na temporada escolhida.
            </span>
          </span>
        </label>
        {canIncludeOriginals ? (
          <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-200">
            <input
              type="checkbox"
              disabled={Boolean(busy)}
              checked={includeFiles}
              onChange={(event) => setIncludeFiles(event.target.checked)}
              className="mt-1 h-4 w-4 shrink-0 accent-cyan-300"
            />
            <span>
              Incluir também os anexos originais dos relatórios semanais
              <span className="mt-1 block text-xs leading-relaxed text-slate-400">
                Arquivos PDF e Word enviados pelos alunos, mantidos no formato
                original.
              </span>
            </span>
          </label>
        ) : (
          <p className="text-xs leading-relaxed text-slate-400">
            Os anexos privados enviados em Relatórios Semanais ficam disponíveis
            após entrar pelo acesso autenticado. Isso não impede gerar o PDF dos
            dados da equipe.
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={Boolean(busy)}
          onClick={() => exportData("pdf")}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-wait disabled:opacity-50"
        >
          {busy === "pdf" ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <FileText size={16} />
          )}
          {busy === "pdf" ? "Gerando PDF…" : "Baixar relatório em PDF"}
        </button>
        <button
          type="button"
          disabled={Boolean(busy)}
          onClick={() => exportData("zip")}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold text-slate-200 transition hover:bg-white/10 disabled:cursor-wait disabled:opacity-50"
        >
          {busy === "zip" ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Download size={16} />
          )}
          {busy === "zip" ? "Preparando ZIP…" : "Baixar backup ZIP"}
        </button>
      </div>
      <p className="text-xs leading-relaxed text-slate-400">
        O PDF é um relatório para leitura. O ZIP preserva os dados para
        recuperação manual, com manifesto e verificações dos arquivos. Senhas e
        contas de acesso ficam fora das exportações. Imagens e arquivos de links
        externos não são incorporados ao PDF.
      </p>
      {progress && (
        <p role="status" className="text-sm text-cyan-100">
          {progress}
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-200">
          {error}
        </p>
      )}
      {success && (
        <p role="status" className="text-sm text-emerald-200">
          {success}
        </p>
      )}
    </section>
  );
}
