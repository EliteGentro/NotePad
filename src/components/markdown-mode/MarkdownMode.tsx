import { useState, useRef, useEffect } from 'react';
import { MarkdownEditor } from './MarkdownEditor';
import type { MarkdownEditorRef } from './MarkdownEditor';
import { MarkdownPreview } from './MarkdownPreview';
import { MarkdownToolbar } from './MarkdownToolbar';
import type { ExporterPayload } from '../../App';

export function MarkdownMode({ exportRef }: { exportRef: React.MutableRefObject<ExporterPayload> }) {
    const [content, setContent] = useState('');
    const editorRef = useRef<MarkdownEditorRef>(null);

    const latestContent = useRef(content);
    latestContent.current = content;

    useEffect(() => {
        exportRef.current = {
            getRaw: () => latestContent.current,
            getHtmlId: () => 'markdown-preview-container',
        };
    }, [exportRef, content]);

    const handleInsertText = (before: string, after: string, defaultText: string) => {
        editorRef.current?.insertText(before, after, defaultText);
    };

    return (
        <div className="flex flex-col h-full bg-[var(--bg-color)] rounded-xl border border-[var(--border-color)] shadow-sm overflow-hidden transition-colors duration-200">
            <MarkdownToolbar insertText={handleInsertText} />
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden w-full h-full max-h-[calc(100vh-140px)]">
                <div className="flex-1 flex flex-col w-full md:w-1/2 border-b md:border-b-0 md:border-r border-[var(--border-color)] h-full overflow-hidden">
                    <MarkdownEditor ref={editorRef} value={content} onChange={setContent} />
                </div>
                <div className="flex-1 flex flex-col w-full md:w-1/2 h-full overflow-hidden relative">
                    <div className="absolute top-2 right-4 text-xs font-semibold text-gray-400 bg-[var(--bg-color)] px-2 py-1 rounded shadow-sm border border-[var(--border-color)] z-10 pointer-events-none">
                        PREVIEW
                    </div>
                    <MarkdownPreview content={content} />
                </div>
            </div>
        </div>
    );
}
