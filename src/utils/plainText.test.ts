import { describe, expect, it } from 'vitest';
import { fragmentToPlainText, fragmentToText } from './plainText';
import { doc, li, ol, p, ul } from '../test/schema';

/** What ProseMirror puts on the clipboard for a selection from `from` to `to`. */
const copy = (node: ReturnType<typeof doc>, from = 1, to = node.content.size - 1) =>
  fragmentToText(node.slice(from, to, true).content);

describe('fragmentToPlainText', () => {
  it('puts a single newline between paragraphs (no blank line per Enter)', () => {
    expect(fragmentToPlainText(doc(p('line one'), p('line two')).content)).toBe('line one\nline two');
  });

  it('keeps blank lines the user typed', () => {
    expect(fragmentToPlainText(doc(p('a'), p(), p('b')).content)).toBe('a\n\nb');
  });

  it('turns hard breaks into newlines', () => {
    const d = doc({ type: 'paragraph', content: [{ type: 'text', text: 'x' }, { type: 'hardBreak' }, { type: 'text', text: 'y' }] });
    expect(fragmentToPlainText(d.content)).toBe('x\ny');
  });

  it('does not add list markers', () => {
    expect(fragmentToPlainText(doc(ul(li(p('a')), li(p('b')))).content)).toBe('a\nb');
  });
});

describe('fragmentToText (clipboard / .txt export)', () => {
  it('copies lines without blank lines between them', () => {
    expect(copy(doc(p('line one'), p('line two'), p('line three')))).toBe('line one\nline two\nline three');
  });

  it('keeps bullet and ordered list markers', () => {
    expect(copy(doc(p('Intro'), ul(li(p('a')), li(p('b'))), ol(3, li(p('c')), li(p('d')))))).toBe(
      'Intro\n- a\n- b\n3. c\n4. d',
    );
  });

  it('indents nested lists', () => {
    expect(copy(doc(ul(li(p('parent'), ul(li(p('child')))), li(p('next')))))).toBe('- parent\n  - child\n- next');
  });

  it('copies blockquote text without doubling newlines', () => {
    expect(copy(doc(p('before'), { type: 'blockquote', content: [p('q1'), p('q2')] }, p('after')))).toBe(
      'before\nq1\nq2\nafter',
    );
  });

  it('copies a partial selection inside one list item as plain text', () => {
    const d = doc(ul(li(p('hello world'))));
    // positions: bulletList(0) > listItem(1) > paragraph(2) > text starts at 3
    expect(copy(d, 3 + 6, 3 + 11)).toBe('world');
  });
});
