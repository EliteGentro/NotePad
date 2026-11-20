import { AlertTriangle, Check, Clock, HardDrive, PanelTop } from 'lucide-react';
import type { DocumentStats } from '../../hooks/useDocumentStats';
import type { EditorMode, SaveStatus } from '../../types';

interface StatusBarProps {
  stats: DocumentStats;
  saveStatus: SaveStatus | null;
  mode: EditorMode;
  persistent: boolean;
  onTogglePersistent: () => void;
}

export function StatusBar({ stats, saveStatus, mode, persistent, onTogglePersistent }: StatusBarProps) {
  const time = saveStatus?.at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const PersistIcon = persistent ? HardDrive : PanelTop;

  return (
    <div className="status-bar shrink-0 flex items-center justify-between px-4 py-1.5 text-xs border-t border-(--border-color) bg-(--toolbar-bg) text-[color-mix(in_srgb,var(--text-color)_50%,transparent)] select-none transition-colors duration-200">
      <div className="flex items-center gap-3">
        <span>{stats.words} {stats.words === 1 ? 'word' : 'words'}</span>
        <span className="hidden sm:inline">{stats.characters} chars</span>
        <span className="hidden sm:inline-flex items-center gap-1">
          <Clock size={11} />
          {stats.readingTime} read
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="capitalize hidden sm:inline">{mode}</span>
        <button
          onClick={onTogglePersistent}
          className="flex items-center gap-1 px-1.5 py-0.5 -my-0.5 rounded cursor-pointer hover:text-(--text-color) hover:bg-(--bg-color) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--accent-color)"
          title={
            persistent
              ? 'Notes are kept on this device after closing the tab. Click to keep them in this tab only.'
              : 'Notes are kept in this tab only and are lost when it closes. Click to keep them on this device.'
          }
          aria-pressed={persistent}
        >
          <PersistIcon size={11} />
          <span className="hidden sm:inline">{persistent ? 'Kept on device' : 'This tab only'}</span>
        </button>
        {saveStatus && !saveStatus.ok ? (
          <span className="flex items-center gap-1 text-red-500" role="alert">
            <AlertTriangle size={11} />
            Save failed (storage full?)
          </span>
        ) : (
          <span className="flex items-center gap-1">
            {saveStatus && <Check size={11} />}
            {saveStatus ? `Saved ${time}` : 'Not saved yet'}
          </span>
        )}
      </div>
    </div>
  );
}
