import { Component, createSignal, JSX, Show } from 'solid-js';
import ErrorState from '@shared/components/ErrorState';

interface ErrorBoundaryProps {
	children: JSX.Element;
	fallback?: Component<{ error: Error; reset: () => void }>;
}

interface ErrorInfo {
	error: Error;
	reset: () => void;
}

const ErrorBoundary: Component<ErrorBoundaryProps> = (props) => {
	const [errorInfo, setErrorInfo] = createSignal<ErrorInfo | null>(null);

	const reset = () => {
		setErrorInfo(null);
	};

	const onError = (error: Error) => {
		setErrorInfo({ error, reset });
	};

	return (
		<Show
			when={!errorInfo()}
			fallback={
				props.fallback
					? props.fallback({ error: errorInfo()!.error, reset })
					: <ErrorState message={errorInfo()!.error.message} onRetry={reset} />
			}
		>
			{props.children}
		</Show>
	);
};

export default ErrorBoundary;
