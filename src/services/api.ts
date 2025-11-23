import type {
	MonitorListResponse,
	ProcessedMonitor,
	MonitorDetailResponse,
} from '@/types/api';

const API_BASE = 'https://stats.uptimerobot.com/api';

export async function getMonitorList(statuspageId: string, page = 1, signal?: AbortSignal): Promise<MonitorListResponse> {
	const url = new URL(`${API_BASE}/getMonitorList/${statuspageId}`);
	url.searchParams.set('page', String(page));
	url.searchParams.set('_', String(Date.now()));
	const res = await fetch(url, { headers: { Accept: 'application/json' }, signal });
	if (!res.ok) throw new Error(`API request failed: ${res.status} ${res.statusText}`);
	const data: MonitorListResponse = await res.json();
	if (data.status !== 'ok') throw new Error('API returned non-ok status');
	return data;
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

export async function getMonitorDetail(statuspageId: string, monitorId: number, signal?: AbortSignal): Promise<MonitorDetailResponse> {
	const url = new URL(`${API_BASE}/getMonitor/${statuspageId}`);
	url.searchParams.set('m', String(monitorId));
	url.searchParams.set('_', String(Date.now()));
	const res = await fetch(url, { headers: { Accept: 'application/json' }, signal });
	if (!res.ok) throw new Error(`API request failed: ${res.status} ${res.statusText}`);
	const data: MonitorDetailResponse = await res.json();
	if (data.status !== 'ok') throw new Error('API returned non-ok status');
	return data;
}
