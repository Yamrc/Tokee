<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '@iconify/svelte';
	import { siteConfig } from '@config';
	import { clearCacheForRefresh, getMonitorDetail } from '@lib/uptime-robot';
	import { formatRatio, formatTime } from '@lib/format';
	import { formatRelativeTime } from '@lib/time';
	import {
		averageUptime,
		displayedDailyRatios,
		getBarColor,
		getStatus,
		getTrendWindowDays,
		getUptimeColor,
		logClassColors,
		logIcons,
		logLabels,
		parseMonitorIdFromSearch,
		ratioValue,
		trendWindowLabel,
		type TrendWindowDays,
	} from '@lib/monitor';
	import type { MonitorDetailResponse } from '@lib/uptime-robot-types';

	let detail: MonitorDetailResponse | null = $state(null);
	let loading = $state(true);
	let error: string | null = $state(null);
	let monitorId: number | null = $state(null);
	let visibleEvents = $state(5);
	let trendDays: TrendWindowDays = $state(90);

	let detailController: AbortController | null = null;

	async function loadDetail(bypassCache = false): Promise<void> {
		monitorId = parseMonitorIdFromSearch(window.location.search);
		visibleEvents = 5;

		if (!monitorId) {
			loading = false;
			error = '缺少有效的 MonitorID，请从监控列表重新进入。';
			detail = null;
			return;
		}

		detailController?.abort();
		const controller = new AbortController();
		detailController = controller;
		loading = true;
		error = null;

		try {
			const next = await getMonitorDetail(siteConfig.pageId, monitorId, controller.signal, bypassCache);
			if (controller.signal.aborted) return;
			detail = next;
		} catch (err) {
			if ((err as DOMException).name !== 'AbortError') {
				error = err instanceof Error ? err.message : '加载监控详情失败，请稍后重试';
				detail = null;
			}
		} finally {
			if (!controller.signal.aborted) loading = false;
		}
	}

	const refresh = (): void => {
		if (monitorId) clearCacheForRefresh(siteConfig.pageId, monitorId);
		void loadDetail(true);
	};

	onMount(() => {
		const updateTrendWindow = (): void => {
			trendDays = getTrendWindowDays(window.innerWidth);
		};

		updateTrendWindow();
		void loadDetail();

		const handleRefresh = (): void => {
			refresh();
		};

		const handlePopState = (): void => {
			void loadDetail();
		};

		window.addEventListener('resize', updateTrendWindow);
		window.addEventListener('tokee:refresh', handleRefresh);
		window.addEventListener('popstate', handlePopState);

		const auto = siteConfig.autoRefresh;
		let timer: ReturnType<typeof setInterval> | undefined;
		if (auto?.enable && auto.interval > 0) {
			timer = setInterval(() => {
				refresh();
			}, auto.interval * 1000);
		}

		return () => {
			detailController?.abort();
			window.removeEventListener('resize', updateTrendWindow);
			window.removeEventListener('tokee:refresh', handleRefresh);
			window.removeEventListener('popstate', handlePopState);
			if (timer) clearInterval(timer);
		};
	});
</script>

