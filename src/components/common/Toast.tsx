import { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ToastData {
    id: number;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
    /** When set, the toast only shows while this editor scope (doc + mode) is active. */
    scope?: string;
}

const TOAST_DURATION = 6000;

export function Toast({ toast, onDismiss }: { toast: ToastData | null; onDismiss: () => void }) {
    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(onDismiss, TOAST_DURATION);
        return () => clearTimeout(timer);
    }, [toast, onDismiss]);

    if (!toast) return null;

    return (
        <div
            role="status"
            aria-live="polite"
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 pl-4 pr-2 py-2 rounded-lg shadow-lg border border-(--border-color) bg-(--bg-color) text-sm max-w-[calc(100vw-2rem)]"
        >
            <span className="truncate">{toast.message}</span>
            {toast.actionLabel && toast.onAction && (
                <button
                    onClick={() => { toast.onAction?.(); onDismiss(); }}
                    className="shrink-0 px-2 py-1 rounded-md font-medium text-(--accent-color) hover:bg-(--toolbar-bg) cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-(--accent-color)"
                >
                    {toast.actionLabel}
                </button>
            )}
            <button
                onClick={onDismiss}
                className="shrink-0 p-1 rounded-md cursor-pointer text-[color-mix(in_srgb,var(--text-color)_50%,transparent)] hover:text-(--text-color) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--accent-color)"
                aria-label="Dismiss"
            >
                <X size={14} />
            </button>
        </div>
    );
}
