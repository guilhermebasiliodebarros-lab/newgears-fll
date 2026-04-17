import { addDoc, collection, deleteDoc, doc, setDoc, updateDoc } from 'firebase/firestore';

import { PROJECT_MAIN_DOC_ID } from '../utils/projectSummary';
import { normalizeEventTypeValue } from '../utils/agenda';

const normalizeWorkspaceAuthor = (author) => {
  const safeAuthor = (author || '').toString().trim();
  if (!safeAuthor || safeAuthor.includes('Ã')) return '';
  return safeAuthor;
};

const resolveWorkspaceAuthor = ({ author, isAdmin = false, studentName }) =>
  normalizeWorkspaceAuthor(author) || (isAdmin ? 'Tecnico' : studentName || 'Equipe');

export const createKanbanTaskRecord = async ({
  db,
  text,
  dueDate = '',
  tag = 'geral',
  priority = 'normal',
  author,
  isAdmin = false,
  studentName,
  extraData = {}
}) =>
  addDoc(collection(db, 'tasks'), {
    text,
    status: 'todo',
    createdAt: new Date().toISOString(),
    author: resolveWorkspaceAuthor({ author, isAdmin, studentName }),
    dueDate,
    tag,
    priority,
    ...extraData
  });

export const saveAttachmentRecord = async ({ db, attachmentId, attachmentData }) => {
  if (attachmentId) {
    await updateDoc(doc(db, 'attachments', attachmentId), attachmentData);
    return attachmentId;
  }

  const ref = await addDoc(collection(db, 'attachments'), attachmentData);
  return ref.id;
};

export const deleteAttachmentRecord = ({ db, attachmentId }) =>
  deleteDoc(doc(db, 'attachments', attachmentId));

export const saveCodeSnippetRecord = async ({
  db,
  snippetId,
  codeData,
  shouldSetAsOfficial = false,
  existingSnippetIds = []
}) => {
  let resolvedSnippetId = snippetId;

  if (snippetId) {
    await updateDoc(doc(db, 'codeSnippets', snippetId), codeData);
  } else {
    const ref = await addDoc(collection(db, 'codeSnippets'), {
      ...codeData,
      applied: false
    });
    resolvedSnippetId = ref.id;
  }

  if (shouldSetAsOfficial) {
    const updates = existingSnippetIds.map((id) =>
      updateDoc(doc(db, 'codeSnippets', id), { applied: id === resolvedSnippetId })
    );
    await Promise.all(updates);
  }

  return resolvedSnippetId;
};

export const deleteCodeSnippetRecord = ({ db, snippetId }) =>
  deleteDoc(doc(db, 'codeSnippets', snippetId));

export const applyOfficialCodeSnippet = ({ db, snippetIds, activeSnippetId }) =>
  Promise.all(
    snippetIds.map((id) => updateDoc(doc(db, 'codeSnippets', id), { applied: id === activeSnippetId }))
  );

export const saveProjectSummaryRecord = async ({ db, projectData }) => {
  await setDoc(doc(db, 'project', PROJECT_MAIN_DOC_ID), projectData, { merge: true });
  return { ...projectData, id: PROJECT_MAIN_DOC_ID };
};

export const saveAgendaEventRecord = async ({ db, eventId, eventData, isAdmin = false, studentName }) => {
  const payload = {
    ...eventData,
    author: resolveWorkspaceAuthor({ author: eventData.author, isAdmin, studentName }),
    type: normalizeEventTypeValue(eventData.type)
  };

  if (eventId) {
    await updateDoc(doc(db, 'events', eventId), payload);
    return eventId;
  }

  const ref = await addDoc(collection(db, 'events'), payload);
  return ref.id;
};

export const deleteAgendaEventRecord = ({ db, eventId }) =>
  deleteDoc(doc(db, 'events', eventId));

export const updateAgendaEventStatusRecord = ({ db, eventId, status }) =>
  updateDoc(doc(db, 'events', eventId), { status });

export const saveAdminProfileRecord = ({ db, profileData }) =>
  setDoc(doc(db, 'settings', 'admin_profile'), profileData, { merge: true });

export const savePracticeScoreRecord = async ({
  db,
  score,
  time,
  author,
  isAdmin = false,
  studentName,
  extraData = {}
}) =>
  addDoc(collection(db, 'score_history'), {
    score,
    time,
    date: new Date().toISOString(),
    author: resolveWorkspaceAuthor({ author, isAdmin, studentName }),
    ...extraData
  });

export const saveRoundRunRecord = async ({
  db,
  roundId,
  roundName,
  time,
  author,
  isAdmin = false,
  studentName,
  extraData = {}
}) => {
  const ref = await addDoc(collection(db, 'score_history'), {
    roundId,
    roundName,
    time,
    date: new Date().toISOString(),
    author: resolveWorkspaceAuthor({ author, isAdmin, studentName }),
    ...extraData
  });

  await updateDoc(doc(db, 'rounds', roundId), {
    estimatedTime: time
  });

  return ref.id;
};
