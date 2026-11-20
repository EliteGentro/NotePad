import type { JSONContent } from '@tiptap/core';
import type { ImportFormat } from '../types';

/** Larger files risk exceeding the ~5 MB browser storage quota once saved. */
export const MAX_IMPORT_BYTES = 2 * 1024 * 1024;

export const IMPORT_ACCEPT = '.txt,.md,.markdown,text/plain,text/markdown';

export function detectImportFormat(filename: string): ImportFormat {
  return /\.(md|markdown)$/i.test(filename) ? 'md' : 'txt';
}

/** Converts plain text to a Tiptap document: one paragraph per line, blank lines kept. */
export function plainTextToDoc(text: string): JSONContent {
  const lines = text.replace(/\r\n?/g, '\n').split('\n');
  if (lines.length > 1 && lines[lines.length - 1] === '') lines.pop();
  return {
    type: 'doc',
    content: lines.map(line =>
      line ? { type: 'paragraph', content: [{ type: 'text', text: line }] } : { type: 'paragraph' },
    ),
  };
}

/** Title for a document: its first non-empty line, without leading Markdown markers. */
export function deriveTitle(text: string, maxLength = 40): string {
  const line = text
    .split('\n')
    .map(l => l.replace(/^\s*(#{1,6}\s+|>\s*|[-*+]\s+|\d+[.)]\s+)*/, '').trim())
    .find(Boolean);
  if (!line) return '';
  return line.length > maxLength ? `${line.slice(0, maxLength - 1)}…` : line;
}
