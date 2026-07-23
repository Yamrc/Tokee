<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '@iconify/svelte';
	import { applyThemeToDocument, getStoredTheme, setTheme, THEME_SEQ, type ThemeMode } from '@lib/theme';

	let mode: ThemeMode = $state('auto');

	onMount(() => {
		mode = getStoredTheme();
		applyThemeToDocument(mode);

		const darkModePreference = window.matchMedia('(prefers-color-scheme: dark)');
		const onSchemeChange = (): void => {
			applyThemeToDocument(mode);
		};

		darkModePreference.addEventListener('change', onSchemeChange);
		return () => darkModePreference.removeEventListener('change', onSchemeChange);
	});

	const switchScheme = (newMode: ThemeMode): void => {
		mode = newMode;
		setTheme(newMode);
	};

	const toggleScheme = (): void => {
		const index = THEME_SEQ.indexOf(mode);
		const next = THEME_SEQ[(index + 1) % THEME_SEQ.length] ?? 'auto';
		switchScheme(next);
	};

	const triggerIcon = (current: ThemeMode): string => {
		if (current === 'light') return 'material-symbols:wb-sunny-outline-rounded';
		if (current === 'dark') return 'material-symbols:dark-mode-outline-rounded';
		return 'material-symbols:radio-button-partial-outline';
	};

	// RC-Blog behavior: hover opens, mouseleave closes. Do not use :focus-within.
	const showPanel = (): void => {
		document.getElementById('light-dark-panel')?.classList.remove('float-panel-closed');
	};

	const hidePanel = (): void => {
		document.getElementById('light-dark-panel')?.classList.add('float-panel-closed');
	};
</script>

<div class="relative z-50" role="presentation" tabindex="-1" onmouseleave={hidePanel}>
	<button
		type="button"
		class="btn-plain scale-animation relative h-11 w-11 rounded-lg active:scale-90"
		aria-label="切换浅色/深色/跟随系统"
		aria-haspopup="menu"
		title="切换主题"
		onclick={toggleScheme}
		onmouseenter={showPanel}
	>
		<Icon icon={triggerIcon(mode)} class="text-[1.25rem]" aria-hidden="true" />
	</button>

	<div
		id="light-dark-panel"
		class="float-panel float-panel-closed absolute -right-2 top-11 hidden pt-5 transition lg:block"
		role="menu"
		aria-label="主题模式"
	>
		<div class="card-base float-panel-inner p-2">
			<button
				type="button"
				class="btn-plain scale-animation mb-0.5 flex h-9 w-full items-center justify-start! whitespace-nowrap rounded-lg px-3 font-medium active:scale-95"
				class:current-theme-btn={mode === 'light'}
				role="menuitem"
				onclick={() => switchScheme('light')}
			>
				<Icon icon="material-symbols:wb-sunny-outline-rounded" class="mr-3 text-[1.25rem]" aria-hidden="true" />
				浅色
			</button>
			<button
				type="button"
				class="btn-plain scale-animation mb-0.5 flex h-9 w-full items-center justify-start! whitespace-nowrap rounded-lg px-3 font-medium active:scale-95"
				class:current-theme-btn={mode === 'dark'}
				role="menuitem"
				onclick={() => switchScheme('dark')}
			>
				<Icon icon="material-symbols:dark-mode-outline-rounded" class="mr-3 text-[1.25rem]" aria-hidden="true" />
				深色
			</button>
			<button
				type="button"
				class="btn-plain scale-animation flex h-9 w-full items-center justify-start! whitespace-nowrap rounded-lg px-3 font-medium active:scale-95"
				class:current-theme-btn={mode === 'auto'}
				role="menuitem"
				onclick={() => switchScheme('auto')}
			>
				<Icon icon="material-symbols:radio-button-partial-outline" class="mr-3 text-[1.25rem]" aria-hidden="true" />
				跟随系统
			</button>
		</div>
	</div>
</div>