{#if loading}
	<div class="space-y-4" aria-label="加载中">
		<article class="card-base card-shadow p-5">
			<div class="mb-3 flex items-center gap-3">
				<div class="skeleton h-7 w-1/2 rounded-md"></div>
				<div class="skeleton h-6 w-20 rounded-md"></div>
			</div>
			<div class="skeleton mb-3 h-4 w-2/3 rounded"></div>
			<div class="skeleton h-14 rounded"></div>
		</article>
		<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
			<section class="card-base card-shadow p-5">
				<div class="skeleton mb-4 h-6 w-32 rounded-md"></div>
				<div class="skeleton h-32 rounded"></div>
			</section>
			<section class="card-base card-shadow p-5">
				<div class="skeleton mb-4 h-6 w-24 rounded-md"></div>
				<div class="grid grid-cols-2 gap-4">
					<div class="skeleton h-20 rounded-lg"></div>
					<div class="skeleton h-20 rounded-lg"></div>
					<div class="skeleton h-20 rounded-lg"></div>
					<div class="skeleton h-20 rounded-lg"></div>
				</div>
			</section>
		</div>
		<section class="card-base card-shadow p-5">
			<div class="skeleton mb-4 h-6 w-28 rounded-md"></div>
			<div class="space-y-3">
				<div class="skeleton h-14 rounded-md"></div>
				<div class="skeleton h-14 rounded-md"></div>
				<div class="skeleton h-14 rounded-md"></div>
			</div>
		</section>
	</div>
{:else if error || !detail}
	<div class="card-base card-shadow p-5">
		<div class="flex flex-col items-center justify-center py-16" role="alert" aria-live="assertive">
			<h2 class="mb-4 text-8xl font-bold text-black/10 md:text-9xl dark:text-white/70">🤡</h2>
			<p class="text-90 mb-2 text-lg font-semibold">无法显示监控详情</p>
			<p class="text-75 mb-6 text-center">{error ?? '没有找到该监控，请从监控列表重新进入。'}</p>
			<div class="flex flex-wrap justify-center gap-3">
				<button class="btn-regular rounded-md px-6 py-2 transition active:scale-95" type="button" onclick={refresh}>重试</button>
				<a class="btn-plain scale-animation rounded-md px-6 py-2 transition active:scale-95" href="/">返回列表</a>
			</div>
		</div>
	</div>
{:else}
	{@const monitor = detail.monitor}
	{@const status = getStatus(monitor.statusClass)}
	{@const ratios = displayedDailyRatios(monitor.dailyRatios, trendDays)}
	<div class="space-y-4">
		<div class="card-base card-shadow p-5">
			<div class="flex items-start justify-between gap-4">
				<div class="min-w-0 flex-1">
					<div class="mb-3 flex items-center gap-3">
						<h2 class="text-90 truncate text-2xl font-bold">{monitor.name}</h2>
						<div class={`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1 text-sm font-medium ${status.color} ${status.bg}`}>
							<Icon icon={status.icon} class="text-[1rem]" aria-hidden="true" />
							{status.text}
						</div>
					</div>
					<div class="text-75 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
						<div class="flex items-center gap-1.5">
							<Icon icon="material-symbols:category" class="text-[1rem]" aria-hidden="true" />
							<span>类型:</span><span class="text-90 font-medium">{monitor.type}</span>
						</div>
						<div class="flex items-center gap-1.5">
							<Icon icon="material-symbols:schedule" class="text-[1rem]" aria-hidden="true" />
							<span>检查间隔:</span><span class="text-90 font-medium">{monitor.checkInterval}</span>
						</div>
						{#if monitor.url}
							<a class="flex items-center gap-1.5 text-(--primary) hover:underline" href={monitor.url} target="_blank" rel="noopener noreferrer">
								<Icon icon="material-symbols:open-in-new" class="text-[1rem]" aria-hidden="true" />
								<span>访问站点</span>
							</a>
						{/if}
					</div>
					<div class="relative mt-4 pt-4">
						<div class="absolute left-0 right-0 top-0 h-px bg-(--line-divider) opacity-20"></div>
						<div class="mb-3 flex items-center gap-2">
							<Icon icon="material-symbols:bar-chart" class="text-75 text-[1rem]" aria-hidden="true" />
							<span class="text-75 text-xs font-medium">{trendWindowLabel(trendDays)}</span>
						</div>
						<div class="flex h-14 items-end gap-0.5">
							{#if ratios.length > 0}
								{#each ratios as day}
									{@const ratio = Number.parseFloat(day.ratio)}
									<div class={`flex-1 cursor-pointer rounded-t opacity-80 transition-colors duration-100 hover:opacity-100 ${getBarColor(ratio)}`} style={`height: ${Math.max(ratio, 4)}%`} title={`${day.date}: ${day.ratio}%`} role="img" aria-label={`${day.date}: ${day.ratio}% 可用性`}></div>
								{/each}
							{:else}
								<div class="text-75 w-full text-center text-xs">暂无数据</div>
							{/if}
						</div>
						{#if ratios.length > 0}
							<div class="text-75 mt-2 flex items-center justify-between text-xs">
								<span>{ratios[0]?.date}</span>
								<span>{ratios[ratios.length - 1]?.date}</span>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>

		<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
			<section class="card-base card-shadow p-5">
				<div class="mb-4 flex items-center gap-2.5">
					<Icon icon="material-symbols:trending-up" class="text-(--primary) text-[1.5rem]" aria-hidden="true" />
					<h3 class="text-90 text-lg font-semibold">整体运行时间</h3>
				</div>
				<div class="space-y-3">
					{#each [
						{ label: '24小时', value: ratioValue(monitor, '1dRatio'), icon: 'material-symbols:schedule' },
						{ label: '7天', value: ratioValue(monitor, '7dRatio'), icon: 'material-symbols:calendar-today' },
						{ label: '30天', value: ratioValue(monitor, '30dRatio'), icon: 'material-symbols:calendar-month' },
						{ label: '90天', value: ratioValue(monitor, '90dRatio'), icon: 'material-symbols:calendar-view-month' },
						{ label: '总体', value: averageUptime(monitor), icon: 'material-symbols:bar-chart' },
					] as item}
						<div class="grid grid-cols-[7.5rem_1fr_5rem] items-center gap-3">
							<div class="flex items-center gap-1.5">
								<Icon icon={item.icon} class="text-75 shrink-0 text-[1rem]" aria-hidden="true" />
								<span class="text-75 whitespace-nowrap text-sm">{item.label}</span>
							</div>
							<div class="h-2 overflow-hidden rounded-full bg-(--btn-regular-bg)" role="progressbar" aria-valuenow={item.value} aria-valuemin="0" aria-valuemax="100" aria-label={`${item.label}运行时间`}>
								<div class={`h-full transition-all ${getUptimeColor(item.value)}`} style={`width: ${Math.min(item.value, 100)}%`}></div>
							</div>
							<div class="text-90 whitespace-nowrap text-right text-lg font-bold">{formatRatio(item.value)}%</div>
						</div>
					{/each}
				</div>
			</section>

			<section class="card-base card-shadow p-5">
				<div class="mb-4 flex items-center gap-2.5">
					<Icon icon="material-symbols:speed" class="text-(--primary) text-[1.5rem]" aria-hidden="true" />
					<h3 class="text-90 text-lg font-semibold">响应时间</h3>
				</div>
				<div class="grid grid-cols-2 gap-4">
					<div class="rounded-lg bg-(--btn-regular-bg) p-3">
						<div class="mb-1 flex items-center gap-1.5">
							<Icon icon="material-symbols:avg-time" class="text-75 text-[1rem]" aria-hidden="true" />
							<div class="text-75 text-xs">平均响应时间</div>
						</div>
						<div class="text-90 text-xl font-bold">{formatTime(monitor.responseTimeStats.avg_response_time)}</div>
					</div>
					<div class="rounded-lg bg-(--btn-regular-bg) p-3">
						<div class="mb-1 flex items-center gap-1.5">
							<Icon icon="material-symbols:trending-down" class="text-75 text-[1rem]" aria-hidden="true" />
							<div class="text-75 text-xs">最小响应时间</div>
						</div>
						<div class="text-90 text-xl font-bold">{formatTime(monitor.responseTimeStats.min_response_time)}</div>
					</div>
					<div class="rounded-lg bg-(--btn-regular-bg) p-3">
						<div class="mb-1 flex items-center gap-1.5">
							<Icon icon="material-symbols:trending-up" class="text-75 text-[1rem]" aria-hidden="true" />
							<div class="text-75 text-xs">最大响应时间</div>
						</div>
						<div class="text-90 text-xl font-bold">{formatTime(monitor.responseTimeStats.max_response_time)}</div>
					</div>
					<div class="rounded-lg bg-(--btn-regular-bg) p-3">
						<div class="mb-1 flex items-center gap-1.5">
							<Icon icon="material-symbols:summarize" class="text-75 text-[1rem]" aria-hidden="true" />
							<div class="text-75 text-xs">总请求数</div>
						</div>
						<div class="text-90 text-xl font-bold">{monitor.responseTimeStats.total_requests.toLocaleString()}</div>
					</div>
				</div>
			</section>
		</div>

		<section class="card-base card-shadow p-5">
			<div class="mb-4 flex items-center gap-2.5">
				<Icon icon="material-symbols:history" class="text-(--primary) text-[1.5rem]" aria-hidden="true" />
				<h3 class="text-90 text-lg font-semibold">近期事件</h3>
			</div>
			{#if monitor.logs.length === 0}
				<p class="text-75 text-sm">暂无事件。</p>
			{:else}
				<ul class="list-none space-y-0">
					{#each monitor.logs.slice(0, visibleEvents) as log}
						<li class="-mx-2 flex items-start gap-3 rounded-md px-2 py-3 transition-colors hover:bg-[var(--btn-plain-bg-hover)]">
							<div class="min-w-0 flex-1">
								<div class="mb-1.5 flex flex-wrap items-center gap-2">
									<span class={`inline-flex items-center gap-1 text-sm font-semibold ${logClassColors[log.class] || 'text-[var(--text-secondary)]'}`}>
										{#if logIcons[log.label]}
											<Icon icon={logIcons[log.label]} class="text-[1rem]" aria-hidden="true" />
										{/if}
										{logLabels[log.label] || log.label}
									</span>
									<time class="text-75 text-xs" datetime={log.dateGMTISO}>{formatRelativeTime(log.date)}</time>
									{#if log.duration !== '0 seconds'}
										<span class="text-75 rounded bg-[var(--btn-regular-bg)] px-2 py-0.5 text-xs font-medium">持续: {log.duration}</span>
									{/if}
								</div>
								<p class="text-75 text-sm leading-relaxed">{log.label === 'down' ? log.reason.detail.full || log.reason.detail.short : '无相关声明。'}</p>
							</div>
						</li>
					{/each}
				</ul>
				<div class="relative mt-3 pt-3">
					<div class="absolute left-0 right-0 top-0 h-px bg-[var(--line-divider)] opacity-20"></div>
					{#if monitor.logs.length > visibleEvents}
						{@const nextBatch = Math.min(10, monitor.logs.length - visibleEvents)}
						<button class="btn-regular inline-flex w-full items-center justify-center gap-1 rounded-md px-3 py-1.5 text-sm transition active:scale-95" type="button" aria-label={`展开更多 ${nextBatch} 条事件`} onclick={() => (visibleEvents = Math.min(visibleEvents + 10, monitor.logs.length))}>
							<Icon icon="material-symbols:expand-more" class="text-[1rem]" aria-hidden="true" />
							展开更多 ({nextBatch} 条)
						</button>
					{:else}
						<div class="py-2 text-center"><span class="text-75 text-xs">已全部显示</span></div>
					{/if}
				</div>
			{/if}
		</section>
	</div>
{/if}
