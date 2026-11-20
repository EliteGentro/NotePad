export type EditorMode = 'text' | 'markdown';
export type ExportFormat = 'txt' | 'md' | 'pdf';
export type ImportFormat = 'txt' | 'md';

/** Imperative API each editor mode exposes to the app shell (export, clear, flush). */
export interface EditorHandle {
  /** Document content as plain text (`txt`) or Markdown (`md`). */
  getContent: (format: 'txt' | 'md') => string;
  /** id of the DOM element rendered into the PDF export. */
  getPdfElementId: () => string;
  /** Clears the document and returns a function that restores the previous content. */
  clear: () => () => void;
  /** Writes any pending (debounced) autosave immediately. */
  flush: () => void;
}

export const NOOP_EDITOR_HANDLE: EditorHandle = {
  getContent: () => '',
  getPdfElementId: () => '',
  clear: () => () => {},
  flush: () => {},
};

/** A file the user opened, waiting to be loaded into a freshly created document. */
export interface PendingImport {
  docId: string;
  content: string;
  format: ImportFormat;
}

export interface SaveStatus {
  at: Date;
  ok: boolean;
}
