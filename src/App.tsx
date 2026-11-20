import { lazy, Suspense, useState, useRef, useCallback, useEffect } from 'react';
import { ThemeProvider } from './components/common/ThemeProvider';
import { Navbar } from './components/common/Navbar';
import { StatusBar } from './components/common/StatusBar';
import { DocumentTabs } from './components/common/DocumentTabs';
import { Toast, type ToastData } from './components/common/Toast';
import { TextMode } from './components/text-mode/TextMode';
import { useDocumentStats } from './hooks/useDocumentStats';
import { useDocuments, UNTITLED } from './hooks/useDocuments';
import { useLocalStorage } from './hooks/useLocalStorage';
import { downloadFile, exportToPdf } from './utils/exportUtils';
import { MAX_IMPORT_BYTES, deriveTitle, detectImportFormat } from './utils/importUtils';
import { isPersistent, setPersistent } from './utils/storage';
import {
  NOOP_EDITOR_HANDLE,
  type EditorHandle,
  type EditorMode,
  type ExportFormat,
  type PendingImport,
  type SaveStatus,
} from './types';

// CodeMirror + react-markdown are only needed in Markdown mode: load them on demand.
const MarkdownMode = lazy(() =>
  import('./components/markdown-mode/MarkdownMode').then(m => ({ default: m.MarkdownMode })),
);

