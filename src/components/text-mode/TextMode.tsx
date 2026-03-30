import { useEffect, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';

import { TextToolbar } from './TextToolbar';
import type { ExporterPayload } from '../../App';

const STORAGE_KEY = 'notepad-text-content';
const AUTOSAVE_DELAY = 1000;

function loadSavedContent(): string {
    try {
        return sessionStorage.getItem(STORAGE_KEY) || '';
    } catch {
        return '';
    }
}

interface TextModeProps {
    exportRef: React.MutableRefObject<ExporterPayload>;
    onTextChange?: (text: string) => void;
}

export function TextMode({ exportRef, onTextChange }: TextModeProps) {
    const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();

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
        content: loadSavedContent(),
        autofocus: 'end',
        editorProps: {
            attributes: {
                class: 'w-full focus:outline-none',
            },
        },
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            const text = editor.getText();
            onTextChange?.(text);

            // Debounced autosave
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
            saveTimerRef.current = setTimeout(() => {
                try { sessionStorage.setItem(STORAGE_KEY, html); } catch { /* ignore */ }
            }, AUTOSAVE_DELAY);
        },
    });

    // Initial text report
    useEffect(() => {
        if (editor) {
            onTextChange?.(editor.getText());
        }
    }, [editor, onTextChange]);

    useEffect(() => {
        if (editor) {
            exportRef.current = {
                getRaw: () => editor.getText(),
                getHtmlId: () => 'text-editor-container',
                clear: () => {
                    editor.commands.clearContent(true);
                    try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
                },
            };
        }
    }, [editor, exportRef]);

    // Cleanup timer
    useEffect(() => {
        return () => {
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        };
    }, []);

    return (
        <div className="flex flex-col h-full bg-(--bg-color) rounded-xl border border-(--border-color) shadow-sm overflow-hidden transition-colors duration-200">
            <TextToolbar editor={editor} />
            <div className="flex-1 overflow-y-auto w-full bg-(--canvas-bg) p-4 sm:p-8 relative">
                <div id="text-editor-container" className="max-w-4xl mx-auto mb-10 h-full min-h-max">
                    <EditorContent editor={editor} className="h-full" />
                </div>
            </div>
        </div>
    );
}
