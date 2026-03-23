import { useState, useRef, useEffect } from 'react';
import { useTheme } from './ThemeContext';
import { Moon, Sun, Download, FileText, FileCode } from 'lucide-react';

interface NavbarProps {
    mode: 'text' | 'markdown';
    setMode: (mode: 'text' | 'markdown') => void;
    onExport: (format: 'txt' | 'md' | 'pdf') => void;
}

export function Navbar({ mode, setMode, onExport }: NavbarProps) {
    const { theme, toggleTheme } = useTheme();
    const [exportOpen, setExportOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setExportOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <nav className="fixed top-0 left-0 right-0 h-16 bg-[var(--navbar-bg)] backdrop-blur-md border-b border-[var(--border-color)] z-50 flex items-center justify-between px-6 transition-colors duration-200">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-md cursor-default">
                    N
                </div>
                <span className="font-semibold text-lg tracking-tight ml-2">NotePad</span>
            </div>

            <div className="flex items-center bg-[var(--toolbar-bg)] border border-[var(--border-color)] rounded-lg p-1 shadow-sm transition-colors duration-200">
                <button
                    onClick={() => setMode('text')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${mode === 'text' ? 'bg-[var(--bg-color)] text-[var(--accent-color)] shadow-sm' : 'text-gray-500 hover:text-[var(--text-color)]'}`}
                >
                    Text Mode
                </button>
                <button
                    onClick={() => setMode('markdown')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${mode === 'markdown' ? 'bg-[var(--bg-color)] text-[var(--accent-color)] shadow-sm' : 'text-gray-500 hover:text-[var(--text-color)]'}`}
                >
                    Markdown Mode
                </button>
            </div>

            <div className="flex items-center gap-3">
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setExportOpen(!exportOpen)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--toolbar-bg)] transition-colors border border-transparent hover:border-[var(--border-color)] font-medium text-sm"
                        aria-label="Export document"
                    >
                        <Download size={18} />
                        <span className="hidden sm:inline">Export</span>
                    </button>

                    {exportOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-color)] rounded-lg shadow-lg border border-[var(--border-color)] py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                            <button
                                onClick={() => { onExport('txt'); setExportOpen(false); }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-[var(--toolbar-bg)] transition-colors"
                            >
                                <FileText size={16} className="text-gray-500" />
                                Plain Text (.txt)
                            </button>
                            <button
                                onClick={() => { onExport('md'); setExportOpen(false); }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-[var(--toolbar-bg)] transition-colors"
                            >
                                <FileCode size={16} className="text-gray-500" />
                                Markdown (.md)
                            </button>
                            <button
                                onClick={() => { onExport('pdf'); setExportOpen(false); }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-[var(--toolbar-bg)] transition-colors"
                            >
                                <Download size={16} className="text-gray-500" />
                                PDF Document (.pdf)
                            </button>
                        </div>
                    )}
                </div>

                <div className="w-px h-6 bg-[var(--border-color)] mx-1"></div>

                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full hover:bg-[var(--toolbar-bg)] text-gray-500 hover:text-[var(--text-color)] transition-colors border border-transparent hover:border-[var(--border-color)]"
                    aria-label="Toggle theme"
                >
                    {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                </button>
            </div>
        </nav>
    );
}
