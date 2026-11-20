import { useState, useRef, useEffect, useCallback, type ChangeEvent } from 'react';
import { useTheme, type ThemePreference } from './theme';
import { Moon, Sun, Monitor, Download, FileText, FileCode, FolderOpen, Maximize, Minimize, Trash2 } from 'lucide-react';
import type { EditorMode, ExportFormat } from '../../types';
import { IMPORT_ACCEPT } from '../../utils/importUtils';

const THEME_LABELS: Record<ThemePreference, string> = { light: 'Light', dark: 'Dark', system: 'System' };
const THEME_ICONS = { light: Sun, dark: Moon, system: Monitor } as const;
const NEXT_THEME: Record<ThemePreference, ThemePreference> = { light: 'dark', dark: 'system', system: 'light' };

interface NavbarProps {
    mode: EditorMode;
    setMode: (mode: EditorMode) => void;
    onExport: (format: ExportFormat) => void;
    onOpenFile: (file: File) => void;
    onClear: () => void;
    focusMode: boolean;
    onToggleFocusMode: () => void;
}

export function Navbar({ mode, setMode, onExport, onOpenFile, onClear, focusMode, onToggleFocusMode }: NavbarProps) {
    const { preference, cyclePreference } = useTheme();
    const ThemeIcon = THEME_ICONS[preference];
    const [exportOpen, setExportOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = ''; // allow re-opening the same file
        if (file) onOpenFile(file);
    };

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
        { format: 'md' as const, icon: FileCode, label: mode === 'text' ? 'Markdown (converted, .md)' : 'Markdown (.md)' },
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
                {/* Open file */}
                <input ref={fileInputRef} type="file" accept={IMPORT_ACCEPT} onChange={handleFileChange} className="hidden" />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-lg cursor-pointer hover:bg-(--toolbar-bg) text-[color-mix(in_srgb,var(--text-color)_50%,transparent)] hover:text-(--text-color) transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-(--accent-color) border border-transparent hover:border-(--border-color)"
                    aria-label="Open a .txt or .md file"
                    title="Open .txt / .md file (opens in a new document)"
                >
                    <FolderOpen size={17} />
                </button>

                {/* Clear button */}
                <button
                    onClick={onClear}
                    className="p-2 rounded-lg cursor-pointer hover:bg-red-500/10 text-[color-mix(in_srgb,var(--text-color)_50%,transparent)] hover:text-red-500 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 border border-transparent hover:border-red-500/20"
                    aria-label="Clear document"
                    title="Clear document (can be undone)"
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
                            className="absolute right-0 mt-1.5 w-56 bg-(--bg-color) rounded-lg shadow-lg border border-(--border-color) py-1 overflow-hidden z-50"
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

                {/* Theme: light → dark → system */}
                <button
                    onClick={cyclePreference}
                    className="p-2 rounded-lg cursor-pointer hover:bg-(--toolbar-bg) text-[color-mix(in_srgb,var(--text-color)_50%,transparent)] hover:text-(--text-color) transition-colors duration-150 border border-transparent hover:border-(--border-color) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--accent-color)"
                    aria-label={`Theme: ${THEME_LABELS[preference]}. Switch to ${THEME_LABELS[NEXT_THEME[preference]]}`}
                    title={`Theme: ${THEME_LABELS[preference]} (click for ${THEME_LABELS[NEXT_THEME[preference]]})`}
                >
                    <ThemeIcon size={17} />
                </button>
            </div>
        </nav>
    );
}
