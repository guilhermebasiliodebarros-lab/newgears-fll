import React from 'react';
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Code,
  Cpu,
  GitCommit,
  Image as ImageIcon,
  Laptop,
  Pencil,
  Sparkles,
  Trash2,
  UserCircle,
  Wrench,
} from 'lucide-react';

const formatShortDate = (value) => {
  if (!value) return '--';
  const [year, month, day] = value.split('-');
  return year && month && day ? `${day}/${month}` : value;
};

const formatFullDate = (value) => {
  if (!value) return 'Sem data';
  const [year, month, day] = value.split('-');
  return year && month && day ? `${day}/${month}/${year}` : value;
};

const getRoundName = (roundId, rounds) => rounds.find((round) => round.id === roundId)?.name || 'Geral';

const MetricCard = ({ label, value, helper, tone = 'border-white/10 bg-black/25 text-white' }) => (
  <div className={`rounded-2xl border p-4 ${tone}`}>
    <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500 font-bold">{label}</p>
    <p className="text-2xl font-black text-white mt-3">{value}</p>
    {helper && <p className="text-xs text-gray-400 mt-2">{helper}</p>}
  </div>
);

const EmptyState = ({ text }) => (
  <div className="text-center text-gray-500 text-sm italic py-8 border border-dashed border-white/10 rounded-2xl bg-black/20">
    {text}
  </div>
);

const MetaChip = ({ children, tone = 'border-white/10 bg-white/5 text-gray-300' }) => (
  <span className={`text-[10px] flex items-center gap-1 rounded-full border px-2 py-1 ${tone}`}>
    {children}
  </span>
);

