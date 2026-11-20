import { describe, expect, it } from 'vitest';
import { findMatches } from './searchExtension';
import { doc, p } from '../../test/schema';

describe('findMatches', () => {
  it('finds case-insensitive matches with document positions', () => {
    const d = doc(p('Cat cat'), p('CAT'));
    const matches = findMatches(d, 'cat', false);
    expect(matches.map(m => d.textBetween(m.from, m.to))).toEqual(['Cat', 'cat', 'CAT']);
  });

  it('respects case sensitivity', () => {
    expect(findMatches(doc(p('Cat cat')), 'cat', true)).toHaveLength(1);
  });

  it('matches across mark boundaries', () => {
    const d = doc({
      type: 'paragraph',
      content: [
        { type: 'text', text: 'he' },
        { type: 'text', text: 'llo', marks: [{ type: 'bold' }] },
      ],
    });
    const [match] = findMatches(d, 'hello', false);
    expect(d.textBetween(match.from, match.to)).toBe('hello');
  });

  it('treats regex characters literally and returns nothing for an empty term', () => {
    expect(findMatches(doc(p('a.b axb')), 'a.b', false)).toHaveLength(1);
    expect(findMatches(doc(p('abc')), '', false)).toEqual([]);
  });
});
