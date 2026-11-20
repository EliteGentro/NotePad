import { useCallback, useEffect, useState } from 'react';
import type { EditorMode } from '../types';
import {
  ACTIVE_DOC_KEY,
  DOCS_KEY,
  LEGACY_CONTENT_KEYS,
  contentKey,
  isPersistent,
  parseDocIndex,
  readItem,
  removeItem,
  writeItem,
  type DocMeta,
} from '../utils/storage';

export const UNTITLED = 'Untitled';
const MODES: EditorMode[] = ['text', 'markdown'];

interface DocumentsState {
  docs: DocMeta[];
  activeId: string;
}

const newDoc = (): DocMeta => ({ id: crypto.randomUUID(), title: UNTITLED });

function loadState(): DocumentsState {
  const docs = parseDocIndex(readItem(DOCS_KEY));
  if (docs.length > 0) {
    const stored = readItem(ACTIVE_DOC_KEY);
    const activeId = docs.some(d => d.id === stored) ? stored! : docs[0].id;
    return { docs, activeId };
  }

  // First run, or data from the single-document version: move it into a first document.
  const doc = newDoc();
  for (const mode of MODES) {
    const legacy = readItem(LEGACY_CONTENT_KEYS[mode]);
    if (legacy !== null) {
      writeItem(contentKey(doc.id, mode), legacy);
      removeItem(LEGACY_CONTENT_KEYS[mode]);
    }
  }
  // Persist immediately so a second call (React StrictMode runs initializers twice)
  // finds this document instead of creating another one and losing the migrated content.
  writeItem(DOCS_KEY, JSON.stringify([doc]));
  writeItem(ACTIVE_DOC_KEY, doc.id);
  return { docs: [doc], activeId: doc.id };
}

export function useDocuments() {
  const [state, setState] = useState(loadState);
  const { docs, activeId } = state;

  useEffect(() => {
    writeItem(DOCS_KEY, JSON.stringify(docs));
    writeItem(ACTIVE_DOC_KEY, activeId);
  }, [docs, activeId]);

  // With on-device persistence, other tabs share the document list: pick up their changes.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== DOCS_KEY || !isPersistent()) return;
      const incoming = parseDocIndex(e.newValue);
      if (incoming.length === 0) return;
      setState(prev => ({
        docs: incoming,
        activeId: incoming.some(d => d.id === prev.activeId) ? prev.activeId : incoming[0].id,
      }));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  /** Re-reads the document list from storage (after switching persistence mode). */
  const reload = useCallback(() => setState(loadState()), []);

  const setActiveId = useCallback((id: string) => {
    setState(prev => (prev.activeId === id ? prev : { ...prev, activeId: id }));
  }, []);

  const createDoc = useCallback((): string => {
    const doc = newDoc();
    setState(prev => ({ docs: [...prev.docs, doc], activeId: doc.id }));
    return doc.id;
  }, []);

  const setTitle = useCallback((id: string, title: string) => {
    setState(prev => {
      const current = prev.docs.find(d => d.id === id);
      if (!current || current.title === title) return prev;
      return { ...prev, docs: prev.docs.map(d => (d.id === id ? { ...d, title } : d)) };
    });
  }, []);

  /** Deletes a document and returns a function that restores it. */
  const closeDoc = useCallback(
    (id: string): (() => void) => {
      const index = docs.findIndex(d => d.id === id);
      if (index < 0) return () => {};
      const meta = docs[index];
      const saved = MODES.map(mode => [mode, readItem(contentKey(id, mode))] as const);
      for (const mode of MODES) removeItem(contentKey(id, mode));

      let nextDocs = docs.filter(d => d.id !== id);
      let nextActive = activeId;
      if (nextDocs.length === 0) {
        const replacement = newDoc();
        nextDocs = [replacement];
        nextActive = replacement.id;
      } else if (activeId === id) {
        nextActive = nextDocs[Math.min(index, nextDocs.length - 1)].id;
      }
      setState({ docs: nextDocs, activeId: nextActive });

      return () => {
        for (const [mode, value] of saved) {
          if (value !== null) writeItem(contentKey(id, mode), value);
        }
        setState(prev => {
          if (prev.docs.some(d => d.id === id)) return { ...prev, activeId: id };
          const restored = [...prev.docs];
          restored.splice(Math.min(index, restored.length), 0, meta);
          return { docs: restored, activeId: id };
        });
      };
    },
    [docs, activeId],
  );

  return { docs, activeId, setActiveId, createDoc, closeDoc, setTitle, reload };
}
