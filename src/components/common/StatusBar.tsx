import { Check, Clock } from 'lucide-react';
import type { DocumentStats } from '../../hooks/useDocumentStats';

interface StatusBarProps {
  stats: DocumentStats;
  lastSaved: Date | null;
  mode: 'text' | 'markdown';
}

export function StatusBar({ stats, lastSaved, mode }: StatusBarProps) {
  const savedLabel = lastSaved
    ? `Saved ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : 'Not saved yet';

  return (
    <div className="status-bar flex items-center justify-between px-4 py-1.5 text-xs border-t border-(--border-color) bg-(--toolbar-bg) text-[color-mix(in_srgb,var(--text-color)_50%,transparent)] select-none transition-colors duration-200">
      <div className="flex items-center gap-3">
        <span>{stats.words} {stats.words === 1 ? 'word' : 'words'}</span>
        <span className="hidden sm:inline">{stats.characters} chars</span>
        <span className="hidden sm:inline-flex items-center gap-1">
          <Clock size={11} />
          {stats.readingTime} read
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="capitalize hidden sm:inline">{mode}</span>
        <span className="flex items-center gap-1">
          {lastSaved && <Check size={11} />}
          {savedLabel}
        </span>
      </div>
    </div>
  );
}
