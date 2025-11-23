import { createSignal, onMount, onCleanup, Accessor } from 'solid-js';

export const useMediaQuery = (query: string): Accessor<boolean> => {
	const [matches, setMatches] = createSignal(window.matchMedia(query).matches);

	onMount(() => {
		const mediaQuery = window.matchMedia(query);
		const handleChange = (): void => {
			setMatches(mediaQuery.matches);
		};
		mediaQuery.addEventListener('change', handleChange);
		onCleanup(() => mediaQuery.removeEventListener('change', handleChange));
	});

	return matches;
};
