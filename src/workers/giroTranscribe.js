/* global __GIRO_VOICE_WASM_URL__ */
import { env, pipeline } from '@huggingface/transformers';

env.allowLocalModels = false;
env.backends.onnx.wasm.numThreads = 1;
env.backends.onnx.wasm.wasmPaths = { wasm: __GIRO_VOICE_WASM_URL__ };
let transcriber;
let running = false;
const downloads = new Map();
let lastProgressAt = 0;
self.onmessage = async ({ data }) => {
  if (running || !(data?.audio instanceof Float32Array)) return;
  running = true;
  try {
    transcriber ??= await pipeline('automatic-speech-recognition', 'onnx-community/whisper-tiny', { device: 'wasm', dtype: 'q8', progress_callback: (progress) => {
      if (progress.status === 'progress') {
        downloads.set(progress.file, progress.loaded || 0);
        if (Date.now() - lastProgressAt > 250) {
          lastProgressAt = Date.now();
          const megabytes = [...downloads.values()].reduce((sum, bytes) => sum + bytes, 0) / 1024 / 1024;
          self.postMessage({ type: 'progress', text: `Preparando recurso de voz… ${megabytes.toFixed(1)} MB carregados` });
        }
      }
    } });
    self.postMessage({ type: 'progress', text: 'Transcrevendo o áudio neste dispositivo…' });
    const result = await transcriber(data.audio, { language: 'portuguese', task: 'transcribe', chunk_length_s: 25, stride_length_s: 5, return_timestamps: false });
    self.postMessage({ type: 'complete', text: result.text.trim() });
  } catch (error) {
    console.warn('Giro: falha ao preparar a transcrição.', error?.stack || error?.message);
    transcriber = undefined;
    self.postMessage({ type: 'error', text: 'Não foi possível transcrever. Confira a conexão para baixar o recurso de voz ou tente um áudio mais curto.' });
  } finally { running = false; }
};