function AppContent() {
  const [mode, setMode] = useLocalStorage<EditorMode>('notepad-mode', 'text');
  const [focusMode, setFocusMode] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus | null>(null);
  const [persistent, setPersistentState] = useState(isPersistent);
  const [pendingImport, setPendingImport] = useState<PendingImport | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const editorRef = useRef<EditorHandle>(NOOP_EDITOR_HANDLE);
  const { docs, activeId, setActiveId, createDoc, closeDoc, setTitle, reload } = useDocuments();

  const stats = useDocumentStats(currentText);

  // Clearing is undone through the editor instance, so its toast belongs to one doc + mode.
  const editorScope = `${activeId}:${mode}`;

  const showToast = useCallback((message: string, action?: { label: string; run: () => void }, scope?: string) => {
    setToast({ id: Date.now(), message, actionLabel: action?.label, onAction: action?.run, scope });
  }, []);
  const dismissToast = useCallback(() => setToast(null), []);

  const handleTextChange = useCallback((text: string) => {
    setCurrentText(text);
    const title = deriveTitle(text);
    if (title) setTitle(activeId, title);
  }, [activeId, setTitle]);

  const handleSaved = useCallback((ok: boolean) => {
    setSaveStatus({ at: new Date(), ok });
  }, []);

  const handleExport = useCallback(async (format: ExportFormat) => {
    const timestamp = new Date().toISOString().slice(0, 10);
    const basename = `NotePad_${mode}_${timestamp}`;

    if (format === 'pdf') {
      await exportToPdf(editorRef.current.getPdfElementId(), `${basename}.pdf`);
    } else {
      const content = editorRef.current.getContent(format);
      const type = format === 'md' ? 'text/markdown' : 'text/plain';
      downloadFile(`${basename}.${format}`, content, type);
    }
  }, [mode]);

  const toggleFocusMode = useCallback(() => {
    setFocusMode(prev => !prev);
  }, []);

  const handleClear = useCallback(() => {
    const restore = editorRef.current.clear();
    const docId = activeId;
    const previousTitle = docs.find(d => d.id === docId)?.title ?? UNTITLED;
    setTitle(docId, UNTITLED);
    showToast('Document cleared', {
      label: 'Undo',
      run: () => {
        restore();
        setTitle(docId, previousTitle);
      },
    }, editorScope);
  }, [activeId, docs, setTitle, showToast, editorScope]);

  const handleCloseDoc = useCallback((id: string) => {
    if (id === activeId) editorRef.current.flush();
    const title = docs.find(d => d.id === id)?.title ?? UNTITLED;
    const restore = closeDoc(id);
    showToast(`Closed “${title}”`, { label: 'Undo', run: restore });
  }, [activeId, docs, closeDoc, showToast]);

  const handleCreateDoc = useCallback(() => {
    editorRef.current.flush();
    createDoc();
  }, [createDoc]);

  const handleSelectDoc = useCallback((id: string) => {
    if (id === activeId) return;
    editorRef.current.flush();
    setActiveId(id);
  }, [activeId, setActiveId]);

  const handleOpenFile = useCallback(async (file: File) => {
    if (file.size > MAX_IMPORT_BYTES) {
      showToast(`“${file.name}” is too large to open (max 2 MB)`);
      return;
    }
    try {
      const content = await file.text();
      editorRef.current.flush();
      const docId = createDoc();
      setPendingImport({ docId, content, format: detectImportFormat(file.name) });
    } catch {
      showToast(`Could not read “${file.name}”`);
    }
  }, [createDoc, showToast]);

  const handleImportApplied = useCallback(() => setPendingImport(null), []);

  const handleTogglePersistent = useCallback(() => {
    editorRef.current.flush();
    const next = !persistent;
    if (!setPersistent(next)) {
      showToast('Could not change where notes are saved (storage unavailable or full)');
      return;
    }
    setPersistentState(next);
    reload();
    showToast(next ? 'Notes will be kept on this device' : 'Notes will be kept in this tab only');
  }, [persistent, reload, showToast]);

  // Warn before closing the tab when notes would be lost (tab-only storage).
  useEffect(() => {
    if (persistent) return;
    const hasContent = currentText.trim() !== '' || docs.some(d => d.title !== UNTITLED);
    if (!hasContent) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ''; // older browsers only show the prompt when this is set
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [persistent, currentText, docs]);

  // Global keyboard shortcuts. Use e.code: with Shift held, e.key is uppercase ('F'),
  // so comparing e.key to 'f' never matched on Windows/Linux.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape exits focus mode
      if (e.key === 'Escape' && focusMode) {
        setFocusMode(false);
        return;
      }
      const mod = e.metaKey || e.ctrlKey;
      // Ctrl/Cmd + Shift + F = toggle focus mode
      if (mod && e.shiftKey && e.code === 'KeyF') {
        e.preventDefault();
        toggleFocusMode();
        return;
      }
      // Ctrl/Cmd + Shift + E = export as txt
      if (mod && e.shiftKey && e.code === 'KeyE') {
        e.preventDefault();
        handleExport('txt');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusMode, toggleFocusMode, handleExport]);

  const modeProps = {
    docId: activeId,
    editorRef,
    onTextChange: handleTextChange,
    onSaved: handleSaved,
    pendingImport,
    onImportApplied: handleImportApplied,
  };

  return (
    <div className={`h-dvh flex flex-col overflow-hidden transition-colors duration-200 ${focusMode ? 'focus-mode' : ''}`}>
      <Navbar
        mode={mode}
        setMode={setMode}
        onExport={handleExport}
        onOpenFile={handleOpenFile}
        onClear={handleClear}
        focusMode={focusMode}
        onToggleFocusMode={toggleFocusMode}
      />

      <main className={`flex-1 min-h-0 w-full max-w-7xl mx-auto px-3 pb-3 sm:px-5 sm:pb-5 lg:px-6 lg:pb-6 flex flex-col transition-all duration-300 ${focusMode ? 'pt-3 max-w-5xl' : 'pt-16'}`}>
        {!focusMode && (
          <DocumentTabs
            docs={docs}
            activeId={activeId}
            onSelect={handleSelectDoc}
            onCreate={handleCreateDoc}
            onClose={handleCloseDoc}
          />
        )}
        {mode === 'text' ? (
          <TextMode key={activeId} {...modeProps} />
        ) : (
          <Suspense fallback={<div className="flex-1 rounded-xl border border-(--border-color) bg-(--bg-color)" />}>
            <MarkdownMode key={activeId} {...modeProps} />
          </Suspense>
        )}
      </main>

      <StatusBar
        stats={stats}
        saveStatus={saveStatus}
        mode={mode}
        persistent={persistent}
        onTogglePersistent={handleTogglePersistent}
      />
      <Toast
        key={toast?.id}
        toast={toast?.scope && toast.scope !== editorScope ? null : toast}
        onDismiss={dismissToast}
      />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
