import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  Camera,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  GripVertical,
  Image as ImageIcon,
  Link,
  Loader2,
  MonitorPlay,
  QrCode,
  Save,
  ShieldCheck,
  Star,
  Trash2,
  Upload,
} from 'lucide-react';
import PublicQrCodes from '../components/PublicQrCodes';
import { buildTrainingGallery, resolvePublicShowcaseSettings } from '../utils/publicShowcase';

const MAX_IMAGE_DATA_URL_LENGTH = 880000;

const getToday = () => new Date().toISOString().slice(0, 10);

const resizeImageFile = (file) => new Promise((resolve, reject) => {
  if (!file?.type?.startsWith('image/')) {
    reject(new Error('Escolha uma imagem valida.'));
    return;
  }

  const sourceUrl = URL.createObjectURL(file);
  const image = new Image();

  image.onload = () => {
    const maxDimension = 1500;
    const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));

    const context = canvas.getContext('2d');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.78);
    URL.revokeObjectURL(sourceUrl);

    if (dataUrl.length > MAX_IMAGE_DATA_URL_LENGTH) {
      reject(new Error('A foto ficou muito pesada. Escolha uma imagem menor.'));
      return;
    }

    resolve(dataUrl);
  };

  image.onerror = () => {
    URL.revokeObjectURL(sourceUrl);
    reject(new Error('Nao foi possivel processar esta imagem.'));
  };

  image.src = sourceUrl;
});

