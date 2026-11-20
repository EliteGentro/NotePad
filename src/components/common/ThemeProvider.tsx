import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ThemeContext, type Theme, type ThemePreference } from './theme';

const THEME_KEY = 'notepad-theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';
const NEXT: Record<ThemePreference, ThemePreference> = { light: 'dark', dark: 'system', system: 'light' };

function getStoredPreference(): ThemePreference {
    try {
        const stored = localStorage.getItem(THEME_KEY);
        if (stored === 'light' || stored === 'dark') return stored;
    } catch {
        // Ignore
    }
    return 'system';
}

const getSystemTheme = (): Theme => (window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light');

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [preference, setPreference] = useState<ThemePreference>(getStoredPreference);
    const [systemTheme, setSystemTheme] = useState<Theme>(getSystemTheme);
    const theme = preference === 'system' ? systemTheme : preference;

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
    }, [theme]);

    // Track OS theme changes; they only apply while the preference is 'system'.
    useEffect(() => {
        const mq = window.matchMedia(DARK_QUERY);
        const handler = (e: MediaQueryListEvent) => setSystemTheme(e.matches ? 'dark' : 'light');
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    // Only an explicit user choice is stored, so 'system' keeps following the OS.
    const cyclePreference = useCallback(() => {
        const next = NEXT[preference];
        try {
            if (next === 'system') localStorage.removeItem(THEME_KEY);
            else localStorage.setItem(THEME_KEY, next);
        } catch {
            // Ignore
        }
        setPreference(next);
    }, [preference]);

    const value = useMemo(() => ({ theme, preference, cyclePreference }), [theme, preference, cyclePreference]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
