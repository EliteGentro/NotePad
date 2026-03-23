import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';

import { TextToolbar } from './TextToolbar';
import type { ExporterPayload } from '../../App';

export function TextMode({ exportRef }: { exportRef: React.MutableRefObject<ExporterPayload> }) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
            }),
            Underline,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            TextStyle,
            Color,
            Highlight.configure({
                multicolor: true,
            }),
        ],
        content: '',
        autofocus: 'end',
        editorProps: {
            attributes: {
                class: 'w-full focus:outline-none',
            },
        },
    });

    useEffect(() => {
        if (editor) {
            exportRef.current = {
                getRaw: () => editor.getText(),
                getHtmlId: () => 'text-editor-container',
            };
        }
    }, [editor, exportRef]);

    return (
        <div className="flex flex-col h-full bg-[var(--bg-color)] rounded-xl border border-[var(--border-color)] shadow-sm overflow-hidden transition-colors duration-200">
            <TextToolbar editor={editor} />
            <div className="flex-1 overflow-y-auto w-full custom-scrollbar bg-[var(--canvas-bg)] p-4 sm:p-8 relative">
                <div id="text-editor-container" className="max-w-4xl mx-auto mb-10 h-full min-h-max">
                    <EditorContent editor={editor} className="h-full" />
                </div>
            </div>
        </div>
    );
}
