import { auth } from '../firebase';

const baseUrl = (import.meta.env.VITE_REPORTS_API_BASE || '/api/reports').replace(/\/$/, '');

async function authorization() {
  if (!auth.currentUser) throw new Error('Entre novamente para acessar os relatórios.');
  return `Bearer ${await auth.currentUser.getIdToken()}`;
}

async function api(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, { ...options, headers: { Authorization: await authorization(), ...options.headers } });
  let data;
  try { data = await response.json(); }
  catch { throw new Error('A API de relatórios não está disponível. O técnico precisa conferir a configuração do servidor.'); }
  if (!response.ok) throw new Error(data.error || 'Não foi possível concluir a operação.');
  return data;
}

export const loadReportsSession = () => api('/session');
export const deleteWeeklyReport = (id) => api(`/${encodeURIComponent(id)}`, { method: 'DELETE' });
export const notifyWeeklyReport = (id) => api(`/${encodeURIComponent(id)}/notify`, { method: 'POST' });
export const markWeeklyReportRead = (id) => api(`/${encodeURIComponent(id)}/read`, { method: 'POST' });
export const getWeeklyReportFile = (id, download = false) => api(`/${encodeURIComponent(id)}/file${download ? '?download=1' : ''}`);

export async function saveWeeklyReport({ id, details, file, onProgress = () => {} }) {
  const token = await authorization();
  const form = new FormData();
  Object.entries(details).forEach(([key, value]) => form.append(key, value));
  if (file) form.append('file', file);
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(id ? 'PATCH' : 'POST', `${baseUrl}${id ? `/${encodeURIComponent(id)}` : ''}`);
    xhr.timeout = 120000;
    xhr.setRequestHeader('Authorization', token);
    xhr.upload.onprogress = (event) => { if (event.lengthComputable) onProgress(Math.min(99, Math.round(event.loaded / event.total * 100))); };
    xhr.onerror = () => reject(new Error('Falha de conexão. Confira a internet e tente novamente.'));
    xhr.ontimeout = () => reject(new Error('O envio demorou demais. Confira a listagem antes de tentar novamente.'));
    xhr.onabort = () => reject(new Error('Envio cancelado.'));
    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status < 200 || xhr.status >= 300) { reject(new Error(data.error || 'Erro ao salvar o relatório.')); return; }
        onProgress(100);
        resolve(data);
      } catch { reject(new Error('A API de relatórios não está disponível. Peça ao técnico para conferir a configuração.')); }
    };
    xhr.send(form);
  });
}

export const saveReportRecipient = (recipient) => api(`/recipients${recipient.id ? `/${encodeURIComponent(recipient.id)}` : ''}`, {
  method: recipient.id ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(recipient),
});
export const deleteReportRecipient = (id) => api(`/recipients/${encodeURIComponent(id)}`, { method: 'DELETE' });
