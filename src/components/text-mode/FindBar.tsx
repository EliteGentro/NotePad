import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useEditorState, type Editor } from '@tiptap/react';
import { CaseSensitive, ChevronDown, ChevronUp, Replace, ReplaceAll, X } from 'lucide-react';
import { getSearchState, replaceAll, replaceCurrent, stepMatch, updateSearch } from './searchExtension';

interface FindBarProps {
    editor: Editor;
    onClose: () => void;
}

const inputClass =
    'min-w-0 flex-1 px-2 py-1 text-sm rounded-md bg-(--bg-color) border border-(--border-color) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--accent-color)';

const iconButtonClass = (active = false) =>
    `p-1.5 rounded-md cursor-pointer transition-colors duration-150 disabled:opacity-40 disabled:cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-(--accent-color) ${
        active
            ? 'bg-(--accent-color)/12 text-(--accent-color)'
            : 'text-[color-mix(in_srgb,var(--text-color)_60%,transparent)] hover:text-(--text-color) hover:bg-(--toolbar-bg)'
    }`;

export function FindBar({ editor, onClose }: FindBarProps) {
    const [term, setTerm] = useState(() => {
        const { from, to, empty } = editor.state.selection;
        const selected = empty ? '' : editor.state.doc.textBetween(from, to, ' ');
        return selected.includes('\n') ? '' : selected;
    });
    const [replacement, setReplacement] = useState('');
    const findRef = useRef<HTMLInputElement>(null);

    const { count, index, caseSensitive } = useEditorState({
        editor,
        selector: ({ editor: e }) => {
            const s = getSearchState(e);
            return { count: s?.matches.length ?? 0, index: s?.index ?? 0, caseSensitive: s?.caseSensitive ?? false };
        },
    });

    useEffect(() => {
        findRef.current?.focus();
        findRef.current?.select();
    }, []);

    useEffect(() => {
        updateSearch(editor, { term, index: 0 });
    }, [editor, term]);

    // Clear highlights when the bar closes.
    useEffect(() => () => {
        if (!editor.isDestroyed) updateSearch(editor, { term: '' });
    }, [editor]);

    const close = () => {
        onClose();
        editor.commands.focus();
    };

    const handleKeyDown = (e: KeyboardEvent, onEnter: () => void) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation(); // don't also exit focus mode
            close();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            onEnter();
        }
    };

    const hasMatches = count > 0;

    return (
        <div
            className="flex flex-wrap items-center gap-1.5 px-2 py-1.5 border-b border-(--border-color) bg-(--toolbar-bg)"
            role="search"
        >
            <div className="flex items-center gap-1 flex-1 min-w-[14rem]">
                <input
                    ref={findRef}
                    value={term}
                    onChange={e => setTerm(e.target.value)}
                    onKeyDown={e => handleKeyDown(e, () => stepMatch(editor, e.shiftKey ? -1 : 1))}
                    placeholder="Find"
                    aria-label="Find"
                    className={inputClass}
                />
                <span className="text-xs tabular-nums w-14 text-center text-[color-mix(in_srgb,var(--text-color)_50%,transparent)]" aria-live="polite">
                    {term ? (hasMatches ? `${index + 1}/${count}` : 'No results') : ''}
                </span>
                <button className={iconButtonClass(caseSensitive)} onClick={() => updateSearch(editor, { caseSensitive: !caseSensitive })} title="Match case" aria-label="Match case" aria-pressed={caseSensitive}>
                    <CaseSensitive size={16} />
                </button>
                <button className={iconButtonClass()} onClick={() => stepMatch(editor, -1)} disabled={!hasMatches} title="Previous match (Shift+Enter)" aria-label="Previous match">
                    <ChevronUp size={16} />
                </button>
                <button className={iconButtonClass()} onClick={() => stepMatch(editor, 1)} disabled={!hasMatches} title="Next match (Enter)" aria-label="Next match">
                    <ChevronDown size={16} />
                </button>
            </div>
            <div className="flex items-center gap-1 flex-1 min-w-[14rem]">
                <input
                    value={replacement}
                    onChange={e => setReplacement(e.target.value)}
                    onKeyDown={e => handleKeyDown(e, () => replaceCurrent(editor, replacement))}
                    placeholder="Replace"
                    aria-label="Replace with"
                    className={inputClass}
                />
                <button className={iconButtonClass()} onClick={() => replaceCurrent(editor, replacement)} disabled={!hasMatches} title="Replace" aria-label="Replace">
                    <Replace size={16} />
                </button>
                <button className={iconButtonClass()} onClick={() => replaceAll(editor, replacement)} disabled={!hasMatches} title="Replace all" aria-label="Replace all">
                    <ReplaceAll size={16} />
                </button>
                <button className={iconButtonClass()} onClick={close} title="Close (Esc)" aria-label="Close find">
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}
