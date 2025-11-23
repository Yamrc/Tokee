import { LIGHT_MODE, DARK_MODE, AUTO_MODE, DEFAULT_THEME, type ThemeMode } from '@shared/constants/theme';

export const applyThemeToDocument = (theme: ThemeMode): void => {
	switch (theme) {
		case LIGHT_MODE:
			document.documentElement.classList.remove('dark');
			break;
		case DARK_MODE:
			document.documentElement.classList.add('dark');
			break;
		case AUTO_MODE:
			if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
				document.documentElement.classList.add('dark');
			} else {
				document.documentElement.classList.remove('dark');
			}
			break;
	}
};

export const setTheme = (theme: ThemeMode): void => {
	localStorage.setItem('theme', theme);
	applyThemeToDocument(theme);
};

export const getStoredTheme = (): ThemeMode => {
	return (localStorage.getItem('theme') as ThemeMode) || DEFAULT_THEME;
};

