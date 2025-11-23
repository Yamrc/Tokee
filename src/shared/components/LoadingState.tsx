import { Component } from 'solid-js';

const LoadingState: Component = () => (
	<div class="flex flex-col items-center justify-center py-16">
		<div class="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mb-4" />
		<p class="text-75">加载中...</p>
	</div>
);

export default LoadingState;
