import { createSignal, onCleanup, Accessor } from 'solid-js';

export interface RouteState {
	type: 'list' | 'detail';
	page: number;
	monitorId: number | null;
}

interface UseRouteReturn {
	currentRoute: Accessor<RouteState>;
	navigateToList: (page?: number) => void;
	navigateToDetail: (monitorId: number) => void;
	initRoute: () => void;
	parseRoute: () => RouteState;
}

const useRoute = (): UseRouteReturn => {
	const [currentRoute, setCurrentRoute] = createSignal<RouteState>({ type: 'list', page: 1, monitorId: null });

	const navigateToList = (page = 1): void => {
		const url = page === 1 ? '/' : `/?page=${page}`;
		const newRoute: RouteState = { type: 'list', page, monitorId: null };
		history.pushState(newRoute, '', url);
		setCurrentRoute(newRoute);
		window.dispatchEvent(new PopStateEvent('popstate'));
	};

	const navigateToDetail = (monitorId: number): void => {
		const url = `/monitor?id=${monitorId}`;
		const newRoute: RouteState = { type: 'detail', page: 1, monitorId };
		history.pushState(newRoute, '', url);
		setCurrentRoute(newRoute);
		window.dispatchEvent(new PopStateEvent('popstate'));
	};

	const parseRoute = (): RouteState => {
		const { pathname, searchParams } = new URL(window.location.href);
		if (pathname.startsWith('/monitor')) {
			const id = searchParams.get('id');
			if (id) {
				const monitorId = Number.parseInt(id, 10);
				if (!Number.isNaN(monitorId)) {
					return { type: 'detail', page: 1, monitorId };
				}
			}
		}
		const page = Number.parseInt(searchParams.get('page') || '1', 10);
		return { type: 'list', page: Number.isNaN(page) || page < 1 ? 1 : page, monitorId: null };
	};

	const initRoute = (): void => {
		setCurrentRoute(parseRoute());
		const handlePopState = (): void => {
			setCurrentRoute(parseRoute());
		};
		window.addEventListener('popstate', handlePopState);
		onCleanup(() => window.removeEventListener('popstate', handlePopState));
	};

	return {
		currentRoute,
		navigateToList,
		navigateToDetail,
		initRoute,
		parseRoute,
	};
};

export default useRoute;
