import { Component, createSignal, onMount, Show, onCleanup } from 'solid-js';
import { useMonitors } from '@features/monitor/hooks/useMonitors';
import MonitorList from '@features/monitor/components/MonitorList';
import StatusOverview from '@features/status/components/StatusOverview';
import LoadingState from '@shared/components/LoadingState';
import ErrorState from '@shared/components/ErrorState';
import MonitorDetail from '@features/monitor/components/MonitorDetail';
import AppHeader from '@shared/components/AppHeader';
import Pagination from '@shared/components/Pagination';
import { parseRoute, navigateToDetail, navigateToList } from '@shared/utils/router';

const STATUSPAGE_ID = 'VAtAH0mzPN';

const App: Component = () => {
	const [currentPage, setCurrentPage] = createSignal<'list' | 'detail'>('list');
	const [selectedMonitorId, setSelectedMonitorId] = createSignal<number | null>(null);
	const [currentPageNum, setCurrentPageNum] = createSignal(1);
	const [detailRefreshTrigger, setDetailRefreshTrigger] = createSignal(0);
	const [detailLoading, setDetailLoading] = createSignal(false);

	const monitorsData = useMonitors(STATUSPAGE_ID, currentPageNum);

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
	});

	onCleanup(() => {
		window.removeEventListener('popstate', handleRouteChange);
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
	};

	return (
		<div class="min-h-screen bg-[var(--page-bg)]">
			<AppHeader
				onHomeClick={() => {
					navigateToList(currentPageNum());
					handleRouteChange();
				}}
				onRefresh={handleRefresh}
				loading={monitorsData.loading() || detailLoading()}
			/>
			<main class="relative max-w-[var(--page-width)] w-full md:px-4 mx-auto mt-[1rem] pb-8">
				{currentPage() === 'detail' && selectedMonitorId() !== null ? (
					<MonitorDetail
						statuspageId={STATUSPAGE_ID}
						monitorId={selectedMonitorId()!}
						onBack={() => {}}
						refreshTrigger={detailRefreshTrigger()}
						onLoadingChange={setDetailLoading}
					/>
				) : monitorsData.loading() ? (
					<LoadingState />
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
		</div>
	);
};

export default App;
