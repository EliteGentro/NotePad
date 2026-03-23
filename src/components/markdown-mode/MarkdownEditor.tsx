import { forwardRef, useImperativeHandle, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import type { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { useTheme } from '../common/ThemeContext';

export interface MarkdownEditorRef {
    insertText: (before: string, after: string, defaultText: string) => void;
}

export const MarkdownEditor = forwardRef<MarkdownEditorRef, { value: string, onChange: (val: string) => void }>(({ value, onChange }, ref) => {
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
        }
    }));

    return (
        <div className="h-full w-full overflow-y-auto text-left bg-[var(--editor-bg)] custom-scrollbar">
            <CodeMirror
                ref={editorRef}
                value={value}
                minHeight="100%"
                theme={theme === 'dark' ? 'dark' : 'light'}
                extensions={[
                    markdown({ base: markdownLanguage, codeLanguages: languages })
                ]}
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
