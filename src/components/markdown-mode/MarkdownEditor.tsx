import { forwardRef, useImperativeHandle, useRef, type UIEvent } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import type { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { openSearchPanel } from '@codemirror/search';
import { useTheme } from '../common/theme';

export interface MarkdownEditorRef {
    insertText: (before: string, after: string, defaultText: string) => void;
    openSearch: () => void;
}

interface MarkdownEditorProps {
    value: string;
    onChange: (val: string) => void;
    /** Scroll position as a 0–1 ratio, for syncing the preview. */
    onScrollRatio?: (ratio: number) => void;
}

// Stable reference so CodeMirror doesn't reconfigure on every render.
const extensions = [markdown({ base: markdownLanguage, codeLanguages: languages })];

export const MarkdownEditor = forwardRef<MarkdownEditorRef, MarkdownEditorProps>(({ value, onChange, onScrollRatio }, ref) => {
    const editorRef = useRef<ReactCodeMirrorRef>(null);
    const { theme } = useTheme();

    useImperativeHandle(ref, () => ({
        insertText: (before: string, after: string, defaultText: string) => {
            if (!editorRef.current?.view) return;
            const view = editorRef.current.view;
            const selection = view.state.selection.main;

            const selectedText = view.state.sliceDoc(selection.from, selection.to);
            const textToInsert = selectedText || defaultText;
            const insertStr = `${before}${textToInsert}${after}`;

            view.dispatch({
                changes: {
                    from: selection.from,
                    to: selection.to,
                    insert: insertStr
                },
                selection: {
                    anchor: selection.from + before.length,
                    head: selection.from + before.length + textToInsert.length
                }
            });
            view.focus();
        },
        openSearch: () => {
            const view = editorRef.current?.view;
            if (view) openSearchPanel(view);
        },
    }));

    // Capture phase: scroll events don't bubble, and the scrolling element may be
    // CodeMirror's internal scroller or this wrapper depending on content height.
    const handleScroll = (e: UIEvent<HTMLDivElement>) => {
        const el = e.target as HTMLElement;
        const max = el.scrollHeight - el.clientHeight;
        onScrollRatio?.(max > 0 ? el.scrollTop / max : 0);
    };

    return (
        <div className="h-full w-full overflow-y-auto text-left bg-(--editor-bg)" onScrollCapture={handleScroll}>
            <CodeMirror
                ref={editorRef}
                value={value}
                minHeight="100%"
                theme={theme === 'dark' ? 'dark' : 'light'}
                extensions={extensions}
                onChange={onChange}
                className="text-[1.05rem] cm-container h-full"
                basicSetup={{
                    lineNumbers: false,
                    foldGutter: false,
                    highlightActiveLine: false,
                }}
            />
        </div>
    );
});
MarkdownEditor.displayName = 'MarkdownEditor';
