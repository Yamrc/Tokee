import { Component } from 'solid-js';

const LoadingState: Component = () => (
	<div class="flex flex-col items-center justify-center py-16" role="status" aria-live="polite" aria-label="加载中">
		<div class="w-12 h-12 border-4 border-(--primary) border-t-transparent rounded-full animate-spin mb-4" aria-hidden="true" />
		<p class="text-75">加载中...</p>
	</div>
);

export default LoadingState;
