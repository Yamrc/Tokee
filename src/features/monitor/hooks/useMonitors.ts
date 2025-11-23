import { createResource } from 'solid-js';
import { getMonitorList, processMonitors } from '@services/api';
import type { ProcessedMonitor } from '@/types/api';

export interface UseMonitorsResult {
	monitors: () => ProcessedMonitor[];
	loading: () => boolean;
	error: () => Error | null;
	totalPages: () => number;
	perPage: () => number;
	refresh: () => void;
}

export const useMonitors = (statuspageId: string, page: () => number): UseMonitorsResult => {
	const [monitorsData, { refetch }] = createResource(
		page,
		async (p) => {
			const response = await getMonitorList(statuspageId, p);
			return {
				monitors: processMonitors(response.psp.monitors),
				totalPages: Math.ceil(response.psp.totalMonitors / response.psp.perPage),
				perPage: response.psp.perPage,
			};
		}
	);

	return {
		monitors: (): ProcessedMonitor[] => monitorsData()?.monitors ?? [],
		loading: (): boolean => monitorsData.loading,
		error: (): Error | null => monitorsData.error,
		totalPages: (): number => monitorsData()?.totalPages ?? 1,
		perPage: (): number => monitorsData()?.perPage ?? 30,
		refresh: (): void => {
			refetch();
		},
	};
};
