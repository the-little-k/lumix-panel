export type LumixThemeId = 'dark' | 'light';

const STORAGE_KEY = 'lumix-theme';

export function getStoredTheme(): LumixThemeId {
    if (typeof window === 'undefined') {
        return 'dark';
    }
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'light' ? 'light' : 'dark';
}

export function setStoredTheme(theme: LumixThemeId): void {
    localStorage.setItem(STORAGE_KEY, theme);
}

export function applyLumixTheme(theme: LumixThemeId): void {
    if (typeof document === 'undefined') {
        return;
    }
    document.documentElement.dataset.theme = theme;
}
