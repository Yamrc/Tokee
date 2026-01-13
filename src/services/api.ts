import type {
	MonitorListResponse,
	ProcessedMonitor,
	MonitorDetailResponse,
} from '@/types/api';
import { cache } from './cache';

const API_BASE = 'https://stats.uptimerobot.com/api';
const MONITOR_LIST_CACHE_TTL = 300000;
const MONITOR_DETAIL_CACHE_TTL = 300000;

export async function getMonitorList(statuspageId: string, page = 1, signal?: AbortSignal, bypassCache = false): Promise<MonitorListResponse> {
	const cacheKey = `monitorList:${statuspageId}:${page}`;

	if (!bypassCache) {
		const cached = cache.get<MonitorListResponse>(cacheKey, MONITOR_LIST_CACHE_TTL);
		if (cached) return cached;
	}

	const url = new URL(`${API_BASE}/getMonitorList/${statuspageId}`);
	url.searchParams.set('page', String(page));
	url.searchParams.set('_', String(Date.now()));
	const res = await fetch(url, { headers: { Accept: 'application/json' }, signal });
	if (!res.ok) throw new Error(`API request failed: ${res.status} ${res.statusText}`);
	const data: MonitorListResponse = await res.json();
	if (data.status !== 'ok') throw new Error('API returned non-ok status');

	cache.set(cacheKey, data, MONITOR_LIST_CACHE_TTL);
	return data;
}

export function clearMonitorListCache(statuspageId?: string): void {
	if (statuspageId) {
		const cacheAny = cache as unknown as { store: Map<string, unknown> };
		const keysToDelete: string[] = [];
		for (const key of cacheAny.store.keys()) {
			if (key.startsWith(`monitorList:${statuspageId}:`)) {
				keysToDelete.push(key);
			}
		}
		for (const key of keysToDelete) {
			cache.delete(key);
		}
	} else {
		cache.clear();
	}
}

const statusMap: Record<string, 'success' | 'down' | 'paused'> = {
	success: 'success',
	paused: 'paused',
};

export function processMonitor(monitor: MonitorListResponse['psp']['monitors'][0]): ProcessedMonitor {
	return {
		id: monitor.monitorId,
		name: monitor.name,
		type: monitor.type,
		status: statusMap[monitor.statusClass] || 'down',
		statusClass: monitor.statusClass,
		url: monitor.url,
		dailyRatios: monitor.dailyRatios,
		ratio30d: Number.parseFloat(monitor['30dRatio']?.ratio || '0'),
		ratio90d: Number.parseFloat(monitor['90dRatio']?.ratio || '0'),
		ratio: Number.parseFloat(monitor.ratio.ratio),
		createdAt: monitor.createdAt,
	};
}

export function processMonitors(monitors: MonitorListResponse['psp']['monitors']): ProcessedMonitor[] {
	return monitors.map(processMonitor);
}

export async function getMonitorDetail(statuspageId: string, monitorId: number, signal?: AbortSignal, bypassCache = false): Promise<MonitorDetailResponse> {
	const cacheKey = `monitorDetail:${statuspageId}:${monitorId}`;

	if (!bypassCache) {
		const cached = cache.get<MonitorDetailResponse>(cacheKey, MONITOR_DETAIL_CACHE_TTL);
		if (cached) return cached;
	}

	const url = new URL(`${API_BASE}/getMonitor/${statuspageId}`);
	url.searchParams.set('m', String(monitorId));
	url.searchParams.set('_', String(Date.now()));
	const res = await fetch(url, { headers: { Accept: 'application/json' }, signal });
	if (!res.ok) throw new Error(`API request failed: ${res.status} ${res.statusText}`);
	const data: MonitorDetailResponse = await res.json();
	if (data.status !== 'ok') throw new Error('API returned non-ok status');

	cache.set(cacheKey, data, MONITOR_DETAIL_CACHE_TTL);
	return data;
}

export function clearMonitorDetailCache(statuspageId?: string, monitorId?: number): void {
	if (statuspageId && monitorId) {
		cache.delete(`monitorDetail:${statuspageId}:${monitorId}`);
	} else if (statuspageId) {
		const cacheAny = cache as unknown as { store: Map<string, unknown> };
		const keysToDelete: string[] = [];
		for (const key of cacheAny.store.keys()) {
			if (key.startsWith(`monitorDetail:${statuspageId}:`)) {
				keysToDelete.push(key);
			}
		}
		for (const key of keysToDelete) {
			cache.delete(key);
		}
	} else {
		cache.clear();
	}
}

export function clearAllCache(): void {
	cache.clear();
}

export function clearCacheForRefresh(statuspageId: string, monitorId?: number): void {
	if (monitorId) {
		cache.delete(`monitorDetail:${statuspageId}:${monitorId}`);
	} else {
		clearMonitorListCache(statuspageId);
	}
}
