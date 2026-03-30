import { useMemo } from 'react';

export interface DocumentStats {
  words: number;
  characters: number;
  readingTime: string;
}

export function useDocumentStats(text: string): DocumentStats {
  return useMemo(() => {
    const trimmed = text.trim();
    if (!trimmed) return { words: 0, characters: 0, readingTime: '0 min' };

    const words = trimmed.split(/\s+/).length;
    const characters = trimmed.length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    const readingTime = `${minutes} min`;

    return { words, characters, readingTime };
  }, [text]);
}
