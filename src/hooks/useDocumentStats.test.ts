import { describe, expect, it } from 'vitest';
import { computeDocumentStats } from './useDocumentStats';

describe('computeDocumentStats', () => {
  it('counts words and characters', () => {
    expect(computeDocumentStats('  hello\nworld  ')).toEqual({ words: 2, characters: 11, readingTime: '1 min' });
  });

  it('handles empty text', () => {
    expect(computeDocumentStats('   ')).toEqual({ words: 0, characters: 0, readingTime: '0 min' });
  });

  it('rounds reading time up at 200 wpm', () => {
    expect(computeDocumentStats(Array(201).fill('w').join(' ')).readingTime).toBe('2 min');
  });
});
