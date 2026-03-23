import { useState, useRef } from 'react';
import { ThemeProvider } from './components/common/ThemeContext';
import { Navbar } from './components/common/Navbar';
import { TextMode } from './components/text-mode/TextMode';
import { MarkdownMode } from './components/markdown-mode/MarkdownMode';
import { downloadFile, exportToPdf } from './utils/exportUtils';

export interface ExporterPayload {
  getRaw: () => string;
  getHtmlId: () => string;
}

function AppContent() {
  const [mode, setMode] = useState<'text' | 'markdown'>('text');
  const exportRef = useRef<ExporterPayload>({ getRaw: () => '', getHtmlId: () => '' });

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

  return (
    <div className="min-h-screen pt-16 flex flex-col transition-colors duration-200">
      <Navbar mode={mode} setMode={setMode} onExport={handleExport} />

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
        {mode === 'text' ? <TextMode exportRef={exportRef} /> : <MarkdownMode exportRef={exportRef} />}
      </main>
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
