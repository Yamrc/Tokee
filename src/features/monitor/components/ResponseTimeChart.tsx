import { Component, onMount, onCleanup, createSignal, createEffect, createMemo } from 'solid-js';
import type { ResponseTimeData } from '@/types/api';

interface ResponseTimeChartProps {
	responseTimes: ResponseTimeData[];
	avgResponseTime: number;
	minResponseTime: number;
	maxResponseTime: number;
}

interface ChartPoint {
	x: number;
	y: number;
	value: number;
	datetime: string;
}

const CHART_HEIGHT = 300;
const PADDING_X = 50;
const PADDING_Y = 30;
const STROKE_WIDTH = 2;
const MAX_GAP = 30 * 60 * 1000;

const getCssVar = (name: string, fallback: string): string =>
	getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;

const formatTime = (value: number, decimals = 0): string =>
	value < 1000 ? `${Math.round(value)}ms` : `${(value / 1000).toFixed(decimals)}s`;

const formatDatetime = (timestamp: number): string => {
	const date = new Date(timestamp);
	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	const month = months[date.getMonth()];
	const day = date.getDate();
	const year = date.getFullYear();
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	return `${month} ${day}, ${year} ${hours}:${minutes}`;
};

const formatTimeLabel = (timestamp: number): string => {
	const date = new Date(timestamp);
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	return `${hours}:${minutes}`;
};

