# NotePad

A browser notepad with two editors:

- **Text mode**: rich-text editing with headings, lists, alignment, colors, highlight, and find & replace (Tiptap / ProseMirror).
- **Markdown mode**: a Markdown source editor with a live preview that scrolls with it (CodeMirror + react-markdown).

## Features

- **Multiple documents**: tabs above the editor. Each tab is titled from its first line. Closing a tab can be undone.
- **Autosave**: saves 1 second after you stop typing, and also when you switch documents or modes or close the tab.
- **Where notes are kept** (toggle in the status bar):
  - *This tab only* (default): notes live in `sessionStorage`. They survive a reload but are lost when the tab closes, and the browser asks before closing a tab that has notes.
  - *Kept on device*: notes live in `localStorage` and survive closing the browser.
- **Open** `.txt` / `.md` files. Each file opens in a new document. In Text mode, Markdown is converted to rich text.
- **Export** to `.txt`, `.md` (Text mode converts to Markdown), or PDF (always printed in light colors).
- **Copy as plain text**: one line per line, with list markers (`- `, `1. `) kept.
- **Clear document**, with undo.
- **Theme**: Light, Dark, or System (follows the OS).
- **Focus mode**: hides the chrome around the editor.

## Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl/Cmd + F` | Find & replace in the current editor |
| `Ctrl/Cmd + Shift + F` | Toggle focus mode |
| `Esc` | Exit focus mode / close find bar |
| `Ctrl/Cmd + Shift + E` | Export as `.txt` |
| `Ctrl/Cmd + B / I / U` | Bold / italic / underline |

## Development

```bash
npm install
npm run dev        # start Vite dev server
npm test           # run unit tests (Vitest)
npm run lint       # ESLint
npm run build      # typecheck + production build
```

## Project layout

```
src/
  App.tsx                     app shell: documents, export/import, shortcuts, toasts
  types.ts                    shared types (EditorHandle, modes, formats)
  components/
    common/                   Navbar, StatusBar, DocumentTabs, Toast, theme
    text-mode/                Tiptap editor, toolbar, find & replace
    markdown-mode/            CodeMirror editor, preview, toolbar
  hooks/                      useDocuments, useDocumentStats, useLocalStorage
  utils/
    storage.ts                session vs device storage, document keys
    plainText.ts              ProseMirror → plain text (clipboard, export, stats)
    importUtils.ts            file import helpers, document titles
    exportUtils.ts            file download, PDF export
```
