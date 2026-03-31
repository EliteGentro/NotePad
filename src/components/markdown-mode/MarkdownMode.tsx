import { useState, useRef, useEffect, useCallback } from 'react';
import { MarkdownEditor } from './MarkdownEditor';
import type { MarkdownEditorRef } from './MarkdownEditor';
import { MarkdownPreview } from './MarkdownPreview';
import { MarkdownToolbar } from './MarkdownToolbar';
import type { ExporterPayload } from '../../App';

const STORAGE_KEY = 'notepad-markdown-content';
const AUTOSAVE_DELAY = 1000;

function loadSavedContent(): string {
    try {
        return sessionStorage.getItem(STORAGE_KEY) || '';
    } catch {
        return '';
    }
}

interface MarkdownModeProps {
    exportRef: React.MutableRefObject<ExporterPayload>;
    onTextChange?: (text: string) => void;
}

export function MarkdownMode({ exportRef, onTextChange }: MarkdownModeProps) {
    const [content, setContent] = useState(loadSavedContent);
    const editorRef = useRef<MarkdownEditorRef>(null);
    const saveTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    const latestContent = useRef(content);
    latestContent.current = content;

    const handleChange = useCallback((val: string) => {
        setContent(val);
        onTextChange?.(val);

        // Debounced autosave
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
            try { sessionStorage.setItem(STORAGE_KEY, val); } catch { /* ignore */ }
        }, AUTOSAVE_DELAY);
    }, [onTextChange]);

    useEffect(() => {
        exportRef.current = {
            getRaw: () => latestContent.current,
            getHtmlId: () => 'markdown-preview-container',
            clear: () => {
                handleChange('');
                try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
            },
        };
    }, [exportRef, content, handleChange]);

    // Report initial text
    useEffect(() => {
        onTextChange?.(content);
    }, []);  // eslint-disable-line react-hooks/exhaustive-deps

    // Cleanup timer
    useEffect(() => {
        return () => {
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        };
    }, []);

    const handleInsertText = (before: string, after: string, defaultText: string) => {
        editorRef.current?.insertText(before, after, defaultText);
    };

    return (
        <div className="flex flex-col h-full bg-(--bg-color) rounded-xl border border-(--border-color) shadow-sm overflow-hidden transition-colors duration-200">
            <MarkdownToolbar insertText={handleInsertText} />
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden w-full h-full max-h-[calc(100vh-160px)]">
                <div className="flex-1 flex flex-col w-full md:w-1/2 border-b md:border-b-0 md:border-r border-(--border-color) h-full overflow-hidden">
                    <MarkdownEditor ref={editorRef} value={content} onChange={handleChange} />
                </div>
                <div className="flex-1 flex flex-col w-full md:w-1/2 h-full overflow-hidden relative">
                    <div className="absolute top-2 right-4 text-[10px] font-semibold uppercase tracking-wider text-[color-mix(in_srgb,var(--text-color)_30%,transparent)] bg-(--bg-color)/80 px-2 py-0.5 rounded border border-(--border-color) z-10 pointer-events-none select-none">
                        Preview
                    </div>
                    <MarkdownPreview content={content} />
                </div>
            </div>
        </div>
    );
}
