import { Extension, type Editor } from '@tiptap/core';
import type { Node as PMNode } from '@tiptap/pm/model';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export interface SearchMatch {
    from: number;
    to: number;
}

interface SearchState {
    term: string;
    caseSensitive: boolean;
    matches: SearchMatch[];
    index: number;
    decorations: DecorationSet;
}

type SearchMeta = Partial<Pick<SearchState, 'term' | 'caseSensitive' | 'index'>>;

export const searchPluginKey = new PluginKey<SearchState>('notepadSearch');

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Finds every occurrence of `term` inside text blocks, including across mark boundaries. */
export function findMatches(doc: PMNode, term: string, caseSensitive: boolean): SearchMatch[] {
    if (!term) return [];
    const regex = new RegExp(escapeRegExp(term), caseSensitive ? 'g' : 'gi');
    const matches: SearchMatch[] = [];

    doc.descendants((node, pos) => {
        if (!node.isTextblock) return true;

        // Flatten the block's inline content, remembering the document position of each char.
        let text = '';
        const positions: number[] = [];
        node.forEach((child, offset) => {
            const start = pos + 1 + offset;
            if (child.isText && child.text) {
                for (let i = 0; i < child.text.length; i++) positions.push(start + i);
                text += child.text;
            } else {
                positions.push(start);
                text += '￼'; // inline leaf (e.g. hard break) never matches
            }
        });

        for (const m of text.matchAll(regex)) {
            if (!m[0]) continue;
            const start = m.index;
            matches.push({ from: positions[start], to: positions[start + m[0].length - 1] + 1 });
        }
        return false;
    });

    return matches;
}

function buildDecorations(doc: PMNode, matches: SearchMatch[], index: number): DecorationSet {
    if (matches.length === 0) return DecorationSet.empty;
    return DecorationSet.create(
        doc,
        matches.map((m, i) =>
            Decoration.inline(m.from, m.to, { class: i === index ? 'search-match search-match-current' : 'search-match' }),
        ),
    );
}

const wrapIndex = (index: number, count: number) => (count === 0 ? 0 : ((index % count) + count) % count);

export const SearchExtension = Extension.create({
    name: 'notepadSearch',

    addProseMirrorPlugins() {
        return [
            new Plugin<SearchState>({
                key: searchPluginKey,
                state: {
                    init: () => ({ term: '', caseSensitive: false, matches: [], index: 0, decorations: DecorationSet.empty }),
                    apply(tr, prev, _oldState, newState) {
                        const meta = tr.getMeta(searchPluginKey) as SearchMeta | undefined;
                        if (!meta && !tr.docChanged) return prev;

                        const term = meta?.term ?? prev.term;
                        const caseSensitive = meta?.caseSensitive ?? prev.caseSensitive;
                        const needsSearch = tr.docChanged || term !== prev.term || caseSensitive !== prev.caseSensitive;
                        const matches = needsSearch ? findMatches(newState.doc, term, caseSensitive) : prev.matches;
                        const index = wrapIndex(meta?.index ?? prev.index, matches.length);

                        return { term, caseSensitive, matches, index, decorations: buildDecorations(newState.doc, matches, index) };
                    },
                },
                props: {
                    decorations: state => searchPluginKey.getState(state)?.decorations,
                },
            }),
        ];
    },
});

export function getSearchState(editor: Editor) {
    return searchPluginKey.getState(editor.state);
}

function scrollToCurrent(editor: Editor) {
    const state = getSearchState(editor);
    const match = state?.matches[state.index];
    if (!match) return;
    const { node } = editor.view.domAtPos(match.from);
    const el = node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as Element);
    el?.scrollIntoView({ block: 'nearest' });
}

export function updateSearch(editor: Editor, meta: SearchMeta) {
    editor.view.dispatch(editor.state.tr.setMeta(searchPluginKey, meta));
    scrollToCurrent(editor);
}

export function stepMatch(editor: Editor, delta: 1 | -1) {
    const state = getSearchState(editor);
    if (!state) return;
    updateSearch(editor, { index: state.index + delta });
}

export function replaceCurrent(editor: Editor, replacement: string) {
    const state = getSearchState(editor);
    const match = state?.matches[state.index];
    if (!state || !match) return;
    editor.view.dispatch(editor.state.tr.insertText(replacement, match.from, match.to));

    // Move to the first match after the inserted text (so a replacement containing the term isn't re-matched).
    const after = match.from + replacement.length;
    const next = getSearchState(editor)?.matches.findIndex(m => m.from >= after) ?? -1;
    updateSearch(editor, { index: next === -1 ? 0 : next });
}

export function replaceAll(editor: Editor, replacement: string): number {
    const state = getSearchState(editor);
    if (!state || state.matches.length === 0) return 0;
    const tr = editor.state.tr;
    for (const match of [...state.matches].reverse()) tr.insertText(replacement, match.from, match.to);
    editor.view.dispatch(tr);
    return state.matches.length;
}
