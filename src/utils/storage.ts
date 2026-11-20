import type { EditorMode } from '../types';

/**
 * Document storage.
 *
 * By default documents live in sessionStorage: each browser tab is its own session and
 * closing the tab discards its notes. When the user turns on "Keep on this device", the
 * same keys move to localStorage so notes survive closing the tab / browser.
 *
 * The persistence preference itself always lives in localStorage.
 */

const PERSIST_KEY = 'notepad-persist';
export const DOCS_KEY = 'notepad-docs';
export const ACTIVE_DOC_KEY = 'notepad-active-doc';
const DOC_KEY_PREFIX = 'notepad-doc:';

/** Keys used before multi-document support (single text + single markdown buffer). */
export const LEGACY_CONTENT_KEYS: Record<EditorMode, string> = {
  text: 'notepad-text-content',
  markdown: 'notepad-markdown-content',
};

export interface DocMeta {
  id: string;
  title: string;
}

export const contentKey = (docId: string, mode: EditorMode) => `${DOC_KEY_PREFIX}${docId}:${mode}`;

const isDataKey = (key: string) =>
  key === DOCS_KEY ||
  key === ACTIVE_DOC_KEY ||
  key.startsWith(DOC_KEY_PREFIX) ||
  Object.values(LEGACY_CONTENT_KEYS).includes(key);

export function isPersistent(): boolean {
  try {
    return localStorage.getItem(PERSIST_KEY) === 'true';
  } catch {
    return false;
  }
}

function activeStore(): Storage | null {
  try {
    return isPersistent() ? localStorage : sessionStorage;
  } catch {
    return null;
  }
}

export function readItem(key: string): string | null {
  try {
    return activeStore()?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

/** Returns false when the write failed (storage full or unavailable). */
export function writeItem(key: string, value: string): boolean {
  try {
    const store = activeStore();
    if (!store) return false;
    store.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function removeItem(key: string): void {
  try {
    activeStore()?.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function parseDocIndex(raw: string | null): DocMeta[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (d): d is DocMeta => typeof d === 'object' && d !== null && typeof d.id === 'string' && typeof d.title === 'string',
    );
  } catch {
    return [];
  }
}

/** Union of two document indexes, keeping `primary` order and appending unseen docs from `secondary`. */
export function mergeDocIndexes(primary: DocMeta[], secondary: DocMeta[]): DocMeta[] {
  const seen = new Set(primary.map(d => d.id));
  return [...primary, ...secondary.filter(d => !seen.has(d.id))];
}

/**
 * Switches between tab-only (sessionStorage) and on-device (localStorage) persistence,
 * moving this tab's documents to the new store. Returns false if the move failed, in
 * which case the preference is left unchanged.
 */
export function setPersistent(on: boolean): boolean {
  if (on === isPersistent()) return true;
  try {
    const from = on ? sessionStorage : localStorage;
    const to = on ? localStorage : sessionStorage;

    const keys: string[] = [];
    for (let i = 0; i < from.length; i++) {
      const key = from.key(i);
      if (key && isDataKey(key)) keys.push(key);
    }

    for (const key of keys) {
      const value = from.getItem(key);
      if (value === null) continue;
      if (key === DOCS_KEY) {
        // Another tab may already keep documents on this device: merge instead of overwriting.
        const merged = mergeDocIndexes(parseDocIndex(value), parseDocIndex(to.getItem(key)));
        to.setItem(key, JSON.stringify(merged));
      } else {
        to.setItem(key, value);
      }
    }
    for (const key of keys) from.removeItem(key);

    if (on) localStorage.setItem(PERSIST_KEY, 'true');
    else localStorage.removeItem(PERSIST_KEY);
    return true;
  } catch {
    return false;
  }
}
