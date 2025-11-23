import { createResource, createSignal, Resource } from 'solid-js';
import { getMonitorDetail } from '@services/api';
import type { MonitorDetailResponse } from '@/types/api';

export interface UseMonitorDetailResult {
	detail: Resource<MonitorDetailResponse | undefined>;
	refresh: () => void;
	loading: () => boolean;
	error: () => Error | null;
}

export const useMonitorDetail = (statuspageId: string, monitorId: number, refreshTrigger?: () => number): UseMonitorDetailResult => {
	const [refreshKey, setRefreshKey] = createSignal(0);

	const [detail] = createResource(
		() => [statuspageId, monitorId, refreshTrigger?.() ?? refreshKey()] as const,
		async ([sid, mid]) => {
			const data = await getMonitorDetail(sid, mid);
			return data;
		}
	);

	const refresh = (): void => {
		setRefreshKey((k) => k + 1);
	};

	return { 
		detail, 
		refresh, 
		loading: (): boolean => detail.loading, 
		error: (): Error | null => detail.error 
	};
};
