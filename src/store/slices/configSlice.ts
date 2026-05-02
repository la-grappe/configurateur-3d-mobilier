/**
 * Config Store Slice
 * 
 * Manages all configuration-related state:
 * - standWidth, standDepth
 * - theme (dark/light)
 */

export interface ConfigState {
    standWidth: number;
    standDepth: number;
    setStandSize: (width: number, depth: number) => void;
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
}

export const createConfigSlice = (set: any): ConfigState => ({
    standWidth: 300,
    standDepth: 300,
    setStandSize: (width, depth) => set({ standWidth: width, standDepth: depth }),

    theme: 'dark',
    setTheme: (theme: 'light' | 'dark') => set({ theme }),
});