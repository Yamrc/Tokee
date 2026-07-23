<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '@iconify/svelte';
	import { siteConfig } from '@config';
	import { clearCacheForRefresh, getMonitorList, processMonitors } from '@lib/uptime-robot';
	import { formatRatio } from '@lib/format';
	import { getBarColor, getPageFromSearch, getStatus, getVisiblePageNumbers } from '@lib/monitor';
	import type { MonitorListResponse, ProcessedMonitor } from '@lib/uptime-robot-types';

	let monitors: ProcessedMonitor[] = $state([]);
	let totalPages = $state(1);
	let currentPage = $state(1);
	let loading = $state(true);
	let error: string | null = $state(null);

	let listController: AbortController | null = null;

	const operationalCount = $derived(monitors.filter((monitor) => monitor.status === 'success').length);
	const downCount = $derived(monitors.filter((monitor) => monitor.status === 'down').length);
	const pausedCount = $derived(monitors.filter((monitor) => monitor.status === 'paused').length);
	const averageRatio = $derived(
		monitors.length > 0 ? monitors.reduce((sum, monitor) => sum + monitor.ratio, 0) / monitors.length : 0,
	);

	const updateUrl = (page: number): void => {
		const url = new URL(window.location.href);
		if (page <= 1) {
			url.searchParams.delete('p');
		} else {
			url.searchParams.set('p', String(page));
		}
		window.history.pushState({}, '', url);
	};

	async function loadMonitors(page = currentPage, bypassCache = false): Promise<void> {
		listController?.abort();
		const controller = new AbortController();
		listController = controller;
		loading = true;
		error = null;

		try {
			const response: MonitorListResponse = await getMonitorList(siteConfig.pageId, page, controller.signal, bypassCache);
			if (controller.signal.aborted) return;
			monitors = processMonitors(response.psp.monitors);
			totalPages = Math.max(1, Math.ceil(response.psp.totalMonitors / response.psp.perPage));
			currentPage = page;
		} catch (err) {
			if ((err as DOMException).name !== 'AbortError') {
				error = err instanceof Error ? err.message : '加载数据失败，请稍后重试';
			}
		} finally {
			if (!controller.signal.aborted) loading = false;
		}
	}

	const refresh = (): void => {
		clearCacheForRefresh(siteConfig.pageId);
		void loadMonitors(currentPage, true);
	};

	const changePage = (page: number): void => {
		if (page < 1 || page > totalPages || loading) return;
		updateUrl(page);
		void loadMonitors(page);
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	onMount(() => {
		currentPage = getPageFromSearch(window.location.search);
		void loadMonitors(currentPage);

		const handlePopState = (): void => {
			void loadMonitors(getPageFromSearch(window.location.search));
		};

		const handleRefresh = (): void => {
			refresh();
		};

		window.addEventListener('popstate', handlePopState);
		window.addEventListener('tokee:refresh', handleRefresh);

		const auto = siteConfig.autoRefresh;
		let timer: ReturnType<typeof setInterval> | undefined;
		if (auto?.enable && auto.interval > 0) {
			timer = setInterval(() => {
				refresh();
			}, auto.interval * 1000);
		}

		return () => {
			listController?.abort();
			window.removeEventListener('popstate', handlePopState);
			window.removeEventListener('tokee:refresh', handleRefresh);
			if (timer) clearInterval(timer);
		};
	});
</script>

<section class="card-base card-shadow mb-4 p-6">
	<h1 class="text-90 mb-4 text-xl font-semibold">状态概览</h1>
	<div class="grid grid-cols-2 gap-4 md:grid-cols-5">
		<div class="text-center">
			<div class="text-90 mb-1 text-3xl font-bold">{monitors.length}</div>
			<div class="text-75 text-sm">总站点数</div>
		</div>
		<div class="text-center">
			<div class="mb-1 text-3xl font-bold text-(--status-success)">{operationalCount}</div>
			<div class="text-75 text-sm">正常运行</div>
		</div>
		<div class="text-center">
			<div class="mb-1 text-3xl font-bold text-(--status-error)">{downCount}</div>
			<div class="text-75 text-sm">异常</div>
		</div>
		<div class="text-center">
			<div class="mb-1 text-3xl font-bold text-(--status-warning)">{pausedCount}</div>
			<div class="text-75 text-sm">已暂停</div>
		</div>
		<div class="text-center">
			<div class="text-90 mb-1 text-3xl font-bold">{monitors.length > 0 ? `${formatRatio(averageRatio)}%` : '—'}</div>
			<div class="text-75 text-sm">平均可用性</div>
		</div>
	</div>
</section>

{#if loading}
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3" aria-label="加载中">
		{#each Array.from({ length: 6 }) as _}
			<article class="card-base card-shadow p-6">
				<div class="mb-4 flex items-center gap-3">
					<div class="skeleton h-6 flex-1 rounded-md"></div>
					<div class="skeleton h-6 w-16 rounded-md"></div>
					<div class="skeleton h-6 w-14 rounded-md"></div>
				</div>
				<div class="skeleton mb-4 h-8 rounded"></div>
				<div class="skeleton mb-2 h-3 w-2/5 rounded"></div>
				<div class="skeleton h-3 w-1/3 rounded"></div>
			</article>
		{/each}
	</div>
{:else if error}
	<div class="flex flex-col items-center justify-center py-16" role="alert" aria-live="assertive">
		<Icon icon="material-symbols:error-outline" class="mb-4 text-(--status-error) text-[4rem]" aria-hidden="true" />
		<p class="text-90 mb-2 text-lg font-semibold">出错了</p>
		<p class="text-75 mb-6">{error}</p>
		<button class="btn-regular rounded-md px-6 py-2 transition active:scale-95" type="button" onclick={refresh}>重试</button>
	</div>
{:else if monitors.length === 0}
	<article class="card-base card-shadow p-6 text-center">
		<h2 class="text-90 mb-2 text-xl font-semibold">暂无监控</h2>
		<p class="text-75">UptimeRobot 当前没有返回可显示的监控项目。</p>
	</article>
{:else}
	<section class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3" aria-label="监控列表">
		{#each monitors as monitor (monitor.id)}
			{@const status = getStatus(monitor.status)}
			<article class="card-base card-shadow relative transition-colors hover:bg-(--btn-card-bg-hover) [&:hover_h3]:text-(--primary)!">
				<a class="block cursor-pointer p-6 text-inherit no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary)" href={`/monitors?id=${monitor.id}`} aria-label={`查看 ${monitor.name} 的详细信息`}>
					<div class={`mb-4 flex items-center gap-3 ${monitor.url ? 'pr-10' : ''}`}>
						<h3 class="text-90 min-w-0 flex-1 truncate text-lg font-semibold transition-colors duration-200">{monitor.name}</h3>
						<div class="flex shrink-0 items-center gap-2">
							<span class={`flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium text-white ${status.badge}`}>
								<Icon icon={status.icon} class="text-[1rem]" aria-hidden="true" />
								{status.text}
							</span>
							<span class="text-75 whitespace-nowrap rounded-md bg-(--btn-regular-bg) px-2 py-1 text-xs">{monitor.type}</span>
						</div>
					</div>

					<div class="relative mb-4 flex h-8 items-end gap-0.5">
						{#if monitor.dailyRatios.length > 0}
							{#each monitor.dailyRatios.slice(-30).reverse() as day}
								{@const ratio = Number.parseFloat(day.ratio)}
								<div class={`flex-1 cursor-pointer rounded-t opacity-80 transition-colors duration-100 hover:opacity-100 ${getBarColor(ratio)}`} style={`height: ${Math.max(ratio, 4)}%`} title={`${day.date}: ${day.ratio}%`} role="img" aria-label={`${day.date}: ${day.ratio}% 可用性`}></div>
							{/each}
						{:else}
							<div class="text-75 w-full text-center text-xs">暂无数据</div>
						{/if}
					</div>

					{#if monitor.dailyRatios.length > 0}
						{@const ratios = monitor.dailyRatios.slice(-30).reverse()}
						<div class="text-75 -mt-2 mb-2 flex items-center justify-between text-xs">
							<span>{ratios[0]?.date}</span>
							<span>{ratios[ratios.length - 1]?.date}</span>
						</div>
					{/if}

					<div class="text-75 flex flex-wrap items-center justify-between gap-2 text-sm">
						<div class="flex items-center gap-4">
							<span>30天: <span class="text-90 font-medium">{formatRatio(monitor.ratio30d)}%</span></span>
							<span>90天: <span class="text-90 font-medium">{formatRatio(monitor.ratio90d)}%</span></span>
						</div>
						<span>总体: <span class="text-90 font-medium">{formatRatio(monitor.ratio)}%</span></span>
					</div>
				</a>
				{#if monitor.url}
					<a class="btn-card absolute right-6 top-6 h-8 w-8 shrink-0 rounded-md transition active:scale-90" href={monitor.url} target="_blank" rel="noopener noreferrer" aria-label={`访问 ${monitor.name} 的网站`}>
						<Icon icon="material-symbols:open-in-new" class="text-[1rem]" aria-hidden="true" />
					</a>
				{/if}
			</article>
		{/each}
	</section>

	{#if totalPages > 1}
		<nav class="mt-6 flex items-center justify-center gap-2" aria-label="分页导航">
			<button class="btn-regular rounded-md px-3 py-2 text-sm transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50" type="button" disabled={currentPage === 1 || loading} aria-label="上一页" onclick={() => changePage(currentPage - 1)}>
				<Icon icon="material-symbols:chevron-left" class="text-[1.25rem]" aria-hidden="true" />
			</button>
			<div class="flex items-center gap-1" role="list">
				{#each getVisiblePageNumbers(currentPage, totalPages) as pageNum}
					<button class={pageNum === currentPage ? 'rounded-md bg-(--primary) px-3 py-2 text-sm text-white transition active:scale-95' : 'btn-regular rounded-md px-3 py-2 text-sm transition active:scale-95'} type="button" disabled={loading} aria-label={`第 ${pageNum} 页`} aria-current={pageNum === currentPage ? 'page' : undefined} onclick={() => changePage(pageNum)}>{pageNum}</button>
				{/each}
			</div>
			<button class="btn-regular rounded-md px-3 py-2 text-sm transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50" type="button" disabled={currentPage === totalPages || loading} aria-label="下一页" onclick={() => changePage(currentPage + 1)}>
				<Icon icon="material-symbols:chevron-right" class="text-[1.25rem]" aria-hidden="true" />
			</button>
		</nav>
	{/if}
{/if}
