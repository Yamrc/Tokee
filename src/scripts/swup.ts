import { setupPageScrollbar, updatePageScrollbar } from './page-scrollbar';

function clearInitialLoadAnimation(): void {
	document.documentElement.classList.remove('initial-load');
}

function setHeightExtend(visible: boolean): void {
	const heightExtend = document.getElementById('page-height-extend');
	if (!heightExtend) return;
	heightExtend.classList.toggle('hidden', !visible);
}

function refreshShell(): void {
	setupPageScrollbar();
	window.requestAnimationFrame(updatePageScrollbar);
	window.setTimeout(clearInitialLoadAnimation, 1000);
}

function setupSwupLifecycle(): void {
	const swup = window.swup;
	if (!swup?.hooks || window.__tokeeSwupLifecycleBound) return;
	window.__tokeeSwupLifecycleBound = true;

	swup.hooks.on('link:click', () => {
		document.documentElement.style.setProperty('--content-delay', '0ms');
		clearInitialLoadAnimation();
	});

	swup.hooks.on('content:replace', () => {
		refreshShell();
	});

	swup.hooks.on('visit:start', () => {
		setHeightExtend(true);
	});

	swup.hooks.on('page:view', () => {
		setHeightExtend(true);
		refreshShell();
	});

	swup.hooks.on('visit:end', () => {
		window.setTimeout(() => setHeightExtend(false), 200);
	});
}

refreshShell();

if (window.swup?.hooks) {
	setupSwupLifecycle();
} else {
	document.addEventListener('swup:enable', setupSwupLifecycle, { once: true });
}

document.addEventListener('astro:page-load', refreshShell);
