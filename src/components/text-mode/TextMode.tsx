import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type RefObject } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import { Markdown } from '@tiptap/markdown';

import { TextToolbar } from './TextToolbar';
import { FindBar } from './FindBar';
import { SearchExtension } from './searchExtension';
import { fragmentToPlainText, fragmentToText } from '../../utils/plainText';
import { plainTextToDoc } from '../../utils/importUtils';
import { contentKey, readItem, writeItem } from '../../utils/storage';
import { NOOP_EDITOR_HANDLE, type EditorHandle, type PendingImport } from '../../types';

const AUTOSAVE_DELAY = 1000;
const PDF_ELEMENT_ID = 'text-editor-container';

interface TextModeProps {
    docId: string;
    editorRef: RefObject<EditorHandle>;
    onTextChange: (text: string) => void;
    onSaved: (ok: boolean) => void;
    /** File to load instead of the saved content (only when it targets this document). */
    pendingImport: PendingImport | null;
    onImportApplied: () => void;
}

export function TextMode({ docId, editorRef, onTextChange, onSaved, pendingImport, onImportApplied }: TextModeProps) {
    const storageKey = contentKey(docId, 'text');
    const saveTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
    const pendingHtmlRef = useRef<string | null>(null);
    const [findOpen, setFindOpen] = useState(false);

    // Only read on mount: the component is keyed by docId, so a new document remounts it.
    const [initial] = useState(() => {
        if (pendingImport?.docId === docId) {
            return pendingImport.format === 'md'
                ? { content: pendingImport.content, contentType: 'markdown' as const, imported: true }
                : { content: plainTextToDoc(pendingImport.content), contentType: 'json' as const, imported: true };
        }
        return { content: readItem(storageKey) ?? '', contentType: 'html' as const, imported: false };
    });

    const flush = useCallback(() => {
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = undefined;
        if (pendingHtmlRef.current === null) return;
        const ok = writeItem(storageKey, pendingHtmlRef.current);
        pendingHtmlRef.current = null;
        onSaved(ok);
    }, [storageKey, onSaved]);

    const scheduleSave = useCallback((html: string) => {
        pendingHtmlRef.current = html;
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(flush, AUTOSAVE_DELAY);
    }, [flush]);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            TextStyle,
            Color,
            Highlight.configure({
                multicolor: true,
            }),
            Markdown,
            SearchExtension,
        ],
        content: initial.content,
        contentType: initial.contentType,
        autofocus: 'end',
        editorProps: {
            attributes: {
                class: 'w-full focus:outline-none',
            },
            // Plain-text clipboard: one newline per line (Tiptap's default inserts a blank line
            // between paragraphs) and list markers kept. editorProps take precedence over
            // Tiptap's built-in clipboardTextSerializer plugin.
            clipboardTextSerializer: (slice) => fragmentToText(slice.content),
        },
        onUpdate: ({ editor }) => {
            onTextChange(fragmentToPlainText(editor.state.doc.content));
            scheduleSave(editor.getHTML());
        },
    });

    // Initial text report, and save an imported file right away.
    useEffect(() => {
        if (!editor) return;
        onTextChange(fragmentToPlainText(editor.state.doc.content));
        if (initial.imported) {
            pendingHtmlRef.current = editor.getHTML();
            flush();
            onImportApplied();
        }
    }, [editor]); // eslint-disable-line react-hooks/exhaustive-deps -- run once per editor instance

    useEffect(() => {
        if (!editor) return;
        editorRef.current = {
            getContent: (format) =>
                format === 'md' ? editor.getMarkdown() : fragmentToText(editor.state.doc.content),
            getPdfElementId: () => PDF_ELEMENT_ID,
            clear: () => {
                const snapshot = editor.getJSON();
                editor.commands.clearContent(true);
                return () => {
                    if (!editor.isDestroyed) editor.commands.setContent(snapshot, { emitUpdate: true });
                };
            },
            flush,
        };
        return () => {
            editorRef.current = NOOP_EDITOR_HANDLE;
        };
    }, [editor, editorRef, flush]);

    // Save pending edits when the tab is hidden/closed and when this editor unmounts
    // (switching mode or document), instead of dropping them with the debounce timer.
    useEffect(() => {
        window.addEventListener('pagehide', flush);
        return () => {
            window.removeEventListener('pagehide', flush);
            flush();
        };
    }, [flush]);

    const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey && e.code === 'KeyF') {
            e.preventDefault();
            setFindOpen(true);
        }
    };

    return (
        <div
            className="flex flex-col flex-1 min-h-0 bg-(--bg-color) rounded-xl border border-(--border-color) shadow-sm overflow-hidden transition-colors duration-200"
            onKeyDown={handleKeyDown}
        >
            <TextToolbar editor={editor} onOpenFind={() => setFindOpen(true)} />
            {findOpen && editor && <FindBar editor={editor} onClose={() => setFindOpen(false)} />}
            <div className="flex-1 min-h-0 overflow-y-auto w-full bg-(--canvas-bg) p-4 sm:p-8">
                <div id={PDF_ELEMENT_ID} className="max-w-4xl mx-auto min-h-full flex flex-col">
                    <EditorContent editor={editor} className="text-editor-host flex-1 flex flex-col" />
                </div>
            </div>
        </div>
    );
}
