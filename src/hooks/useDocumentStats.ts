import { useMemo } from 'react';

export interface DocumentStats {
  words: number;
  characters: number;
  readingTime: string;
}

const WORDS_PER_MINUTE = 200;

export function computeDocumentStats(text: string): DocumentStats {
  const trimmed = text.trim();
  if (!trimmed) return { words: 0, characters: 0, readingTime: '0 min' };

  const words = trimmed.split(/\s+/).length;
  const characters = trimmed.length;
  const minutes = Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));

  return { words, characters, readingTime: `${minutes} min` };
}

export function useDocumentStats(text: string): DocumentStats {
  return useMemo(() => computeDocumentStats(text), [text]);
}
