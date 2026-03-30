import { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from './ThemeContext';
import { Moon, Sun, Download, FileText, FileCode, Maximize, Minimize, Trash2 } from 'lucide-react';

interface NavbarProps {
    mode: 'text' | 'markdown';
    setMode: (mode: 'text' | 'markdown') => void;
    onExport: (format: 'txt' | 'md' | 'pdf') => void;
    onClear: () => void;
    focusMode: boolean;
    onToggleFocusMode: () => void;
}

export function Navbar({ mode, setMode, onExport, onClear, focusMode, onToggleFocusMode }: NavbarProps) {
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

    // Close dropdown on Escape
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Escape') setExportOpen(false);
    }, []);

    const exportOptions = [
        { format: 'txt' as const, icon: FileText, label: 'Plain Text (.txt)' },
        { format: 'md' as const, icon: FileCode, label: 'Markdown (.md)' },
        { format: 'pdf' as const, icon: Download, label: 'PDF Document (.pdf)' },
    ];

    return (
        <nav className="navbar fixed top-0 left-0 right-0 h-14 bg-(--navbar-bg) backdrop-blur-lg border-b border-(--border-color) z-50 flex items-center justify-between px-4 sm:px-6 transition-colors duration-200">
            {/* Brand */}
            <div className="flex items-center gap-2 shrink-0">
                <div className="w-7 h-7 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm cursor-default select-none">
                    N
                </div>
                <span className="font-semibold text-base tracking-tight hidden sm:inline">NotePad</span>
            </div>

            {/* Mode Toggle */}
            <div className="flex items-center bg-(--toolbar-bg) border border-(--border-color) rounded-lg p-0.5 shadow-sm transition-colors duration-200">
                <button
                    onClick={() => setMode('text')}
                    className={`px-3 py-1 rounded-md text-sm font-medium cursor-pointer transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-(--accent-color) ${
                        mode === 'text'
                            ? 'bg-(--bg-color) text-(--accent-color) shadow-sm'
                            : 'text-[color-mix(in_srgb,var(--text-color)_50%,transparent)] hover:text-(--text-color)'
                    }`}
                    aria-pressed={mode === 'text'}
                >
                    <span className="sm:hidden">Text</span>
                    <span className="hidden sm:inline">Text Mode</span>
                </button>
                <button
                    onClick={() => setMode('markdown')}
                    className={`px-3 py-1 rounded-md text-sm font-medium cursor-pointer transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-(--accent-color) ${
                        mode === 'markdown'
                            ? 'bg-(--bg-color) text-(--accent-color) shadow-sm'
                            : 'text-[color-mix(in_srgb,var(--text-color)_50%,transparent)] hover:text-(--text-color)'
                    }`}
                    aria-pressed={mode === 'markdown'}
                >
                    <span className="sm:hidden">MD</span>
                    <span className="hidden sm:inline">Markdown</span>
                </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                {/* Clear button */}
                <button
                    onClick={onClear}
                    className="p-2 rounded-lg cursor-pointer hover:bg-red-500/10 text-[color-mix(in_srgb,var(--text-color)_50%,transparent)] hover:text-red-500 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 border border-transparent hover:border-red-500/20"
                    aria-label="Clear all content"
                    title="Clear all content"
                >
                    <Trash2 size={17} />
                </button>

                {/* Focus mode toggle */}
                <button
                    onClick={onToggleFocusMode}
                    className="p-2 rounded-lg cursor-pointer hover:bg-(--toolbar-bg) text-[color-mix(in_srgb,var(--text-color)_50%,transparent)] hover:text-(--text-color) transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-(--accent-color) border border-transparent hover:border-(--border-color)"
                    aria-label={focusMode ? 'Exit focus mode' : 'Enter focus mode'}
                    title={focusMode ? 'Exit focus mode (Esc)' : 'Focus mode'}
                >
                    {focusMode ? <Minimize size={17} /> : <Maximize size={17} />}
                </button>

                {/* Export dropdown */}
                <div className="relative" ref={dropdownRef} onKeyDown={handleKeyDown}>
                    <button
                        onClick={() => setExportOpen(!exportOpen)}
                        className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-(--toolbar-bg) transition-colors duration-150 border border-transparent hover:border-(--border-color) font-medium text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-(--accent-color)"
                        aria-label="Export document"
                        aria-expanded={exportOpen}
                        aria-haspopup="true"
                    >
                        <Download size={17} />
                        <span className="hidden sm:inline">Export</span>
                    </button>

                    {exportOpen && (
                        <div
                            className="absolute right-0 mt-1.5 w-48 bg-(--bg-color) rounded-lg shadow-lg border border-(--border-color) py-1 overflow-hidden z-50"
                            role="menu"
                        >
                            {exportOptions.map(({ format, icon: Icon, label }) => (
                                <button
                                    key={format}
                                    onClick={() => { onExport(format); setExportOpen(false); }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left cursor-pointer hover:bg-(--toolbar-bg) transition-colors duration-150"
                                    role="menuitem"
                                >
                                    <Icon size={15} className="text-[color-mix(in_srgb,var(--text-color)_40%,transparent)]" />
                                    {label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="w-px h-5 bg-(--border-color)" />

                {/* Theme toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-lg cursor-pointer hover:bg-(--toolbar-bg) text-[color-mix(in_srgb,var(--text-color)_50%,transparent)] hover:text-(--text-color) transition-colors duration-150 border border-transparent hover:border-(--border-color) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--accent-color)"
                    aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                    {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
                </button>
            </div>
        </nav>
    );
}
