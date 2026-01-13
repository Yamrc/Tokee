import { createSignal, createEffect, onCleanup } from 'solid-js';

export interface AutoRefreshConfig {
	enable: boolean;
	interval: number;
}

interface UseAutoRefreshOptions {
	config: () => AutoRefreshConfig;
	onRefresh: () => void;
	onCountdownChange?: (count: number) => void;
}

interface UseAutoRefreshReturn {
	countdown: () => number;
	isRunning: () => boolean;
	pause: () => void;
	resume: () => void;
	forceRefresh: () => void;
}

const useAutoRefresh = (options: UseAutoRefreshOptions): UseAutoRefreshReturn => {
	const [countdown, setCountdown] = createSignal(0);
	const [isRunning, setIsRunning] = createSignal(false);
	let intervalId: number | undefined;

	const resetCountdown = () => {
		setCountdown(options.config().interval);
	};

	const tick = () => {
		setCountdown((prev) => {
			if (prev <= 1) {
				options.onRefresh();
				return options.config().interval;
			}
			return prev - 1;
		});
	};

	const start = () => {
		if (intervalId) clearInterval(intervalId);
		resetCountdown();
		intervalId = setInterval(tick, 1000) as unknown as number;
		setIsRunning(true);
	};

	const stop = () => {
		if (intervalId) {
			clearInterval(intervalId);
			intervalId = undefined;
		}
		setIsRunning(false);
		setCountdown(0);
	};

	const pause = () => {
		stop();
	};

	const resume = () => {
		if (options.config().enable && !intervalId) {
			start();
		}
	};

	const forceRefresh = () => {
		options.onRefresh();
		resetCountdown();
	};

	createEffect(() => {
		const config = options.config();
		if (config.enable) {
			if (!intervalId) {
				start();
			}
		} else {
			stop();
		}
	});

	createEffect(() => {
		options.onCountdownChange?.(countdown());
	});

	onCleanup(() => {
		stop();
	});

	return {
		countdown,
		isRunning,
		pause,
		resume,
		forceRefresh,
	};
};

export default useAutoRefresh;
