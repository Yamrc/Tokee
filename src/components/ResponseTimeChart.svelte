<script lang="ts">
	import { onMount } from 'svelte';
	import { formatTime } from '@lib/format';
	import { createResponseTimeGeometry, RESPONSE_TIME_CHART_HEIGHT, type ResponseTimeChartPoint } from '@lib/response-time-chart';
	import { formatLocalDatetime } from '@lib/time';
	import type { ResponseTimeData } from '@lib/uptime-robot-types';

	interface Props {
		responseTimes?: ResponseTimeData[];
	}

	let { responseTimes = [] }: Props = $props();
	let container: HTMLDivElement;
	let svgElement: SVGSVGElement;
	let width = $state(0);
	let hoveredPoint: ResponseTimeChartPoint | null = $state(null);
	let tooltipX = $state(0);
	let tooltipY = $state(0);
	const componentId = $props.id();
	const gradientId = `${componentId}-response-time-area`;

	const chart = $derived(createResponseTimeGeometry(responseTimes, width, RESPONSE_TIME_CHART_HEIGHT));
	const empty = $derived(chart.points.length === 0);
	const xLabelShowsDate = $derived(chart.xLabels.length > 1 && new Date(chart.xLabels[0].timestamp).toDateString() !== new Date(chart.xLabels[chart.xLabels.length - 1].timestamp).toDateString());

	const formatYAxis = (value: number): string =>
		value < 1000 ? `${Math.round(value)}ms` : `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}s`;

	const formatXAxis = (timestamp: number): string => {
		const date = new Date(timestamp);
		return new Intl.DateTimeFormat(undefined, xLabelShowsDate
			? { month: 'numeric', day: 'numeric', hour: '2-digit' }
			: { hour: '2-digit', minute: '2-digit' }).format(date);
	};

	function updateHover(event: PointerEvent): void {
		if (!svgElement || chart.points.length === 0) return;

		const rect = svgElement.getBoundingClientRect();
		const scaleX = chart.width / rect.width;
		const pointerX = (event.clientX - rect.left) * scaleX;
		let closest = chart.points[0];
		let minimumDistance = Math.abs(closest.x - pointerX);
		for (const point of chart.points.slice(1)) {
			const distance = Math.abs(point.x - pointerX);
			if (distance < minimumDistance) {
				closest = point;
				minimumDistance = distance;
			}
		}

		hoveredPoint = closest;
		tooltipX = Math.min(Math.max((closest.x / chart.width) * rect.width, 92), Math.max(92, rect.width - 92));
		tooltipY = Math.max(8, (closest.y / chart.height) * rect.height - 78);
	}

	function clearHover(): void {
		hoveredPoint = null;
	}

	onMount(() => {
		const updateWidth = (): void => {
			width = container.clientWidth;
			hoveredPoint = null;
		};
		updateWidth();
		const resizeObserver = new ResizeObserver(updateWidth);
		resizeObserver.observe(container);
		return () => resizeObserver.disconnect();
	});
</script>

<div class="relative min-w-0" bind:this={container}>
	<svg
		bind:this={svgElement}
		class="block h-auto w-full select-none overflow-visible"
		viewBox={`0 0 ${chart.width} ${chart.height}`}
		role="img"
		aria-label={empty ? '暂无响应时间趋势数据' : `响应时间趋势，共 ${chart.points.length} 个采样点`}
		style="touch-action: pan-y;"
		onpointermove={updateHover}
		onpointerleave={clearHover}
		onpointercancel={clearHover}
	>
		<title>{empty ? '暂无响应时间趋势数据' : '响应时间趋势'}</title>
		<defs>
			<linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stop-color="var(--primary)" stop-opacity="0.38" />
				<stop offset="88%" stop-color="var(--primary)" stop-opacity="0.08" />
				<stop offset="100%" stop-color="var(--primary)" stop-opacity="0.02" />
			</linearGradient>
		</defs>

		{#if empty}
			<text x={chart.width / 2} y={chart.height / 2} text-anchor="middle" dominant-baseline="middle" fill="var(--text-secondary)" font-size="14">
				暂无响应时间数据
			</text>
		{:else}
			{#each chart.yLabels as label}
				<line
					x1={chart.plot.left}
					y1={label.y}
					x2={chart.plot.right}
					y2={label.y}
					stroke="var(--line-divider)"
					stroke-width="1"
					stroke-dasharray="4 5"
					vector-effect="non-scaling-stroke"
				/>
				<text x={chart.plot.left - 8} y={label.y} text-anchor="end" dominant-baseline="middle" fill="var(--text-secondary)" font-size="10.5">
					{formatYAxis(label.value)}
				</text>
			{/each}

			{#each chart.gaps as gap}
				<rect x={gap.x} y={chart.plot.top} width={gap.width} height={chart.plot.height} fill="var(--text-primary)" opacity="0.025" />
				<line x1={gap.x} y1={chart.plot.top} x2={gap.x} y2={chart.plot.bottom} stroke="var(--line-divider)" stroke-width="1" stroke-dasharray="2 4" vector-effect="non-scaling-stroke" />
				<line x1={gap.x + gap.width} y1={chart.plot.top} x2={gap.x + gap.width} y2={chart.plot.bottom} stroke="var(--line-divider)" stroke-width="1" stroke-dasharray="2 4" vector-effect="non-scaling-stroke" />
			{/each}

			{#each chart.segments as segment}
				{#if segment.areaPath}
					<path d={segment.areaPath} fill={`url(#${gradientId})`} />
				{/if}
				<path d={segment.linePath} fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" />
				{#if segment.points.length === 1}
					<circle cx={segment.points[0].x} cy={segment.points[0].y} r="3" fill="var(--primary)" />
				{/if}
			{/each}

			{#if hoveredPoint}
				<line x1={hoveredPoint.x} y1={chart.plot.top} x2={hoveredPoint.x} y2={chart.plot.bottom} stroke="var(--primary)" stroke-width="1" stroke-dasharray="4 4" opacity="0.55" vector-effect="non-scaling-stroke" />
				<circle cx={hoveredPoint.x} cy={hoveredPoint.y} r="4" fill="var(--primary)" stroke="var(--card-bg)" stroke-width="2" vector-effect="non-scaling-stroke" />
			{/if}

			{#each chart.xLabels as label}
				<text x={label.x} y={chart.plot.bottom + 18} text-anchor={label.anchor} dominant-baseline="middle" fill="var(--text-secondary)" font-size="10.5">
					{formatXAxis(label.timestamp)}
				</text>
			{/each}
		{/if}
	</svg>

	{#if hoveredPoint}
		<div
			class="pointer-events-none absolute z-10 min-w-44 -translate-x-1/2 rounded-lg border border-(--line-color) bg-(--float-panel-bg) px-3 py-2 text-sm shadow-lg"
			style={`left: ${tooltipX}px; top: ${tooltipY}px;`}
			role="status"
		>
			<div class="mb-1 flex items-center gap-2 font-medium text-(--text-primary)">
				<span class="h-2.5 w-2.5 rounded-full bg-(--primary)"></span>
				响应时间
			</div>
			<div class="text-75 text-xs">{formatLocalDatetime(hoveredPoint.datetime)}</div>
			<div class="mt-1 font-semibold text-(--text-primary)">{formatTime(hoveredPoint.value)}</div>
		</div>
	{/if}
</div>
