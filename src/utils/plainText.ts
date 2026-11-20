import type { Fragment, Node as PMNode } from '@tiptap/pm/model';

/**
 * Leaf nodes that should produce text when serialized to plain text.
 * Hard breaks (Shift+Enter) become a newline; other leaves (e.g. horizontal rules) are dropped.
 */
const leafText = (node: PMNode): string => (node.type.name === 'hardBreak' ? '\n' : '');

/**
 * Serialize a ProseMirror fragment to plain text with ONE newline between text blocks.
 *
 * Tiptap's default serializer (used by both the clipboard and `editor.getText()`) joins
 * blocks with "\n\n". Every Enter in the editor creates a new paragraph, so the default
 * inserts a blank line between every line when copying or exporting.
 *
 * `Fragment.textBetween` only inserts the separator between textblocks (paragraphs,
 * headings, code blocks), not between wrapper nodes like lists or blockquotes, so nested
 * content does not get doubled newlines either.
 *
 * Used for word/character counts, where list markers would skew the numbers.
 */
export function fragmentToPlainText(fragment: Fragment): string {
  return fragment.textBetween(0, fragment.size, '\n', leafText);
}

const LIST_TYPES = new Set(['bulletList', 'orderedList']);

/**
 * Like {@link fragmentToPlainText}, but keeps list structure: bullet items get "- ",
 * ordered items get "1. ", and nested lists are indented. Used for the clipboard and
 * `.txt` export.
 *
 * A selection inside a single text block (e.g. a few words of one list item) is copied
 * as just the text, without a marker.
 */
export function fragmentToText(fragment: Fragment): string {
  let textblocks = 0;
  fragment.descendants(node => {
    if (node.isTextblock) {
      textblocks++;
      return false;
    }
    return true;
  });
  if (textblocks <= 1) return fragmentToPlainText(fragment);

  const lines: string[] = [];

  const walk = (content: Fragment, indent: string) => {
    content.forEach(node => {
      if (node.isTextblock) {
        const text = node.textBetween(0, node.content.size, '\n', leafText);
        lines.push(indent + text.replace(/\n/g, `\n${indent}`));
      } else if (LIST_TYPES.has(node.type.name)) {
        const ordered = node.type.name === 'orderedList';
        let n = typeof node.attrs.start === 'number' ? node.attrs.start : 1;
        node.forEach(item => {
          const marker = ordered ? `${n++}. ` : '- ';
          const first = lines.length;
          walk(item.content, indent + ' '.repeat(marker.length));
          if (lines.length > first) {
            lines[first] = indent + marker + lines[first].slice(indent.length + marker.length);
          } else {
            lines.push(indent + marker.trimEnd());
          }
        });
      } else if (!node.isLeaf) {
        // blockquote, listItem outside a list (open slice), etc.
        walk(node.content, indent);
      }
    });
  };

  walk(fragment, '');
  return lines.join('\n');
}
