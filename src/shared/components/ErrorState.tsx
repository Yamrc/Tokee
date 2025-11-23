import { Component, Show } from 'solid-js';
import { Icon } from '@iconify-icon/solid';

interface ErrorStateProps {
	message?: string;
	onRetry?: () => void;
}

const ErrorState: Component<ErrorStateProps> = (props) => (
	<div class="flex flex-col items-center justify-center py-16" role="alert" aria-live="assertive">
		<Icon icon="material-symbols:error-outline" width="4rem" height="4rem" class="text-(--status-error) mb-4" aria-hidden="true" />
		<p class="text-90 text-lg font-semibold mb-2">出错了</p>
		<p class="text-75 mb-6">{props.message || '加载数据失败，请稍后重试'}</p>
		<Show when={props.onRetry}>
			<button class="btn-regular px-6 py-2 rounded-md" onClick={() => props.onRetry?.()} aria-label="重试加载">
				重试
			</button>
		</Show>
	</div>
);

export default ErrorState;
