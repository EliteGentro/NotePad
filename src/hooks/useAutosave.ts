import { useEffect, useRef, useState, useCallback } from 'react';

const AUTOSAVE_DELAY = 1000;

export function useAutosave(key: string, content: string, setContent: (val: string) => void) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const isInitialLoad = useRef(true);

  // Load on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved !== null) {
        setContent(saved);
      }
    } catch {
      // Ignore
    }
    isInitialLoad.current = false;
  }, [key, setContent]);

  // Autosave on content change (debounced)
  useEffect(() => {
    if (isInitialLoad.current) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(key, content);
        setLastSaved(new Date());
      } catch {
        // Storage full
      }
    }, AUTOSAVE_DELAY);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [key, content]);

  const clearSaved = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setLastSaved(null);
    } catch {
      // Ignore
    }
  }, [key]);

  return { lastSaved, clearSaved };
}
