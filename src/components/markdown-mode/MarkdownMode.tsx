import { useState, useRef, useEffect, useCallback, type RefObject } from 'react';
import { MarkdownEditor } from './MarkdownEditor';
import type { MarkdownEditorRef } from './MarkdownEditor';
import { MarkdownPreview, MARKDOWN_PDF_ELEMENT_ID } from './MarkdownPreview';
import { MarkdownToolbar } from './MarkdownToolbar';
import { contentKey, readItem, writeItem } from '../../utils/storage';
import { NOOP_EDITOR_HANDLE, type EditorHandle, type PendingImport } from '../../types';

const AUTOSAVE_DELAY = 1000;

interface MarkdownModeProps {
    docId: string;
    editorRef: RefObject<EditorHandle>;
    onTextChange: (text: string) => void;
    onSaved: (ok: boolean) => void;
    /** File to load instead of the saved content (only when it targets this document). */
    pendingImport: PendingImport | null;
    onImportApplied: () => void;
}

export function MarkdownMode({ docId, editorRef, onTextChange, onSaved, pendingImport, onImportApplied }: MarkdownModeProps) {
    const storageKey = contentKey(docId, 'markdown');
    // Only read on mount: the component is keyed by docId, so a new document remounts it.
    const [initial] = useState(() =>
        pendingImport?.docId === docId
            ? { content: pendingImport.content, imported: true }
            : { content: readItem(storageKey) ?? '', imported: false },
    );
    const [content, setContent] = useState(initial.content);
    const editorApiRef = useRef<MarkdownEditorRef>(null);
    const previewRef = useRef<HTMLDivElement>(null);
    const saveTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
    const pendingRef = useRef<string | null>(null);

    const flush = useCallback(() => {
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = undefined;
        if (pendingRef.current === null) return;
        const ok = writeItem(storageKey, pendingRef.current);
        pendingRef.current = null;
        onSaved(ok);
    }, [storageKey, onSaved]);

    const handleChange = useCallback((val: string) => {
        setContent(val);
        onTextChange(val);

        // Debounced autosave
        pendingRef.current = val;
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(flush, AUTOSAVE_DELAY);
    }, [onTextChange, flush]);

    useEffect(() => {
        editorRef.current = {
            getContent: () => content,
            getPdfElementId: () => MARKDOWN_PDF_ELEMENT_ID,
            clear: () => {
                const snapshot = content;
                handleChange('');
                return () => handleChange(snapshot);
            },
            flush,
        };
        return () => {
            editorRef.current = NOOP_EDITOR_HANDLE;
        };
    }, [editorRef, content, handleChange, flush]);

    // Report initial text, and save an imported file right away.
    useEffect(() => {
        onTextChange(initial.content);
        if (initial.imported) {
            pendingRef.current = initial.content;
            flush();
            onImportApplied();
        }
    }, []);  // eslint-disable-line react-hooks/exhaustive-deps -- mount only

    // Save pending edits when the tab is hidden/closed and when this editor unmounts
    // (switching mode or document), instead of dropping them with the debounce timer.
    useEffect(() => {
        window.addEventListener('pagehide', flush);
        return () => {
            window.removeEventListener('pagehide', flush);
            flush();
        };
    }, [flush]);

    const handleScrollRatio = useCallback((ratio: number) => {
        const el = previewRef.current;
        if (el) el.scrollTop = ratio * (el.scrollHeight - el.clientHeight);
    }, []);

    const handleInsertText = (before: string, after: string, defaultText: string) => {
        editorApiRef.current?.insertText(before, after, defaultText);
    };

    return (
        <div className="flex flex-col flex-1 min-h-0 bg-(--bg-color) rounded-xl border border-(--border-color) shadow-sm overflow-hidden transition-colors duration-200">
            <MarkdownToolbar insertText={handleInsertText} onOpenFind={() => editorApiRef.current?.openSearch()} />
            <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden w-full">
                <div className="flex-1 min-h-0 flex flex-col w-full md:w-1/2 border-b md:border-b-0 md:border-r border-(--border-color) overflow-hidden">
                    <MarkdownEditor ref={editorApiRef} value={content} onChange={handleChange} onScrollRatio={handleScrollRatio} />
                </div>
                <div className="flex-1 min-h-0 flex flex-col w-full md:w-1/2 overflow-hidden relative">
                    <div className="absolute top-2 right-4 text-[10px] font-semibold uppercase tracking-wider text-[color-mix(in_srgb,var(--text-color)_30%,transparent)] bg-(--bg-color)/80 px-2 py-0.5 rounded border border-(--border-color) z-10 pointer-events-none select-none">
                        Preview
                    </div>
                    <MarkdownPreview ref={previewRef} content={content} />
                </div>
            </div>
        </div>
    );
}
