import { getSchema, type JSONContent } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';

/** The same node/mark schema the text editor uses (StarterKit), without a DOM. */
export const schema = getSchema([StarterKit]);

export const doc = (...content: JSONContent[]) => schema.nodeFromJSON({ type: 'doc', content });
export const p = (text?: string): JSONContent =>
  text ? { type: 'paragraph', content: [{ type: 'text', text }] } : { type: 'paragraph' };
export const li = (...content: JSONContent[]): JSONContent => ({ type: 'listItem', content });
export const ul = (...items: JSONContent[]): JSONContent => ({ type: 'bulletList', content: items });
export const ol = (start: number, ...items: JSONContent[]): JSONContent => ({ type: 'orderedList', attrs: { start }, content: items });
