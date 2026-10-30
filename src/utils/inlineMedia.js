export const INLINE_MEDIA_LIMIT = 680000;

export function validateInlineFile(file, { allowPdf = false } = {}) {
  const image = ['image/jpeg', 'image/png', 'image/webp'].includes(file?.type);
  const pdf = allowPdf && file?.type === 'application/pdf';
  if (!image && !pdf) throw Error(allowPdf ? 'Selecione uma foto JPG, PNG, WebP ou um PDF.' : 'Selecione uma foto JPG, PNG ou WebP.');
  if (!file.size || file.size > (pdf ? 500 * 1024 : 10 * 1024 * 1024)) throw Error(pdf ? 'O PDF deve ter até 500 KB.' : 'A foto deve ter até 10 MB.');
  return image ? 'image' : 'pdf';
}

export async function readInlineMedia(file, options) {
  const kind = validateInlineFile(file, options);
  if (kind === 'pdf' && !(await file.slice(0, 5).text()).startsWith('%PDF-')) throw Error('O arquivo não é um PDF válido.');
  const raw = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(Error('Não foi possível ler o arquivo.'));
    reader.onabort = () => reject(Error('Leitura do arquivo cancelada.'));
    reader.readAsDataURL(file);
  });
  if (kind === 'pdf') {
    if (raw.length > INLINE_MEDIA_LIMIT) throw Error('O PDF ultrapassa o limite para este anexo.');
    return raw;
  }
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onerror = () => reject(Error('Não foi possível abrir esta foto.'));
    image.onload = () => {
      try {
        if (!image.naturalWidth || !image.naturalHeight) throw Error('Foto inválida.');
        if (raw.length <= INLINE_MEDIA_LIMIT && Math.max(image.naturalWidth, image.naturalHeight) <= 1600) { resolve(raw); return; }
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) throw Error('Este navegador não conseguiu preparar a foto.');
        let scale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));
        for (let attempt = 0; attempt < 12; attempt++) {
          canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
          canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
          context.fillStyle = '#fff'; context.fillRect(0, 0, canvas.width, canvas.height);
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          const result = canvas.toDataURL('image/jpeg', 0.85 - (attempt % 3) * 0.15);
          if (result.startsWith('data:image/jpeg;') && result.length <= INLINE_MEDIA_LIMIT) { resolve(result); return; }
          if (attempt % 3 === 2) scale *= 0.75;
        }
        throw Error('Não foi possível compactar a foto. Escolha uma imagem menor.');
      } catch (error) { reject(error); }
    };
    image.src = raw;
  });
}
