import assert from 'node:assert/strict';
import { clearSubmittedDraft, formDraftKey, readFormDraft, writeFormDraft } from '../src/utils/formDrafts.js';
import { createDraftRecord } from '../src/services/draftRecords.js';
import { memoryStore } from './teamProcesses.test.js';

export async function runFormDraftTests() {
  const records = new Map();
  const storage = { getItem: (key) => records.get(key) || null, setItem: (key, value) => records.set(key, value), removeItem: (key) => records.delete(key) };
  const key = formDraftKey('Mariana:season-1', 'expert');
  assert.notEqual(key, formDraftKey('Livia:season-1', 'expert'));
  assert.notEqual(key, formDraftKey('Mariana:season-2', 'expert'));
  assert.notEqual(key, formDraftKey('Mariana:season-1', 'expert', 'editing-id'));
  assert.equal(readFormDraft(storage, key), null);
  records.set(key, '{broken'); assert.equal(readFormDraft(storage, key), null);
  const first = { version: 1, requestId: 'persistent-id', revision: 1, fields: [{ name: 'notes', value: 'Aprendizado importante.' }] };
  assert.equal(writeFormDraft(storage, key, first), true);
  assert.deepEqual(readFormDraft(storage, key), first);
  assert.equal(writeFormDraft({ setItem: () => { throw Error('Storage quota'); } }, key, first), false);
  writeFormDraft(storage, key, { ...first, revision: 2 });
  assert.equal(clearSubmittedDraft(storage, key, first), false, 'Saving an old submission cannot remove text edited while awaiting confirmation');
  assert.equal(clearSubmittedDraft(storage, key, { ...first, revision: 2 }), true);
  const memory = memoryStore({});
  const context = { db: {}, path: ['codeSnippets'], draftId: 'persistent-id', store: memory.store };
  await createDraftRecord({ ...context, data: { title: 'Primeiro texto', createdByStudentId: 'a', image: 'saved-photo', applied: true } });
  await createDraftRecord({ ...context, data: { title: 'Texto recuperado e melhorado', createdByStudentId: 'a', image: null, applied: false } });
  assert.equal(memory.records.size, 1, 'Retrying a draft uses the same source document');
  assert.equal(memory.records.get('codeSnippets/persistent-id').title, 'Texto recuperado e melhorado');
  assert.equal(memory.records.get('codeSnippets/persistent-id').image, 'saved-photo');
  assert.equal(memory.records.get('codeSnippets/persistent-id').applied, true);
  await assert.rejects(createDraftRecord({ ...context, data: { title: 'Outra pessoa', createdByStudentId: 'b' } }), /outro aluno/);
  const before = structuredClone([...memory.records]);
  const failing = { ...memory.store, runTransaction: (db, action) => memory.store.runTransaction(db, async (transaction) => { await action(transaction); throw Error('Lost connection'); }) };
  await assert.rejects(createDraftRecord({ ...context, store: failing, data: { title: 'Falha', createdByStudentId: 'a' } }), /Lost connection/);
  assert.deepEqual([...memory.records], before);
}
