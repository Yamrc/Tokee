export const LIGHT_MODE = 'light';
export const DARK_MODE = 'dark';
export const AUTO_MODE = 'auto';
export const DEFAULT_THEME: typeof AUTO_MODE = AUTO_MODE;

export type ThemeMode = typeof LIGHT_MODE | typeof DARK_MODE | typeof AUTO_MODE;