export default function PublicShowcaseAdminView({
  settings,
  galleryPhotos,
  robotVersions,
  attachments,
  onSaveSettings,
  onAddPhoto,
  onTogglePhoto,
  onToggleFeatured,
  onMovePhoto,
  onReorderPhotos,
  onDeletePhoto,
  onOpenTvMode,
}) {
  const [draftSettings, setDraftSettings] = useState(() => resolvePublicShowcaseSettings(settings));
  const [uploadDraft, setUploadDraft] = useState({ title: '', detail: '', date: getToday(), file: null });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [busyPhotoId, setBusyPhotoId] = useState('');
  const [draggedPhotoId, setDraggedPhotoId] = useState('');
  const [dragOverPhotoId, setDragOverPhotoId] = useState('');
  const [previewOrderIds, setPreviewOrderIds] = useState([]);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    setDraftSettings(resolvePublicShowcaseSettings(settings));
  }, [settings]);

  const basePhotos = useMemo(
    () => buildTrainingGallery({ galleryPhotos, robotVersions, attachments, includeHidden: true, prioritizeFeatured: false }),
    [attachments, galleryPhotos, robotVersions],
  );
  useEffect(() => {
    setPreviewOrderIds(basePhotos.map((photo) => photo.id));
  }, [basePhotos]);

  const allPhotos = useMemo(() => {
    const positions = new Map(previewOrderIds.map((id, index) => [id, index]));
    return [...basePhotos].sort((left, right) => (
      (positions.get(left.id) ?? Number.POSITIVE_INFINITY)
      - (positions.get(right.id) ?? Number.POSITIVE_INFINITY)
    ));
  }, [basePhotos, previewOrderIds]);
  const visiblePhotos = allPhotos.filter((photo) => photo.isPublic);

  const updateSetting = (field, value) => {
    setDraftSettings((currentSettings) => ({ ...currentSettings, [field]: value }));
  };

  const handleSaveSettings = async (event) => {
    event.preventDefault();
    setIsSavingSettings(true);
    try {
      await onSaveSettings(draftSettings);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleAddPhoto = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!uploadDraft.file) {
      setUploadError('Escolha uma foto do treino.');
      return;
    }

    setIsUploading(true);
    setUploadError('');
    try {
      const image = await resizeImageFile(uploadDraft.file);
      await onAddPhoto({ ...uploadDraft, image });
      setUploadDraft({ title: '', detail: '', date: getToday(), file: null });
      form.reset();
    } catch (error) {
      setUploadError(error.message || 'Nao foi possivel enviar a foto.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleTogglePhoto = async (photo) => {
    setBusyPhotoId(photo.id);
    try {
      await onTogglePhoto(photo);
    } finally {
      setBusyPhotoId('');
    }
  };

  const handleDeletePhoto = async (photo) => {
    if (!window.confirm(`Excluir a foto "${photo.title}"?`)) return;
    setBusyPhotoId(photo.id);
    try {
      await onDeletePhoto(photo);
    } finally {
      setBusyPhotoId('');
    }
  };

  const handleToggleFeaturedPhoto = async (photo) => {
    setBusyPhotoId(photo.id);
    try {
      await onToggleFeatured(photo);
    } finally {
      setBusyPhotoId('');
    }
  };

  const handleMovePhoto = async (photo, direction) => {
    setBusyPhotoId(photo.id);
    try {
      await onMovePhoto(photo, direction);
    } finally {
      setBusyPhotoId('');
    }
  };

  const handleDragStart = (event, photo) => {
    setDraggedPhotoId(photo.id);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', photo.id);
  };

  const handleDragOver = (event, photo) => {
    event.preventDefault();
    if (!draggedPhotoId || draggedPhotoId === photo.id) return;
    event.dataTransfer.dropEffect = 'move';
    setDragOverPhotoId(photo.id);
  };

  const handleDragLeave = (event, photo) => {
    if (event.currentTarget.contains(event.relatedTarget)) return;
    setDragOverPhotoId((currentId) => currentId === photo.id ? '' : currentId);
  };

  const handleDragEnd = () => {
    setDraggedPhotoId('');
    setDragOverPhotoId('');
  };

  const handleDrop = async (event, targetPhoto) => {
    event.preventDefault();
    const sourcePhotoId = event.dataTransfer.getData('text/plain') || draggedPhotoId;
    handleDragEnd();
    if (!sourcePhotoId || sourcePhotoId === targetPhoto.id) return;

    const sourceIndex = allPhotos.findIndex((photo) => photo.id === sourcePhotoId);
    const targetIndex = allPhotos.findIndex((photo) => photo.id === targetPhoto.id);
    if (sourceIndex < 0 || targetIndex < 0) return;

    const nextPhotoIds = allPhotos.map((photo) => photo.id);
    const [movedPhotoId] = nextPhotoIds.splice(sourceIndex, 1);
    nextPhotoIds.splice(targetIndex, 0, movedPhotoId);
    setPreviewOrderIds(nextPhotoIds);
    setBusyPhotoId(sourcePhotoId);

    try {
      await onReorderPhotos(sourcePhotoId, targetPhoto.id);
    } catch {
      setPreviewOrderIds(basePhotos.map((photo) => photo.id));
    } finally {
      setBusyPhotoId('');
    }
  };

  return (
    <div className="space-y-5">
      <section className="newgears-major-panel border border-white/10 bg-[#121722] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.24)] md:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-yellow-200/80">
              <MonitorPlay size={14} /> Vitrine publica
            </p>
            <h2 className="mt-3 text-3xl font-black text-white">Curadoria da TV da escola</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Organize os registros visiveis, o proximo torneio e os acessos publicos da equipe.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenTvMode}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-yellow-300/25 bg-yellow-300/10 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-yellow-100 hover:bg-yellow-300 hover:text-slate-950"
          >
            <MonitorPlay size={16} /> Abrir modo TV
          </button>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
        <form onSubmit={handleSaveSettings} className="border border-white/10 bg-[#101520] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.2)] md:p-6">
          <div className="flex items-center gap-3">
            <CalendarDays size={20} className="text-yellow-200" />
            <h3 className="text-xl font-black text-white">Torneio e links publicos</h3>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Nome do proximo torneio</span>
              <input
                value={draftSettings.tournamentName}
                onChange={(event) => updateSetting('tournamentName', event.target.value)}
                className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-yellow-300/50"
                placeholder="Ex: Regional FLL Curitiba"
              />
            </label>

            <label className="sm:col-span-2">
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Data e horario</span>
              <input
                type="datetime-local"
                value={draftSettings.tournamentTarget}
                onChange={(event) => updateSetting('tournamentTarget', event.target.value)}
                className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-yellow-300/50"
              />
            </label>

            <label className="sm:col-span-2">
              <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                <Link size={12} /> Link do projeto de inovacao
              </span>
              <input
                type="url"
                value={draftSettings.innovationUrl}
                onChange={(event) => updateSetting('innovationUrl', event.target.value)}
                className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-yellow-300/50"
                placeholder="https://..."
              />
            </label>

            <label>
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Nome das redes</span>
              <input
                value={draftSettings.socialLabel}
                onChange={(event) => updateSetting('socialLabel', event.target.value)}
                className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-yellow-300/50"
                placeholder="Instagram da equipe"
              />
            </label>

            <label>
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Link das redes</span>
              <input
                type="url"
                value={draftSettings.socialUrl}
                onChange={(event) => updateSetting('socialUrl', event.target.value)}
                className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-yellow-300/50"
                placeholder="https://..."
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={isSavingSettings}
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-yellow-300/25 bg-yellow-300/10 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-yellow-100 hover:bg-yellow-300 hover:text-slate-950 disabled:cursor-wait disabled:opacity-60"
          >
            {isSavingSettings ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Salvar vitrine
          </button>
        </form>

        <section className="border border-white/10 bg-[#101520] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.2)] md:p-6">
          <div className="flex items-center gap-3">
            <QrCode size={20} className="text-yellow-200" />
            <h3 className="text-xl font-black text-white">QR Codes da equipe</h3>
          </div>
          <div className="mt-5">
            <PublicQrCodes settings={draftSettings} compact />
          </div>
        </section>
      </div>

      <section className="border border-white/10 bg-[#101520] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.2)] md:p-6">
        <div className="flex items-center gap-3">
          <Upload size={20} className="text-cyan-200" />
          <h3 className="text-xl font-black text-white">Adicionar foto do treino</h3>
        </div>

        <form onSubmit={handleAddPhoto} className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px_220px_auto] lg:items-end">
          <label>
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Titulo</span>
            <input
              required
              value={uploadDraft.title}
              onChange={(event) => setUploadDraft((current) => ({ ...current, title: event.target.value }))}
              className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-cyan-300/50"
              placeholder="Ex: Teste da garra frontal"
            />
          </label>

          <label>
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Data</span>
            <input
              type="date"
              required
              value={uploadDraft.date}
              onChange={(event) => setUploadDraft((current) => ({ ...current, date: event.target.value }))}
              className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-cyan-300/50"
            />
          </label>

          <label>
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Imagem</span>
            <input
              type="file"
              accept="image/*"
              required
              onChange={(event) => setUploadDraft((current) => ({ ...current, file: event.target.files?.[0] || null }))}
              className="mt-2 block w-full text-xs text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-300/10 file:px-3 file:py-3 file:text-xs file:font-black file:uppercase file:tracking-[0.12em] file:text-cyan-100 hover:file:bg-cyan-300 hover:file:text-slate-950"
            />
          </label>

          <button
            type="submit"
            disabled={isUploading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-300/25 bg-cyan-300/10 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-cyan-100 hover:bg-cyan-300 hover:text-slate-950 disabled:cursor-wait disabled:opacity-60"
          >
            {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            Enviar
          </button>
        </form>

        <label className="mt-4 block">
          <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Legenda opcional</span>
          <input
            value={uploadDraft.detail}
            onChange={(event) => setUploadDraft((current) => ({ ...current, detail: event.target.value }))}
            className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-cyan-300/50"
            placeholder="Ex: Ajuste de estabilidade antes dos rounds oficiais"
          />
        </label>

        {uploadError && <p className="mt-3 text-sm font-bold text-red-300">{uploadError}</p>}
      </section>

      <section className="border border-white/10 bg-[#101520] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.2)] md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200/75">
              <ShieldCheck size={14} /> Curadoria
            </p>
            <h3 className="mt-3 text-xl font-black text-white">Fotos da vitrine</h3>
          </div>
          <p className="flex items-center gap-2 text-sm font-black text-cyan-100">
            <Camera size={17} /> {visiblePhotos.length}/{allPhotos.length} visiveis
          </p>
        </div>

        {allPhotos.length > 0 ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {allPhotos.map((photo) => {
              const isDragging = draggedPhotoId === photo.id;
              const isDropTarget = dragOverPhotoId === photo.id && !isDragging;

              return (
              <article
                key={photo.id}
                onDragOver={(event) => handleDragOver(event, photo)}
                onDragLeave={(event) => handleDragLeave(event, photo)}
                onDrop={(event) => handleDrop(event, photo)}
                className={`overflow-hidden rounded-lg border shadow-lg transition-all ${isDropTarget ? 'ring-2 ring-yellow-300/80 ring-offset-2 ring-offset-[#101520]' : ''} ${isDragging ? 'scale-[0.98] opacity-45' : ''} ${photo.isFeatured ? 'border-yellow-300/50 bg-[#111827]' : photo.isPublic ? 'border-cyan-300/20 bg-[#111827]' : 'border-white/10 bg-[#111827] opacity-60'}`}
              >
                <div className="relative aspect-[4/3]">
                  <img src={photo.image} alt={photo.title} className="h-full w-full object-cover" />
                  <span className="absolute left-2 top-2 rounded-lg border border-white/10 bg-black/65 px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-white">
                    {photo.type}
                  </span>
                  {photo.isFeatured && (
                    <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-lg border border-yellow-300/30 bg-yellow-300/90 px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-slate-950">
                      <Star size={11} fill="currentColor" /> Destaque
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="min-w-0 flex-1 truncate text-sm font-black text-white">{photo.title}</h4>
                    <span
                      role="button"
                      tabIndex={0}
                      draggable
                      onDragStart={(event) => handleDragStart(event, photo)}
                      onDragEnd={handleDragEnd}
                      title="Arrastar para ordenar"
                      aria-label={`Arrastar ${photo.title} para ordenar`}
                      className="inline-flex h-7 w-7 shrink-0 cursor-grab items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white active:cursor-grabbing"
                    >
                      <GripVertical size={15} />
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] font-bold text-slate-400">{photo.date || 'Sem data'}</p>
                  <div className="mt-3 grid grid-cols-[auto_auto_minmax(0,1fr)] gap-2">
                    <button
                      type="button"
                      onClick={() => handleMovePhoto(photo, -1)}
                      disabled={busyPhotoId === photo.id || allPhotos[0]?.id === photo.id}
                      title="Mover foto para cima"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      <ChevronUp size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMovePhoto(photo, 1)}
                      disabled={busyPhotoId === photo.id || allPhotos[allPhotos.length - 1]?.id === photo.id}
                      title="Mover foto para baixo"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      <ChevronDown size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleFeaturedPhoto(photo)}
                      disabled={busyPhotoId === photo.id}
                      title={photo.isFeatured ? 'Remover destaque' : 'Marcar como destaque'}
                      className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-[10px] font-black uppercase tracking-[0.1em] disabled:cursor-wait ${photo.isFeatured ? 'border-yellow-300/35 bg-yellow-300/15 text-yellow-100 hover:bg-yellow-300 hover:text-slate-950' : 'border-white/10 bg-white/5 text-white hover:bg-white/10'}`}
                    >
                      <Star size={14} fill={photo.isFeatured ? 'currentColor' : 'none'} />
                      {photo.isFeatured ? 'Destaque' : 'Destacar'}
                    </button>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleTogglePhoto(photo)}
                      disabled={busyPhotoId === photo.id}
                      title={photo.isPublic ? 'Ocultar da vitrine' : 'Exibir na vitrine'}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-white hover:bg-white/10 disabled:cursor-wait"
                    >
                      {busyPhotoId === photo.id ? <Loader2 size={14} className="animate-spin" /> : photo.isPublic ? <Eye size={14} /> : <EyeOff size={14} />}
                      {photo.isPublic ? 'Visivel' : 'Oculta'}
                    </button>
                    {photo.canDelete && (
                      <button
                        type="button"
                        onClick={() => handleDeletePhoto(photo)}
                        disabled={busyPhotoId === photo.id}
                        title="Excluir foto"
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-red-400/15 bg-red-400/10 text-red-200 hover:bg-red-400 hover:text-white disabled:cursor-wait"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-5 rounded-lg border border-dashed border-white/15 bg-white/5 p-8 text-center">
            <ImageIcon size={32} className="mx-auto text-slate-500" />
            <p className="mt-3 text-sm font-bold text-slate-300">Nenhuma foto cadastrada ainda.</p>
          </div>
        )}
      </section>
    </div>
  );
}
