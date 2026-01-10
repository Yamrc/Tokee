import { Component, createSignal, onMount, onCleanup, Show, createEffect, createMemo } from 'solid-js';
import { useMonitors } from '@features/monitor/hooks/useMonitors';
import MonitorList from '@features/monitor/components/MonitorList';
import StatusOverview from '@features/status/components/StatusOverview';
import LoadingState from '@shared/components/LoadingState';
import ErrorState from '@shared/components/ErrorState';
import MonitorDetail from '@features/monitor/components/MonitorDetail';
import AppHeader from '@shared/components/AppHeader';
import Footer from '@shared/components/Footer';
import Pagination from '@shared/components/Pagination';
import MonitorCardSkeleton from '@features/monitor/components/MonitorCardSkeleton';
import StatusOverviewSkeleton from '@features/status/components/StatusOverviewSkeleton';
import { parseRoute, navigateToDetail, navigateToList } from '@shared/utils/router';
import { siteConfig } from './config';

const App: Component = () => {
	const [currentPage, setCurrentPage] = createSignal<'list' | 'detail'>('list');
	const [selectedMonitorId, setSelectedMonitorId] = createSignal<number | null>(null);
	const [currentPageNum, setCurrentPageNum] = createSignal(1);
	const [detailRefreshTrigger, setDetailRefreshTrigger] = createSignal(0);
	const [detailLoading, setDetailLoading] = createSignal(false);
	const [countdown, setCountdown] = createSignal(0);

	const monitorsData = useMonitors(siteConfig.pageId, currentPageNum);

	const autoRefreshConfig = createMemo(() => siteConfig.autoRefresh ?? { enable: true, interval: 60 });

	let intervalId: number | undefined;

	const resetCountdown = () => {
		setCountdown(autoRefreshConfig().interval);
	};

	const tick = () => {
		setCountdown((prev) => {
			if (prev <= 1) {
				handleRefresh();
				return autoRefreshConfig().interval;
			}
			return prev - 1;
		});
	};

	const handleRouteChange = () => {
		const route = parseRoute();
		if (route.type === 'detail' && route.monitorId) {
			setCurrentPage('detail');
			setSelectedMonitorId(route.monitorId);
		} else {
			setCurrentPage('list');
			setSelectedMonitorId(null);
			const page = route.page || 1;
			setCurrentPageNum(page);
		}
	};

	onMount(() => {
		handleRouteChange();
		window.addEventListener('popstate', handleRouteChange);

		if (autoRefreshConfig().enable) {
			resetCountdown();
			intervalId = setInterval(tick, 1000) as unknown as number;
		}
	});

	onCleanup(() => {
		window.removeEventListener('popstate', handleRouteChange);
		if (intervalId) {
			clearInterval(intervalId);
		}
	});

	createEffect(() => {
		if (!autoRefreshConfig().enable && intervalId) {
			clearInterval(intervalId);
			intervalId = undefined;
			setCountdown(0);
		} else if (autoRefreshConfig().enable && !intervalId) {
			resetCountdown();
			intervalId = setInterval(tick, 1000) as unknown as number;
		}
	});

	const handlePageChange = (page: number) => {
		if (page >= 1 && page <= monitorsData.totalPages()) {
			navigateToList(page);
			handleRouteChange();
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	};

	const handleRefresh = () => {
		if (currentPage() === 'detail') {
			setDetailRefreshTrigger((prev) => prev + 1);
		} else {
			monitorsData.refresh();
		}
		resetCountdown();
	};

	return (
		<div class="min-h-screen bg-(--page-bg)">
			<AppHeader
				onHomeClick={() => {
					navigateToList(currentPageNum());
					handleRouteChange();
				}}
				onRefresh={handleRefresh}
				loading={monitorsData.loading() || detailLoading()}
			/>
			<main class="relative max-w-(--page-width) w-full md:px-4 mx-auto mt-4 pb-8">
				{currentPage() === 'detail' && selectedMonitorId() !== null ? (
					<MonitorDetail
						statuspageId={siteConfig.pageId}
						monitorId={selectedMonitorId()!}
						onBack={() => {}}
						refreshTrigger={detailRefreshTrigger()}
						onLoadingChange={setDetailLoading}
					/>
				) : monitorsData.loading() ? (
					<>
						<StatusOverviewSkeleton />
						<MonitorCardSkeleton count={6} />
						<div class="h-8" />
					</>
				) : monitorsData.error() ? (
					<ErrorState onRetry={() => monitorsData.refresh()} />
				) : (
					<>
						<StatusOverview monitors={monitorsData.monitors()} />
						<MonitorList
							monitors={monitorsData.monitors()}
							onMonitorClick={(monitor) => {
								navigateToDetail(monitor.id);
								handleRouteChange();
							}}
						/>
						<Pagination
							currentPage={currentPageNum()}
							totalPages={monitorsData.totalPages()}
							loading={monitorsData.loading()}
							onPageChange={handlePageChange}
						/>
					</>
				)}
			</main>
			<Footer countdown={autoRefreshConfig().enable ? countdown() : 0} />
		</div>
	);
};

export default App;
