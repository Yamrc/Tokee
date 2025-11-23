import { Component, createSignal, onMount, createEffect, on, Show, lazy, Suspense } from 'solid-js';
import { getMonitorDetail } from '@services/api';
import type { MonitorDetailResponse } from '@/types/api';
import LoadingState from '@shared/components/LoadingState';
import ErrorState from '@shared/components/ErrorState';
import MonitorHeader from './MonitorHeader';
import UptimeSection from './UptimeSection';
import ResponseTimeStats from './ResponseTimeStats';
import RecentEvents from './RecentEvents';
import { Icon } from '@iconify-icon/solid';

const ResponseTimeChart = lazy(() => import('./ResponseTimeChart'));

interface MonitorDetailProps {
	statuspageId: string;
	monitorId: number;
	onBack: () => void;
	refreshTrigger?: number;
	onLoadingChange?: (loading: boolean) => void;
}

const MonitorDetail: Component<MonitorDetailProps> = (props) => {
	const [detail, setDetail] = createSignal<MonitorDetailResponse | null>(null);
	const [loading, setLoading] = createSignal(true);
	const [error, setError] = createSignal<string | null>(null);

	const fetchDetail = async () => {
		try {
			setLoading(true);
			props.onLoadingChange?.(true);
			setError(null);
			const data = await getMonitorDetail(props.statuspageId, props.monitorId);
			setDetail(data);
		} catch (err) {
			console.error('Failed to fetch monitor detail:', err);
			setError(err instanceof Error ? err.message : '未知错误');
		} finally {
			setLoading(false);
			props.onLoadingChange?.(false);
		}
	};

	onMount(() => {
		fetchDetail();
	});

	createEffect(
		on(
			() => props.refreshTrigger ?? 0,
			(trigger) => {
				if (trigger > 0) {
					fetchDetail();
				}
			}
		)
	);

	return (
		<Show
			when={!loading() && !error() && detail()}
			fallback={
				<Show when={loading()} fallback={<ErrorState onRetry={() => window.location.reload()} />}>
					<LoadingState />
				</Show>
			}
		>
			{(() => {
				const monitor = detail()!.monitor;
				return (
					<div class="space-y-4">
						<MonitorHeader monitor={monitor} />
						<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
							<UptimeSection monitor={monitor} />
							<ResponseTimeStats stats={monitor.responseTimeStats} />
						</div>
						<div class="card-base card-shadow p-5">
							<div class="flex items-center gap-2.5 mb-4">
								<Icon icon="material-symbols:show-chart" width="1.5rem" height="1.5rem" class="text-(--primary)" aria-hidden="true" />
								<h3 class="text-90 text-lg font-semibold">响应时间趋势</h3>
							</div>
							<div class="-mx-2">
								<Suspense fallback={<div class="text-center text-75 py-8">加载图表中...</div>}>
									<ResponseTimeChart
										responseTimes={monitor.responseTimes || []}
										avgResponseTime={monitor.responseTimeStats.avg_response_time}
										minResponseTime={monitor.responseTimeStats.min_response_time}
										maxResponseTime={monitor.responseTimeStats.max_response_time}
									/>
								</Suspense>
							</div>
						</div>
						<RecentEvents logs={monitor.logs} />
					</div>
				);
			})()}
		</Show>
	);
};

export default MonitorDetail;
