import { Component, createSignal, onMount, onCleanup, Show } from 'solid-js';
import { Icon } from '@iconify-icon/solid';
import { LIGHT_MODE, DARK_MODE, AUTO_MODE, type ThemeMode } from '@shared/constants/theme';
import { getStoredTheme, setTheme, applyThemeToDocument } from '@shared/utils/theme';

const themeSequence: ThemeMode[] = [LIGHT_MODE, DARK_MODE, AUTO_MODE];

const DarkModeToggle: Component = () => {
	const [mode, setMode] = createSignal<ThemeMode>(AUTO_MODE);

	onMount(() => {
		const storedTheme = getStoredTheme();
		setMode(storedTheme);

		const darkModePreference = window.matchMedia('(prefers-color-scheme: dark)');
		const handleChange = (): void => {
			applyThemeToDocument(mode());
		};
		darkModePreference.addEventListener('change', handleChange);
		onCleanup(() => darkModePreference.removeEventListener('change', handleChange));
	});

	const switchTheme = (newMode: ThemeMode): void => {
		setMode(newMode);
		setTheme(newMode);
	};

	const toggleTheme = (): void => {
		const currentIndex = themeSequence.indexOf(mode());
		const nextIndex = (currentIndex + 1) % themeSequence.length;
		switchTheme(themeSequence[nextIndex]);
	};

	return (
		<button
			aria-label="切换主题"
			class="btn-plain scale-animation rounded-lg h-11 w-11 active:scale-90 flex items-center justify-center theme-toggle-btn text-90"
			onClick={toggleTheme}
		>
			<Show when={mode() === LIGHT_MODE}>
				<Icon icon="material-symbols:wb-sunny-outline-rounded" class="text-[1.25rem]" />
			</Show>
			<Show when={mode() === DARK_MODE}>
				<Icon icon="material-symbols:dark-mode-outline-rounded" class="text-[1.25rem]" />
			</Show>
			<Show when={mode() === AUTO_MODE}>
				<Icon icon="material-symbols:radio-button-partial-outline" class="text-[1.25rem]" />
			</Show>
		</button>
	);
};

export default DarkModeToggle;
