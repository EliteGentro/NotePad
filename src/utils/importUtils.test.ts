import { describe, expect, it } from 'vitest';
import { deriveTitle, detectImportFormat, plainTextToDoc } from './importUtils';

describe('detectImportFormat', () => {
  it('detects markdown by extension', () => {
    expect(detectImportFormat('notes.md')).toBe('md');
    expect(detectImportFormat('NOTES.Markdown')).toBe('md');
    expect(detectImportFormat('notes.txt')).toBe('txt');
    expect(detectImportFormat('README')).toBe('txt');
  });
});

describe('plainTextToDoc', () => {
  it('makes one paragraph per line, keeps blank lines, drops the trailing newline', () => {
    expect(plainTextToDoc('a\r\n\nb\n')).toEqual({
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'a' }] },
        { type: 'paragraph' },
        { type: 'paragraph', content: [{ type: 'text', text: 'b' }] },
      ],
    });
  });

  it('produces a single empty paragraph for empty input', () => {
    expect(plainTextToDoc('')).toEqual({ type: 'doc', content: [{ type: 'paragraph' }] });
  });
});

describe('deriveTitle', () => {
  it('uses the first non-empty line without markdown markers', () => {
    expect(deriveTitle('\n\n## Shopping list\n- milk')).toBe('Shopping list');
    expect(deriveTitle('> - quoted item')).toBe('quoted item');
    expect(deriveTitle('1. first')).toBe('first');
  });

  it('truncates long titles', () => {
    expect(deriveTitle('x'.repeat(100), 10)).toBe(`${'x'.repeat(9)}…`);
  });

  it('returns empty for blank text', () => {
    expect(deriveTitle('  \n \n')).toBe('');
  });
});
