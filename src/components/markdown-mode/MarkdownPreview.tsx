import { forwardRef, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const MARKDOWN_PDF_ELEMENT_ID = 'markdown-preview-container';

const remarkPlugins = [remarkGfm];

export const MarkdownPreview = memo(forwardRef<HTMLDivElement, { content: string }>(({ content }, ref) => {
    return (
        <div ref={ref} className="h-full w-full overflow-y-auto bg-(--canvas-bg) p-6 sm:p-8">
            <div
                id={MARKDOWN_PDF_ELEMENT_ID}
                className="ProseMirror min-h-0! border-0! shadow-none! bg-transparent! p-0! outline-none!"
            >
                <ReactMarkdown remarkPlugins={remarkPlugins}>
                    {content || '*Preview will appear here*...'}
                </ReactMarkdown>
            </div>
        </div>
    );
}));
MarkdownPreview.displayName = 'MarkdownPreview';
