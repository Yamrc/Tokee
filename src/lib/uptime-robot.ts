import { cache } from './cache';
import type {
	MonitorDetailResponse,
	MonitorListResponse,
	ProcessedMonitor,
} from './uptime-robot-types';

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
		cache.deleteByPrefix(`monitorList:${statuspageId}:`);
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

export function clearCacheForRefresh(statuspageId: string, monitorId?: number): void {
	if (monitorId) {
		cache.delete(`monitorDetail:${statuspageId}:${monitorId}`);
	} else {
		clearMonitorListCache(statuspageId);
	}
}
