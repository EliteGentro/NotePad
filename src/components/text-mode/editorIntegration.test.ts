// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from '@tiptap/markdown';
import { fragmentToText } from '../../utils/plainText';

let editor: Editor | undefined;
afterEach(() => editor?.destroy());

describe('text editor integration', () => {
  it('uses our clipboard serializer instead of Tiptap’s blank-line default', () => {
    editor = new Editor({
      extensions: [StarterKit],
      content: '<p>one</p><p>two</p><p>three</p>',
      editorProps: { clipboardTextSerializer: slice => fragmentToText(slice.content) },
    });
    editor.commands.selectAll();
    const { view } = editor;
    const slice = view.state.selection.content();
    const text = view.someProp('clipboardTextSerializer', f => f(slice, view));
    expect(text).toBe('one\ntwo\nthree');
  });

  it('imports and exports Markdown', () => {
    editor = new Editor({
      extensions: [StarterKit, Markdown],
      content: '# Title\n\nSome **bold** text\n\n- a\n- b',
      contentType: 'markdown',
    });
    expect(editor.getHTML()).toContain('<h1>Title</h1>');
    expect(editor.getHTML()).toContain('<strong>bold</strong>');
    const md = editor.getMarkdown();
    expect(md).toContain('# Title');
    expect(md).toContain('**bold**');
    expect(md).toMatch(/- a\n- b/);
  });
});
