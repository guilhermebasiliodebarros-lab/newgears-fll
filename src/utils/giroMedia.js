export const GIRO_IMAGE_MAX_BYTES = 1024 * 1024;
export const GIRO_REQUEST_MAX_BYTES = 3 * 1024 * 1024;
export const GIRO_AUDIO_MAX_SECONDS = 60;

// Embedded images only: the server never downloads URLs supplied by the client.
export function validateGiroImages(input = []) {
  if (!Array.isArray(input) || input.length > 2) throw new Error('Envie até duas fotos por pergunta.');
  return input.map((item) => {
    if (item?.kind !== 'image' || typeof item.dataURL !== 'string' || item.dataURL.length > Math.ceil(GIRO_IMAGE_MAX_BYTES / 3) * 4 + 40) throw new Error('Cada foto deve ter até 1 MB após a preparação.');
    const match = /^data:image\/(jpeg|png);base64,([A-Za-z0-9+/]+={0,2})$/.exec(item.dataURL);
    if (!match || match[2].length % 4) throw new Error('Selecione uma foto JPEG ou PNG válida.');
    const size = match[2].length / 4 * 3 - (match[2].endsWith('==') ? 2 : match[2].endsWith('=') ? 1 : 0);
    const header = atob(match[2].slice(0, 16));
    if (!size || size > GIRO_IMAGE_MAX_BYTES || !(match[1] === 'jpeg' ? header.startsWith('\xff\xd8\xff') : header.startsWith('\x89PNG\r\n\x1a\n'))) throw new Error('O conteúdo da foto não corresponde ao formato informado.');
    return { kind: 'image', name: String(item.name || 'Foto').slice(0, 120), dataURL: item.dataURL };
  });
}

export async function prepareGiroImage(file) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file?.type) || !file.size || file.size > 10 * 1024 * 1024) throw new Error('Selecione uma foto JPG, PNG ou WebP de até 10 MB.');
  const bitmap = await createImageBitmap(file);
  try {
    if (bitmap.width * bitmap.height > 24000000) throw new Error('Escolha uma foto de até 24 megapixels.');
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale)); canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Não foi possível preparar a foto neste navegador.');
    context.fillStyle = '#fff'; context.fillRect(0, 0, canvas.width, canvas.height); context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    let dataURL = canvas.toDataURL('image/jpeg', 0.85);
    if (dataURL.length > GIRO_IMAGE_MAX_BYTES * 4 / 3) dataURL = canvas.toDataURL('image/jpeg', 0.6);
    return validateGiroImages([{ kind: 'image', name: file.name, dataURL }])[0];
  } finally { bitmap.close(); }
}

export function mixGiroAudio(channels, inputRate, outputRate = 16000) {
  if (!channels.length || !Number.isFinite(inputRate) || inputRate < 8000 || !channels[0].length || channels.some((channel) => channel.length !== channels[0].length)) throw new Error('O áudio não contém uma faixa válida.');
  const duration = channels[0].length / inputRate;
  if (duration > GIRO_AUDIO_MAX_SECONDS + 0.1) throw new Error('Use um áudio de até 60 segundos.');
  const output = new Float32Array(Math.floor(duration * outputRate));
  for (let i = 0; i < output.length; i++) {
    const start = Math.floor(i * inputRate / outputRate);
    const end = Math.min(channels[0].length, Math.max(start + 1, Math.floor((i + 1) * inputRate / outputRate)));
    let value = 0;
    for (const channel of channels) for (let sample = start; sample < end; sample++) value += channel[sample];
    output[i] = Math.max(-1, Math.min(1, value / ((end - start) * channels.length)));
  }
  return output;
}
