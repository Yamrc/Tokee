import { Component, Show, createMemo, createSignal } from 'solid-js';
import useRoute from '@hooks/useRoute';
import useAutoRefresh from '@hooks/useAutoRefresh';
import { siteConfig } from './config';
import { clearCacheForRefresh } from '@services/api';
import { useMonitors } from '@features/monitor/hooks/useMonitors';
import AppLayout from '@components/Layout/AppLayout';
import MonitorList from '@features/monitor/components/MonitorList';
import StatusOverview from '@features/status/components/StatusOverview';
import MonitorDetail from '@features/monitor/components/MonitorDetail';
import Pagination from '@shared/components/Pagination';
import MonitorCardSkeleton from '@features/monitor/components/MonitorCardSkeleton';
import StatusOverviewSkeleton from '@features/status/components/StatusOverviewSkeleton';
import ErrorState from '@shared/components/ErrorState';
import ErrorBoundary from '@components/UI/ErrorBoundary';
import type { ProcessedMonitor } from '@/types/api';

const App: Component = () => {
	const { currentRoute, navigateToList, navigateToDetail, initRoute } = useRoute();

	const autoRefreshConfig = createMemo(() => siteConfig.autoRefresh ?? { enable: true, interval: 300 });

	const isDetailPage = createMemo(() => currentRoute().type === 'detail');
	const monitorId = createMemo(() => currentRoute().monitorId);
	const currentPageNum = createMemo(() => currentRoute().page);

	const monitorsData = useMonitors(siteConfig.pageId, currentPageNum);

	const [detailRefreshTrigger, setDetailRefreshTrigger] = createSignal(0);

	const handleRefresh = () => {
		if (isDetailPage() && monitorId()) {
			clearCacheForRefresh(siteConfig.pageId, monitorId()!);
			setDetailRefreshTrigger((prev) => prev + 1);
		} else {
			clearCacheForRefresh(siteConfig.pageId);
			monitorsData.refresh();
		}
	};

	const handleHomeClick = () => {
		navigateToList(1);
	};

	const handlePageChange = (page: number) => {
		if (page >= 1 && page <= monitorsData.totalPages()) {
			navigateToList(page);
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	};

	const handleMonitorClick = (monitor: ProcessedMonitor) => {
		navigateToDetail(monitor.id);
	};

	const { countdown } = useAutoRefresh({
		config: autoRefreshConfig,
		onRefresh: handleRefresh,
	});

	const loading = createMemo(() => monitorsData.loading());

	initRoute();

	return (
		<ErrorBoundary>
			<AppLayout
				onHomeClick={handleHomeClick}
				onRefresh={handleRefresh}
				loading={loading()}
				countdown={autoRefreshConfig().enable ? countdown() : 0}
			>
				<Show when={isDetailPage() && monitorId() !== null} fallback={
					<Show when={!loading()} fallback={
						<>
							<StatusOverviewSkeleton />
							<MonitorCardSkeleton count={6} />
							<div class="h-8" />
						</>
					}>
						<Show when={!monitorsData.error()} fallback={<ErrorState onRetry={() => monitorsData.refresh()} />}>
							<StatusOverview monitors={monitorsData.monitors()} />
							<MonitorList
								monitors={monitorsData.monitors()}
								onMonitorClick={handleMonitorClick}
							/>
							<Pagination
								currentPage={currentPageNum()}
								totalPages={monitorsData.totalPages()}
								loading={loading()}
								onPageChange={handlePageChange}
							/>
						</Show>
					</Show>
				}>
					<MonitorDetail
						statuspageId={siteConfig.pageId}
						monitorId={monitorId()!}
						refreshTrigger={detailRefreshTrigger()}
						onBack={() => navigateToList(currentPageNum())}
					/>
				</Show>
			</AppLayout>
		</ErrorBoundary>
	);
};

export default App;
