export type ThemeMode = 'light' | 'dark' | 'auto';

export const THEME_SEQ: ThemeMode[] = ['light', 'dark', 'auto'];

export const getStoredTheme = (): ThemeMode => {
	const stored = localStorage.getItem('theme');
	if (stored === 'light' || stored === 'dark' || stored === 'auto') return stored;
	return 'auto';
};

export const applyThemeToDocument = (theme: ThemeMode): void => {
	const resolved =
		theme === 'auto'
			? window.matchMedia('(prefers-color-scheme: dark)').matches
				? 'dark'
				: 'light'
			: theme;

	document.documentElement.classList.toggle('dark', resolved === 'dark');
	document.documentElement.style.colorScheme = resolved === 'dark' ? 'dark' : 'light';
};

export const setTheme = (theme: ThemeMode): void => {
	localStorage.setItem('theme', theme);
	applyThemeToDocument(theme);
};