const createSplinePath = (points: ChartPoint[], breaks: number[] = []): string => {
	if (points.length < 2) return '';
	if (points.length === 2) return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;

	const buildPath = (segment: ChartPoint[]): string => {
		if (segment.length < 2) return '';
		const path: string[] = [`M ${segment[0].x} ${segment[0].y}`];
		for (let i = 0; i < segment.length - 1; i++) {
			const p0 = i > 0 ? segment[i - 1] : segment[i];
			const p1 = segment[i];
			const p2 = segment[i + 1];
			const p3 = i < segment.length - 2 ? segment[i + 2] : segment[i + 1];
			const t = 0.5;
			const cp1x = p1.x + (p2.x - p0.x) / 6 * t;
			const cp1y = p1.y + (p2.y - p0.y) / 6 * t;
			const cp2x = p2.x - (p3.x - p1.x) / 6 * t;
			const cp2y = p2.y - (p3.y - p1.y) / 6 * t;
			path.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`);
		}
		return path.join(' ');
	};

	if (breaks.length === 0) return buildPath(points);

	const paths: string[] = [];
	let startIdx = 0;
	for (const breakIdx of breaks) {
		const segment = points.slice(startIdx, breakIdx);
		if (segment.length >= 2) paths.push(buildPath(segment));
		startIdx = breakIdx;
	}
	const lastSegment = points.slice(startIdx);
	if (lastSegment.length >= 2) paths.push(buildPath(lastSegment));
	return paths.join(' ');
};

const ResponseTimeChart: Component<ResponseTimeChartProps> = (props) => {
	let svgElement: SVGSVGElement | undefined;
	let containerElement: HTMLDivElement | undefined;
	let tooltipElement: HTMLDivElement | undefined;
	let observer: MutationObserver | null = null;

	const [chartWidth, setChartWidth] = createSignal(0);
	const [hoveredPoint, setHoveredPoint] = createSignal<ChartPoint | null>(null);
	const [tooltipPosition, setTooltipPosition] = createSignal({ x: 0, y: 0, visible: false });

	const responseTimes = createMemo(() => props.responseTimes || []);

	const sortedData = createMemo(() => {
		const data = responseTimes();
		if (data.length === 0) return [];
		return [...data].sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
	});

	const chartData = createMemo<ChartPoint[]>(() => {
		const data = sortedData();
		if (data.length === 0) return [];

		const width = chartWidth();
		const plotWidth = width - PADDING_X * 2;
		const plotHeight = CHART_HEIGHT - PADDING_Y * 2;

		const xValues = data.map(rt => new Date(rt.datetime).getTime());
		const yValues = data.map(rt => rt.value);
		const xMin = Math.min(...xValues);
		const xMax = Math.max(...xValues);
		const yMin = Math.min(...yValues);
		const yMax = Math.max(...yValues);
		const xRange = xMax - xMin || 1;
		const yRange = yMax - yMin || 1;

		return data.map((rt, idx) => ({
			x: PADDING_X + (xValues[idx] - xMin) / xRange * plotWidth,
			y: PADDING_Y + plotHeight - (yValues[idx] - yMin) / yRange * plotHeight,
			value: rt.value,
			datetime: rt.datetime,
		}));
	});

	const breaks = createMemo(() => {
		const data = sortedData();
		if (data.length < 2) return [];

		const result: number[] = [];
		for (let i = 1; i < data.length; i++) {
			const prevTime = new Date(data[i - 1].datetime).getTime();
			const currTime = new Date(data[i].datetime).getTime();
			if (currTime - prevTime > MAX_GAP) result.push(i);
		}
		return result;
	});

	const gapRegions = createMemo(() => {
		const data = sortedData();
		if (data.length < 2) return [];

		const width = chartWidth();
		const plotWidth = width - PADDING_X * 2;
		const xValues = data.map(rt => new Date(rt.datetime).getTime());
		const xMin = Math.min(...xValues);
		const xMax = Math.max(...xValues);
		const xRange = xMax - xMin || 1;

		const result: Array<{ x: number; width: number; startTime: string; endTime: string }> = [];
		for (let i = 1; i < data.length; i++) {
			const prevTime = new Date(data[i - 1].datetime).getTime();
			const currTime = new Date(data[i].datetime).getTime();
			const gap = currTime - prevTime;
			if (gap > MAX_GAP) {
				const prevX = PADDING_X + (prevTime - xMin) / xRange * plotWidth;
				const currX = PADDING_X + (currTime - xMin) / xRange * plotWidth;
				result.push({ x: prevX, width: currX - prevX, startTime: data[i - 1].datetime, endTime: data[i].datetime });
			}
		}
		return result;
	});

	const linePath = createMemo(() => createSplinePath(chartData(), breaks()));

	const areaPath = createMemo(() => {
		const points = chartData();
		if (points.length === 0) return '';

		const data = sortedData();
		if (data.length === 0) return '';

		const xValues = data.map(rt => new Date(rt.datetime).getTime());
		const xMin = Math.min(...xValues);
		const xMax = Math.max(...xValues);
		const xRange = xMax - xMin || 1;
		const width = chartWidth();
		const plotWidth = width - PADDING_X * 2;
		const bottomY = CHART_HEIGHT - PADDING_Y;

		if (breaks().length === 0) {
			const line = createSplinePath(points, []);
			return `${line} L ${points[points.length - 1].x} ${bottomY} L ${points[0].x} ${bottomY} Z`;
		}

		const buildArea = (segment: ChartPoint[], dataSegment: typeof data): string => {
			if (segment.length < 2) return '';
			const line = createSplinePath(segment, []);
			const firstX = PADDING_X + (new Date(dataSegment[0].datetime).getTime() - xMin) / xRange * plotWidth;
			const lastX = PADDING_X + (new Date(dataSegment[dataSegment.length - 1].datetime).getTime() - xMin) / xRange * plotWidth;
			return `${line} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
		};

		const paths: string[] = [];
		let startIdx = 0;
		for (const breakIdx of breaks()) {
			const segment = points.slice(startIdx, breakIdx);
			const dataSegment = data.slice(startIdx, breakIdx);
			if (segment.length >= 2) paths.push(buildArea(segment, dataSegment));
			startIdx = breakIdx;
		}
		const lastSegment = points.slice(startIdx);
		const lastDataSegment = data.slice(startIdx);
		if (lastSegment.length >= 2) paths.push(buildArea(lastSegment, lastDataSegment));
		return paths.join(' ');
	});

	const xAxisLabels = createMemo(() => {
		const data = responseTimes();
		const width = chartWidth();
		const plotWidth = width - PADDING_X * 2;
		const labelCount = Math.min(6, Math.max(2, Math.floor(plotWidth / 80)));

		if (data.length === 0) {
			return Array.from({ length: labelCount + 1 }, (_, i) => {
				const x = PADDING_X + (plotWidth * i) / labelCount;
				const anchor: 'start' | 'middle' | 'end' = i === 0 ? 'start' : i === labelCount ? 'end' : 'middle';
				return { x, label: '--:--', anchor };
			});
		}

		const xValues = data.map(rt => new Date(rt.datetime).getTime());
		const xMin = Math.min(...xValues);
		const xMax = Math.max(...xValues);
		const xRange = xMax - xMin || 1;

		return Array.from({ length: labelCount + 1 }, (_, i) => {
			const timestamp = xMin + (xRange * i) / labelCount;
			let anchor: 'start' | 'middle' | 'end' = 'middle';
			if (i === 0) anchor = 'start';
			else if (i === labelCount) anchor = 'end';
			const x = PADDING_X + (timestamp - xMin) / xRange * plotWidth;
			return { x: anchor === 'start' ? Math.max(PADDING_X, x) : anchor === 'end' ? Math.min(width - PADDING_X, x) : x, label: formatTimeLabel(timestamp), anchor };
		});
	});

	const yAxisLabels = createMemo(() => {
		const points = chartData();
		const plotHeight = CHART_HEIGHT - PADDING_Y * 2;

		if (points.length === 0) {
			return Array.from({ length: 6 }, (_, i) => ({ y: PADDING_Y + plotHeight * (i / 5), label: '--' }));
		}

		const yValues = points.map(p => p.value);
		const yMin = Math.min(...yValues);
		const yMax = Math.max(...yValues);
		const yRange = yMax - yMin || 1;

		return Array.from({ length: 6 }, (_, i) => {
			const value = yMin + (yMax - yMin) * (i / 5);
			const y = PADDING_Y + plotHeight - (value - yMin) / yRange * plotHeight;
			return { y, label: formatTime(value, 1) };
		});
	});

	const isDark = createMemo(() => document.documentElement.classList.contains('dark'));

	const tooltipStyle = createMemo(() => ({
		background: isDark() ? 'oklch(.19 .015 345)' : 'white',
		border: `1px solid ${isDark() ? 'oklch(.30 .035 345)' : 'rgba(0,0,0,0.1)'}`,
		color: isDark() ? 'oklch(.90 .01 345)' : 'oklch(.25 .02 345)',
	}));

	const gapBgColor = createMemo(() => isDark() ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)');
	const gapBorderColor = createMemo(() => isDark() ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)');
	const primaryColor = createMemo(() => getCssVar('--primary', '#FF6699'));
	const textColor = createMemo(() => getCssVar('--text-secondary', '#666'));
	const lineColor = createMemo(() => getCssVar('--line-divider', '#ddd'));

	const updateChartWidth = () => {
		if (containerElement) setChartWidth(containerElement.clientWidth || 600);
	};

	const handlePointerMove = (e: PointerEvent | TouchEvent) => {
		if (!svgElement || !containerElement) return;

		const points = chartData();
		if (points.length === 0) {
			setHoveredPoint(null);
			setTooltipPosition(prev => ({ ...prev, visible: false }));
			return;
		}

		const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
		const rect = svgElement.getBoundingClientRect();
		const x = clientX - rect.left;

		let closest: ChartPoint | null = null;
		let minDist = Infinity;
		for (const point of points) {
			const dist = Math.abs(point.x - x);
			if (dist < minDist) { minDist = dist; closest = point; }
		}

		const threshold = 'touches' in e ? 30 : 20;
		if (closest && minDist < threshold) {
			setHoveredPoint(closest);
			const containerRect = containerElement.getBoundingClientRect();
			setTooltipPosition({
				x: clientX - containerRect.left,
				y: ('touches' in e ? e.touches[0].clientY : e.clientY) - containerRect.top - 60,
				visible: true,
			});
		} else {
			setHoveredPoint(null);
			setTooltipPosition(prev => ({ ...prev, visible: false }));
		}
	};

	const handlePointerLeave = () => {
		setHoveredPoint(null);
		setTooltipPosition(prev => ({ ...prev, visible: false }));
	};

	onMount(() => {
		updateChartWidth();
		const resizeObserver = new ResizeObserver(updateChartWidth);
		if (containerElement) resizeObserver.observe(containerElement);

		observer = new MutationObserver(() => svgElement?.dispatchEvent(new Event('themechange')));
		observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
	});

	onCleanup(() => {
		observer?.disconnect();
	});

	const noData = createMemo(() => responseTimes().length === 0);

	return (
		<div class="w-full relative overflow-visible" ref={containerElement}>
			<svg
				ref={svgElement}
				width={chartWidth()}
				height={CHART_HEIGHT}
				class="w-full"
				style={{ 'touch-action': 'pan-y', overflow: 'visible' }}
				onPointerMove={handlePointerMove}
				onPointerLeave={handlePointerLeave}
				onTouchMove={handlePointerMove}
				onTouchEnd={handlePointerLeave}
			>
				{noData() ? (
					<text x={chartWidth() / 2} y={CHART_HEIGHT / 2} text-anchor="middle" dominant-baseline="middle" class="text-lg" fill={textColor()}>
						暂无响应时间数据
					</text>
				) : (
					<>
						<defs>
							<linearGradient id="area-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
								<stop offset="0%" stop-color={primaryColor()} stop-opacity="0.4" />
								<stop offset="90%" stop-color={primaryColor()} stop-opacity="0.1" />
								<stop offset="100%" stop-color={primaryColor()} stop-opacity="0.1" />
							</linearGradient>
						</defs>

						<g class="grid-lines">
							{yAxisLabels().map(label => (
								<line x1={PADDING_X} y1={label.y} x2={chartWidth() - PADDING_X} y2={label.y} stroke={lineColor()} stroke-width="1" stroke-dasharray="4" vector-effect="non-scaling-stroke" />
							))}
						</g>

						<g class="gap-regions">
							{gapRegions().map(region => (
								<g>
									<rect x={region.x} y={PADDING_Y} width={region.width} height={CHART_HEIGHT - PADDING_Y * 2} fill={gapBgColor()} />
									<line x1={region.x} y1={PADDING_Y} x2={region.x} y2={CHART_HEIGHT - PADDING_Y} stroke={gapBorderColor()} stroke-width="1" stroke-dasharray="2" />
									<line x1={region.x + region.width} y1={PADDING_Y} x2={region.x + region.width} y2={CHART_HEIGHT - PADDING_Y} stroke={gapBorderColor()} stroke-width="1" stroke-dasharray="2" />
								</g>
							))}
						</g>

						<path d={areaPath()} fill="url(#area-gradient)" class="area-path" />
						<path d={linePath()} fill="none" stroke={primaryColor()} stroke-width={STROKE_WIDTH} stroke-linecap="round" stroke-linejoin="round" class="line-path" />

						{hoveredPoint() && (
							<g class="hover-indicator">
								<line x1={hoveredPoint()!.x} y1={PADDING_Y} x2={hoveredPoint()!.x} y2={CHART_HEIGHT - PADDING_Y} stroke={primaryColor()} stroke-width="1" stroke-dasharray="4" opacity="0.5" />
								<circle cx={hoveredPoint()!.x} cy={hoveredPoint()!.y} r="4" fill={primaryColor()} stroke="white" stroke-width="2" />
							</g>
						)}

						<g class="x-axis-labels" font-size="11" fill={textColor()}>
							{xAxisLabels().map(label => (
								<text x={Math.max(0, Math.min(label.x, chartWidth()))} y={CHART_HEIGHT - PADDING_Y + 15} text-anchor={label.anchor} dominant-baseline="hanging">
									{label.label}
								</text>
							))}
						</g>
						<g class="y-axis-labels" font-size="11" fill={textColor()}>
							{yAxisLabels().map(label => (
								<text x={Math.max(0, PADDING_X - 12)} y={Math.max(PADDING_Y, Math.min(label.y, CHART_HEIGHT - PADDING_Y))} text-anchor="end" dominant-baseline="middle">
									{label.label}
								</text>
							))}
						</g>
					</>
				)}
			</svg>

			{noData() && (
				<div class="absolute inset-0 pointer-events-none" style={{ background: isDark() ? 'oklch(.16 .014 295 / 0.3)' : 'oklch(.95 .01 295 / 0.3)', 'backdrop-filter': 'blur(1px)' }} />
			)}

			{tooltipPosition().visible && hoveredPoint() && (
				<div
					ref={tooltipElement}
					class="absolute pointer-events-none z-10 px-3 py-2 rounded-md shadow-lg text-sm"
					style={{
						left: window.innerWidth <= 768 ? '50%' : `${Math.min(tooltipPosition().x, chartWidth() - 200)}px`,
						top: window.innerWidth <= 768 ? '50%' : `${Math.max(10, tooltipPosition().y)}px`,
						...tooltipStyle(),
						transform: window.innerWidth <= 768 ? 'translate(-50%, -50%)' : tooltipPosition().x > chartWidth() - 200 ? 'translateX(-100%)' : 'none',
					}}
				>
					<div class="flex items-center gap-2 mb-1">
						<div class="w-3 h-3 rounded-full" style={{ background: primaryColor() }} />
						<span class="font-medium">响应时间</span>
					</div>
					<div class="text-xs opacity-75 mb-1">{formatDatetime(new Date(hoveredPoint()!.datetime).getTime())}</div>
					<div class="font-semibold">{formatTime(hoveredPoint()!.value, 2)}</div>
				</div>
			)}
		</div>
	);
};

export default ResponseTimeChart;
