export interface RouteState {
	type: 'list' | 'detail';
	page?: number;
	monitorId?: number;
}

export function parseRoute(): RouteState {
	const { pathname, searchParams } = new URL(window.location.href);
	if (pathname.startsWith('/monitor')) {
		const id = searchParams.get('id');
		if (id) {
			const monitorId = Number.parseInt(id, 10);
			if (!Number.isNaN(monitorId)) return { type: 'detail', monitorId };
		}
	}
	const page = Number.parseInt(searchParams.get('page') || '1', 10);
	return { type: 'list', page: Number.isNaN(page) || page < 1 ? 1 : page };
}

export function navigateToDetail(monitorId: number): void {
	const url = new URL(`/monitor?id=${monitorId}`, window.location.origin);
	history.pushState({ type: 'detail', monitorId }, '', url.pathname + url.search);
	window.dispatchEvent(new PopStateEvent('popstate'));
}

export function navigateToList(page = 1): void {
	const url = page === 1 ? '/' : `/?page=${page}`;
	history.pushState({ type: 'list', page }, '', url);
	window.dispatchEvent(new PopStateEvent('popstate'));
}

export function updateQueryParam(key: string, value: string | number | null): void {
	const url = new URL(window.location.href);
	value == null || value === '' ? url.searchParams.delete(key) : url.searchParams.set(key, String(value));
	history.pushState({}, '', url);
	window.dispatchEvent(new PopStateEvent('popstate'));
}