const RobotDesignStrategyPanel = ({
  robotVersions,
  attachments,
  codeSnippets,
  rounds,
  activeCommandCode,
  iterationRecords,
  isAdmin,
  viewAsStudent,
  onOpenRobot,
  onOpenRobotEdit,
  onOpenRobotView,
  onDeleteRobotVersion,
  onOpenAttachment,
  onOpenAttachmentEdit,
  onOpenAttachmentView,
  onDeleteAttachment,
  onOpenCode,
  onOpenCodeEdit,
  onOpenCodeView,
  onApplyCode,
  onDeleteCode,
}) => {
  const sortedRobotVersions = [...robotVersions].sort((left, right) => new Date(right.date || 0) - new Date(left.date || 0));
  const sortedAttachments = [...attachments].sort((left, right) => new Date(right.date || 0) - new Date(left.date || 0));
  const sortedCodeSnippets = [...codeSnippets].sort((left, right) => new Date(right.date || 0) - new Date(left.date || 0));
  const latestRobotVersion = sortedRobotVersions[0] || null;
  const latestAttachment = sortedAttachments[0] || null;
  const latestCode = activeCommandCode || sortedCodeSnippets[0] || null;
  const linkedRoundIds = new Set(sortedAttachments.map((item) => item.roundId).filter(Boolean));
  const evidenceCount = sortedRobotVersions.filter((item) => item.image).length + sortedAttachments.filter((item) => item.image).length + sortedCodeSnippets.filter((item) => item.image).length;
  const readinessItems = [
    { label: 'Versoes registradas', ready: sortedRobotVersions.length > 0, helper: 'Mostrem o que mudou no robo.' },
    { label: 'Estrategia de missao documentada', ready: linkedRoundIds.size > 0, helper: 'Conectem garra e saida.' },
    { label: 'Uso de construcao claro', ready: sortedAttachments.length > 0 || sortedRobotVersions.length > 1, helper: 'Expliquem o recurso mecanico.' },
    { label: 'Programacao oficial definida', ready: Boolean(activeCommandCode), helper: 'Escolham um codigo base.' },
    { label: 'Evidencia visual salva', ready: evidenceCount >= 2, helper: 'Fotos e prints fortalecem a banca.' },
  ];
  const readinessScore = Math.round((readinessItems.filter((item) => item.ready).length / readinessItems.length) * 100);
  const readinessTone = readinessScore >= 80
    ? 'border-green-500/20 bg-green-500/10 text-green-200'
    : readinessScore >= 60
      ? 'border-yellow-500/20 bg-yellow-500/10 text-yellow-200'
      : 'border-red-500/20 bg-red-500/10 text-red-200';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-br from-[#111b2f] via-[#101726] to-[#0e111b] p-6 md:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.32)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.12),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.18),transparent_35%)] pointer-events-none"></div>
        <div className="relative z-10 grid gap-6 xl:grid-cols-[1.08fr,0.92fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-200">
              <Cpu size={12} /> Design do Robo
            </span>
            <h3 className="text-3xl font-black text-white mt-4 leading-tight">Dossie tecnico da temporada</h3>
            <p className="text-sm text-gray-300 mt-4 leading-relaxed max-w-3xl">
              Reunam evidencias de estrategia de missao, iteracao mecanica e uso claro de construcao e codificacao. Quando a equipe documenta bem, fica muito mais facil explicar o processo aos juizes.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <button onClick={onOpenRobot} className="inline-flex items-center gap-2 rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-xs font-bold text-blue-200 hover:bg-blue-500 hover:text-white transition-all"><GitCommit size={14} /> Nova versao</button>
              <button onClick={onOpenAttachment} className="inline-flex items-center gap-2 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-xs font-bold text-cyan-200 hover:bg-cyan-500 hover:text-black transition-all"><Wrench size={14} /> Nova garra</button>
              <button onClick={onOpenCode} className="inline-flex items-center gap-2 rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-xs font-bold text-green-200 hover:bg-green-500 hover:text-black transition-all"><Code size={14} /> Novo codigo</button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <MetricCard label="Processo tecnico" value={`${readinessScore}%`} helper={`${readinessItems.filter((item) => item.ready).length}/${readinessItems.length} blocos prontos`} />
            <MetricCard label="Iteracoes" value={iterationRecords} helper={`${sortedRobotVersions.length} versoes e ${sortedAttachments.length} anexos`} />
            <MetricCard label="Saidas apoiadas" value={rounds.length > 0 ? `${linkedRoundIds.size}/${rounds.length}` : '0'} helper={rounds.length > 0 ? 'Saidas com garra ou recurso associado' : 'Planejem rounds'} />
            <MetricCard label="Codigo oficial" value={activeCommandCode ? 'Definido' : 'Pendente'} helper={activeCommandCode ? activeCommandCode.title : 'Escolham uma base oficial'} />
          </div>
        </div>
      </section>

      <div className="grid xl:grid-cols-[1.08fr,0.92fr] gap-6">
        <div className="bg-[#151520] border border-white/10 rounded-[28px] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-gray-500 font-bold">Leitura tecnica da banca</p>
              <h3 className="text-xl font-black text-white mt-2">O que os juizes conseguem enxergar hoje</h3>
            </div>
            <span className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.18em] font-bold ${readinessTone}`}>
              {readinessScore >= 80 ? 'Pronto para explicar' : readinessScore >= 60 ? 'Bom processo tecnico' : 'Precisa documentar mais'}
            </span>
          </div>
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-blue-200 font-bold">Construcao</p>
              <p className="text-sm font-bold text-white mt-3">{latestRobotVersion ? `${latestRobotVersion.version}${latestRobotVersion.name ? ` - ${latestRobotVersion.name}` : ''}` : 'Sem versao principal'}</p>
              <p className="text-xs text-gray-200 mt-3 leading-relaxed">{latestRobotVersion ? latestRobotVersion.changes : 'Cadastrem o robo base e cada grande melhoria da temporada.'}</p>
            </div>
            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-200 font-bold">Estrategia de missao</p>
              <p className="text-sm font-bold text-white mt-3">{latestAttachment ? latestAttachment.name : 'Sem garra associada'}</p>
              <p className="text-xs text-gray-200 mt-3 leading-relaxed">{latestAttachment ? `${getRoundName(latestAttachment.roundId, rounds)}: ${latestAttachment.changes}` : 'Relacionem cada garra a uma saida para mostrar quando e por que ela existe.'}</p>
            </div>
            <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-green-200 font-bold">Codificacao</p>
              <p className="text-sm font-bold text-white mt-3">{latestCode ? latestCode.title : 'Sem codigo em destaque'}</p>
              <p className="text-xs text-gray-200 mt-3 leading-relaxed">{latestCode ? latestCode.description : 'Documentem a logica do codigo para os alunos explicarem sem depender do notebook.'}</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4 mt-6">
            {readinessItems.map((item) => (
              <div key={item.label} className={`rounded-2xl border p-4 ${item.ready ? 'border-green-500/20 bg-green-500/10' : 'border-white/10 bg-white/5'}`}>
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  {item.ready ? <CheckCircle size={14} className="text-green-400" /> : <AlertTriangle size={14} className="text-yellow-400" />}
                  {item.label}
                </div>
                <p className="text-xs text-gray-300 mt-2 leading-relaxed">{item.helper}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#151520] border border-white/10 rounded-[28px] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-gray-500 font-bold">Guia de preenchimento</p>
              <h3 className="text-xl font-black text-white mt-2">O que uma equipe forte registra aqui</h3>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.18em] font-bold text-gray-200">Leitura profissional</span>
          </div>
          <div className="space-y-4 mt-6">
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4"><p className="text-sm font-bold text-white flex items-center gap-2"><GitCommit size={14} className="text-blue-200" /> Diario do Robo</p><p className="text-xs text-gray-200 mt-3 leading-relaxed">Versao, apelido, o que mudou, por que mudou e qual teste justificou a decisao.</p></div>
            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4"><p className="text-sm font-bold text-white flex items-center gap-2"><Wrench size={14} className="text-cyan-200" /> Diario de Garras</p><p className="text-xs text-gray-200 mt-3 leading-relaxed">Nome do anexo, saida associada, missao atendida, recurso de construcao usado e evidencia visual.</p></div>
            <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-4"><p className="text-sm font-bold text-white flex items-center gap-2"><Code size={14} className="text-green-200" /> Cofre de Codigos</p><p className="text-xs text-gray-200 mt-3 leading-relaxed">Titulo, logica, quando usar, print do codigo e qual e a programacao oficial da equipe.</p></div>
            <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4"><p className="text-sm font-bold text-white flex items-center gap-2"><Sparkles size={14} className="text-yellow-200" /> O que sustenta nota 3</p><p className="text-xs text-gray-100 mt-3 leading-relaxed">Evidencias claras de estrategia de missao e uso claro de recursos de construcao ou codificacao. Conectem cada garra ou codigo a uma missao real e mostrem o teste que justificou essa escolha.</p></div>
          </div>
        </div>
      </div>

      <div className="grid xl:grid-cols-[0.95fr,0.95fr,1.1fr] gap-6">
        <div className="bg-[#151520] border border-white/10 rounded-[28px] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
          <div className="flex justify-between items-center mb-6"><div><p className="text-[10px] uppercase tracking-[0.22em] text-gray-500 font-bold">Construcao base</p><h3 className="text-lg font-black text-white flex items-center gap-2 mt-2"><GitCommit className="text-blue-500" /> Diario do Robo</h3></div><button onClick={onOpenRobot} className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-lg hover:bg-blue-500 hover:text-white font-bold transition-all">+ Versao</button></div>
          <div className="grid sm:grid-cols-3 gap-3 mb-5"><MetricCard label="Versoes" value={sortedRobotVersions.length} /><MetricCard label="Com foto" value={sortedRobotVersions.filter((item) => item.image).length} tone="border-blue-500/20 bg-blue-500/10" /><MetricCard label="Ultima" value={latestRobotVersion ? latestRobotVersion.version : 'Sem'} /></div>
          <div className="space-y-4">
            {sortedRobotVersions.map((version) => (
              <div key={version.id} onClick={() => onOpenRobotView(version)} className="bg-black/40 border border-white/5 p-4 rounded-xl relative group cursor-pointer hover:bg-white/5 transition-colors">
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button onClick={(event) => { event.stopPropagation(); onOpenRobotEdit(version); }} className="text-gray-400 hover:text-white p-1.5 bg-black/60 rounded-lg backdrop-blur-sm"><Pencil size={14} /></button>
                  {(isAdmin || version.author === viewAsStudent?.name) && <button onClick={(event) => onDeleteRobotVersion(event, version.id)} className="text-gray-400 hover:text-red-500 p-1.5 bg-black/60 rounded-lg backdrop-blur-sm"><Trash2 size={14} /></button>}
                </div>
                <div className="flex justify-between items-start gap-4 pr-6"><div><span className="inline-flex items-center rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-200">{version.version}</span><h4 className="text-white font-bold mt-3 text-sm">{version.name || 'Versao sem apelido'}</h4></div><div className="text-[10px] text-gray-500 flex items-center gap-1"><Calendar size={10} /> {formatShortDate(version.date)}</div></div>
                <p className="text-xs text-gray-300 mt-3 leading-relaxed line-clamp-4">{version.changes}</p>
                <div className="flex flex-wrap gap-2 mt-4">{version.author && <MetaChip><UserCircle size={10} /> {version.author}</MetaChip>}{version.image && <MetaChip tone="border-blue-500/20 bg-blue-500/10 text-blue-200"><ImageIcon size={10} /> Evidencia</MetaChip>}<MetaChip>{formatFullDate(version.date)}</MetaChip></div>
              </div>
            ))}
            {sortedRobotVersions.length === 0 && <EmptyState text="Nenhuma versao registrada ainda. Documentem o robo base e cada grande mudanca da temporada." />}
          </div>
        </div>

        <div className="bg-[#151520] border border-white/10 rounded-[28px] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
          <div className="flex justify-between items-center mb-6"><div><p className="text-[10px] uppercase tracking-[0.22em] text-gray-500 font-bold">Acessorios e anexos</p><h3 className="text-lg font-black text-white flex items-center gap-2 mt-2"><Wrench className="text-cyan-500" /> Diario de Garras</h3></div><button onClick={onOpenAttachment} className="text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-3 py-1.5 rounded-lg hover:bg-cyan-500 hover:text-black font-bold transition-all">+ Garra</button></div>
          <div className="grid sm:grid-cols-3 gap-3 mb-5"><MetricCard label="Anexos" value={sortedAttachments.length} /><MetricCard label="Saidas ligadas" value={linkedRoundIds.size} tone="border-cyan-500/20 bg-cyan-500/10" /><MetricCard label="Com foto" value={sortedAttachments.filter((item) => item.image).length} /></div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 mb-5"><p className="text-[10px] uppercase tracking-[0.18em] text-gray-500 font-bold">Checklist rapido</p><p className="text-xs text-gray-300 mt-3 leading-relaxed">Nome do anexo, saida associada, missao atendida, o que mudou e uma foto da solucao.</p></div>
          <div className="space-y-4">
            {sortedAttachments.map((attachment) => (
              <div key={attachment.id} onClick={() => onOpenAttachmentView(attachment)} className="bg-black/40 border border-white/5 p-4 rounded-xl relative group cursor-pointer hover:bg-white/5 transition-colors">
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button onClick={(event) => { event.stopPropagation(); onOpenAttachmentEdit(attachment); }} className="text-gray-400 hover:text-white p-1.5 bg-black/60 rounded-lg backdrop-blur-sm"><Pencil size={14} /></button>
                  {(isAdmin || attachment.author === viewAsStudent?.name) && <button onClick={(event) => onDeleteAttachment(event, attachment.id)} className="text-gray-400 hover:text-red-500 p-1.5 bg-black/60 rounded-lg backdrop-blur-sm"><Trash2 size={14} /></button>}
                </div>
                <div className="flex justify-between items-start gap-4 pr-6"><div><span className="inline-flex items-center rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200">{getRoundName(attachment.roundId, rounds)}</span><h4 className="text-white font-bold mt-3 text-sm">{attachment.name}</h4></div><div className="text-[10px] text-gray-500 flex items-center gap-1"><Calendar size={10} /> {formatShortDate(attachment.date)}</div></div>
                <p className="text-xs text-gray-300 mt-3 leading-relaxed line-clamp-4">{attachment.changes}</p>
                <div className="flex flex-wrap gap-2 mt-4">{attachment.author && <MetaChip><UserCircle size={10} /> {attachment.author}</MetaChip>}{attachment.image && <MetaChip tone="border-cyan-500/20 bg-cyan-500/10 text-cyan-200"><ImageIcon size={10} /> Foto</MetaChip>}<MetaChip>{formatFullDate(attachment.date)}</MetaChip></div>
              </div>
            ))}
            {sortedAttachments.length === 0 && <EmptyState text="Nenhuma garra cadastrada ainda. Registrem cada anexo importante e sua funcao na mesa." />}
          </div>
        </div>

        <div className="bg-[#151520] border border-white/10 rounded-[28px] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
          <div className="flex justify-between items-center mb-6"><div><p className="text-[10px] uppercase tracking-[0.22em] text-gray-500 font-bold">Codificacao e testes</p><h3 className="text-lg font-black text-white flex items-center gap-2 mt-2"><Code className="text-green-500" /> Cofre de Codigos</h3></div><button onClick={onOpenCode} className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1.5 rounded-lg hover:bg-green-500 hover:text-black font-bold transition-all">+ Codigo</button></div>
          <div className={`mb-5 rounded-2xl border p-4 ${activeCommandCode ? 'bg-green-500/10 border-green-500/20' : 'bg-black/30 border-white/10'}`}><div className="flex items-start justify-between gap-3 flex-wrap"><div><p className={`text-[10px] uppercase tracking-[0.2em] font-bold ${activeCommandCode ? 'text-green-300' : 'text-gray-500'}`}>Programacao ativa</p><p className="text-sm font-bold text-white mt-2">{activeCommandCode ? activeCommandCode.title : 'Nenhuma programacao oficial definida'}</p><p className="text-xs text-gray-300 mt-2 leading-relaxed">{activeCommandCode ? activeCommandCode.description : 'Escolham um codigo base para treinar a equipe inteira na mesma referencia.'}</p></div><div className={`px-3 py-1 rounded-full text-[10px] font-bold border ${activeCommandCode ? 'bg-green-500/10 text-green-200 border-green-500/20' : 'bg-white/5 text-gray-400 border-white/10'}`}>{activeCommandCode ? 'Pronta para treino' : 'Base pendente'}</div></div></div>
          <div className="grid sm:grid-cols-3 gap-3 mb-5"><MetricCard label="Codigos" value={sortedCodeSnippets.length} /><MetricCard label="Com print" value={sortedCodeSnippets.filter((item) => item.image).length} tone="border-green-500/20 bg-green-500/10" /><MetricCard label="Oficial" value={activeCommandCode ? 'Sim' : 'Nao'} helper={activeCommandCode ? activeCommandCode.title : 'Escolha uma base'} /></div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 mb-5"><p className="text-[10px] uppercase tracking-[0.18em] text-gray-500 font-bold">Checklist rapido</p><p className="text-xs text-gray-300 mt-3 leading-relaxed">Titulo facil de lembrar, explicacao objetiva, print do codigo e quando essa programacao entra na partida.</p></div>
          <div className="space-y-4">
            {sortedCodeSnippets.map((code) => (
              <div key={code.id} onClick={() => onOpenCodeView(code)} className={`border p-4 rounded-xl relative transition-colors group cursor-pointer ${code.applied ? 'bg-green-500/10 border-green-500/30 hover:bg-green-500/15' : 'bg-black/40 border-white/5 hover:bg-white/5'}`}>
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button onClick={(event) => { event.stopPropagation(); onOpenCodeEdit(code); }} className="text-gray-400 hover:text-white p-1.5 bg-black/60 rounded-lg backdrop-blur-sm"><Pencil size={14} /></button>
                  {isAdmin && !code.applied && <button onClick={(event) => { event.stopPropagation(); onApplyCode(code); }} className="text-green-300 hover:text-white p-1.5 bg-green-500/20 rounded-lg backdrop-blur-sm" title="Aplicar nova programacao"><Laptop size={14} /></button>}
                  {(isAdmin || code.author === viewAsStudent?.name) && <button onClick={(event) => onDeleteCode(event, code.id)} className="text-gray-400 hover:text-red-500 p-1.5 bg-black/60 rounded-lg backdrop-blur-sm"><Trash2 size={14} /></button>}
                </div>
                <div className="flex justify-between items-start gap-4 pr-6"><div><p className="text-white font-bold text-sm">{code.title}</p><p className="text-[10px] text-gray-500 mt-2 flex items-center gap-1"><Calendar size={10} /> {formatFullDate(code.date)}</p></div>{code.applied && <span className="rounded-full border border-green-500/20 bg-green-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-green-200">Oficial</span>}</div>
                <p className="text-xs text-gray-300 mt-3 leading-relaxed line-clamp-4">{code.description}</p>
                <div className="flex flex-wrap gap-2 mt-4">{code.author && <MetaChip><UserCircle size={10} /> {code.author}</MetaChip>}{code.image && <MetaChip tone="border-green-500/20 bg-green-500/10 text-green-200"><ImageIcon size={10} /> Print</MetaChip>}</div>
              </div>
            ))}
            {sortedCodeSnippets.length === 0 && <EmptyState text="Nenhum codigo documentado ainda. Salvem a base tecnica para a equipe consultar sem depender do PC." />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RobotDesignStrategyPanel;
