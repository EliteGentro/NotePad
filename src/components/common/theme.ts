import { createContext, useContext } from 'react';

export type Theme = 'light' | 'dark';
/** What the user picked. 'system' follows the OS setting. */
export type ThemePreference = Theme | 'system';

export interface ThemeContextType {
    /** The theme actually applied (system preference resolved). */
    theme: Theme;
    preference: ThemePreference;
    /** Cycles light → dark → system. */
    cyclePreference: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
