// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import {
  DOCS_KEY,
  contentKey,
  isPersistent,
  mergeDocIndexes,
  parseDocIndex,
  readItem,
  setPersistent,
  writeItem,
} from './storage';

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

describe('storage', () => {
  it('uses sessionStorage by default', () => {
    expect(isPersistent()).toBe(false);
    writeItem(contentKey('a', 'text'), '<p>hi</p>');
    expect(sessionStorage.getItem(contentKey('a', 'text'))).toBe('<p>hi</p>');
    expect(localStorage.getItem(contentKey('a', 'text'))).toBeNull();
  });

  it('moves documents to localStorage when persistence is turned on, and back', () => {
    writeItem(DOCS_KEY, JSON.stringify([{ id: 'a', title: 'A' }]));
    writeItem(contentKey('a', 'markdown'), '# A');
    sessionStorage.setItem('unrelated', 'keep');

    expect(setPersistent(true)).toBe(true);
    expect(isPersistent()).toBe(true);
    expect(localStorage.getItem(contentKey('a', 'markdown'))).toBe('# A');
    expect(sessionStorage.getItem(contentKey('a', 'markdown'))).toBeNull();
    expect(sessionStorage.getItem('unrelated')).toBe('keep');
    expect(readItem(contentKey('a', 'markdown'))).toBe('# A');

    expect(setPersistent(false)).toBe(true);
    expect(isPersistent()).toBe(false);
    expect(sessionStorage.getItem(contentKey('a', 'markdown'))).toBe('# A');
    expect(localStorage.getItem(contentKey('a', 'markdown'))).toBeNull();
  });

  it('merges with documents another tab already keeps on the device', () => {
    localStorage.setItem(DOCS_KEY, JSON.stringify([{ id: 'other', title: 'Other' }]));
    writeItem(DOCS_KEY, JSON.stringify([{ id: 'mine', title: 'Mine' }]));
    setPersistent(true);
    expect(parseDocIndex(localStorage.getItem(DOCS_KEY)).map(d => d.id)).toEqual(['mine', 'other']);
  });
});

describe('parseDocIndex / mergeDocIndexes', () => {
  it('ignores malformed data', () => {
    expect(parseDocIndex('not json')).toEqual([]);
    expect(parseDocIndex('{"id":"a"}')).toEqual([]);
    expect(parseDocIndex('[{"id":"a","title":"A"},{"id":1}]')).toEqual([{ id: 'a', title: 'A' }]);
  });

  it('dedupes by id, keeping the primary order', () => {
    const a = { id: 'a', title: 'A' };
    const b = { id: 'b', title: 'B' };
    expect(mergeDocIndexes([b], [a, { id: 'b', title: 'old' }])).toEqual([b, a]);
  });
});
