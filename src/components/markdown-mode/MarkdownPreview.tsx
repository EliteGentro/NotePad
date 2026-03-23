import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function MarkdownPreview({ content }: { content: string }) {
    return (
        <div className="h-full w-full overflow-y-auto bg-[var(--canvas-bg)] p-6 sm:p-8 custom-scrollbar">
            <div
                id="markdown-preview-container"
                className="ProseMirror !min-h-0 !border-0 !shadow-none !bg-transparent !p-0 !outline-none"
            >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content || '*Preview will appear here*...'}
                </ReactMarkdown>
            </div>
        </div>
    );
}
