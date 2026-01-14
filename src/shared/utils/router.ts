export interface RouteState {
	type: 'list' | 'detail';
	page?: number;
	monitorId?: number;
}

export function parseRoute(): RouteState {
	const { searchParams } = new URL(window.location.href);
	
	const monitorIdParam = searchParams.get('m');
	if (monitorIdParam) {
		const monitorId = Number.parseInt(monitorIdParam, 10);
		if (!Number.isNaN(monitorId)) return { type: 'detail', monitorId };
	}

	const pageParam = searchParams.get('p');
	const page = Number.parseInt(pageParam || '1', 10);
	return { type: 'list', page: Number.isNaN(page) || page < 1 ? 1 : page };
}

export function navigateToDetail(monitorId: number): void {
	const url = `/?m=${monitorId}`;
	history.pushState({ type: 'detail', monitorId }, '', url);
	window.dispatchEvent(new PopStateEvent('popstate'));
}

export function navigateToList(page = 1): void {
	const url = `/?p=${page}`;
	history.pushState({ type: 'list', page }, '', url);
	window.dispatchEvent(new PopStateEvent('popstate'));
}

export function updateQueryParam(key: string, value: string | number | null): void {
	const url = new URL(window.location.href);
	value == null || value === '' ? url.searchParams.delete(key) : url.searchParams.set(key, String(value));
	history.pushState({}, '', url);
	window.dispatchEvent(new PopStateEvent('popstate'));
}
