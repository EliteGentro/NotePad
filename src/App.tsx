import { useState, useRef, useCallback, useEffect } from 'react';
import { ThemeProvider } from './components/common/ThemeContext';
import { Navbar } from './components/common/Navbar';
import { StatusBar } from './components/common/StatusBar';
import { TextMode } from './components/text-mode/TextMode';
import { MarkdownMode } from './components/markdown-mode/MarkdownMode';
import { useDocumentStats } from './hooks/useDocumentStats';
import { useLocalStorage } from './hooks/useLocalStorage';
import { downloadFile, exportToPdf } from './utils/exportUtils';

export interface ExporterPayload {
  getRaw: () => string;
  getHtmlId: () => string;
  clear: () => void;
}

function AppContent() {
  const [mode, setMode] = useLocalStorage<'text' | 'markdown'>('notepad-mode', 'text');
  const [focusMode, setFocusMode] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const exportRef = useRef<ExporterPayload>({ getRaw: () => '', getHtmlId: () => '', clear: () => {} });

  const stats = useDocumentStats(currentText);

  const handleTextChange = useCallback((text: string) => {
    setCurrentText(text);
    setLastSaved(new Date());
  }, []);

  const handleExport = async (format: 'txt' | 'md' | 'pdf') => {
    const rawContent = exportRef.current.getRaw();
    const htmlId = exportRef.current.getHtmlId();
    const timestamp = new Date().toISOString().slice(0, 10);
    const basename = `NotePad_${mode}_${timestamp}`;

    if (format === 'txt') {
      await downloadFile(`${basename}.txt`, rawContent, 'text/plain');
    } else if (format === 'md') {
      await downloadFile(`${basename}.md`, rawContent, 'text/markdown');
    } else if (format === 'pdf') {
      await exportToPdf(htmlId, `${basename}.pdf`);
    }
  };

  const toggleFocusMode = useCallback(() => {
    setFocusMode(prev => !prev);
  }, []);

  const handleClear = useCallback(() => {
    exportRef.current.clear();
    setCurrentText('');
    setLastSaved(null);
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape exits focus mode
      if (e.key === 'Escape' && focusMode) {
        setFocusMode(false);
        return;
      }
      // Ctrl/Cmd + Shift + F = toggle focus mode
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'f') {
        e.preventDefault();
        toggleFocusMode();
        return;
      }
      // Ctrl/Cmd + Shift + E = export as txt
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'e') {
        e.preventDefault();
        handleExport('txt');
        return;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusMode, toggleFocusMode]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${focusMode ? 'focus-mode' : ''}`}>
      <Navbar
        mode={mode}
        setMode={setMode}
        onExport={handleExport}
        onClear={handleClear}
        focusMode={focusMode}
        onToggleFocusMode={toggleFocusMode}
      />

      <main className={`flex-1 w-full max-w-7xl mx-auto px-3 pb-3 sm:px-5 sm:pb-5 lg:px-6 lg:pb-6 flex flex-col transition-all duration-300 ${focusMode ? 'pt-3 max-w-5xl' : 'pt-14'}`}>
        {mode === 'text'
          ? <TextMode exportRef={exportRef} onTextChange={handleTextChange} />
          : <MarkdownMode exportRef={exportRef} onTextChange={handleTextChange} />
        }
      </main>

      <StatusBar stats={stats} lastSaved={lastSaved} mode={mode} />
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
