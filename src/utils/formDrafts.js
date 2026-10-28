export const formDraftKey = (scope, kind, recordId = 'new') => `newgears_form_draft_v1:${JSON.stringify([scope, kind, String(recordId || 'new')])}`;
export function readFormDraft(storage, key) {
  try {
    const value = JSON.parse(storage.getItem(key));
    return value?.version === 1 && typeof value.requestId === 'string' && Array.isArray(value.fields) ? value : null;
  } catch { return null; }
}
export function writeFormDraft(storage, key, value) {
  try { storage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
}
export function clearSubmittedDraft(storage, key, submitted) {
  const current = readFormDraft(storage, key);
  if (current && current.requestId === submitted.requestId && current.revision === submitted.revision) {
    storage.removeItem(key);
    return true;
  }
  return false;
}

const eligible = (element) => element.name && /^(INPUT|TEXTAREA|SELECT)$/.test(element.tagName)
  && !['file', 'password', 'button', 'submit', 'reset'].includes(element.type)
  && !/password|senha|token|secret/i.test(element.name);

export function captureDraftFields(form) {
  const fields = [];
  const seen = new Map();
  for (const element of form.elements) {
    if (!eligible(element)) continue;
    const index = seen.get(element.name) || 0;
    seen.set(element.name, index + 1);
    fields.push({ name: element.name, index, type: element.type, value: ['checkbox', 'radio'].includes(element.type) ? element.checked : element.multiple ? [...element.selectedOptions].map((option) => option.value) : element.value });
  }
  return fields;
}

export function restoreDraftFields(form, fields) {
  for (const field of fields) {
    const element = [...form.elements].filter((item) => eligible(item) && item.name === field.name)[field.index];
    if (!element || element.type !== field.type) continue;
    if (['checkbox', 'radio'].includes(element.type)) {
      if (element.checked !== field.value && (element.type === 'checkbox' || field.value)) element.click();
      continue;
    }
    if (element.multiple && Array.isArray(field.value)) {
      for (const option of element.options) option.selected = field.value.includes(option.value);
    } else {
      // Use the native setter so React's controlled inputs also receive the edit.
      const prototype = element.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : element.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(prototype, 'value').set.call(element, field.value);
    }
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }
}
