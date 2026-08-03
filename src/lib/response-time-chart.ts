import type { ResponseTimeData } from './uptime-robot-types';

export interface PreparedResponseTimeSample extends ResponseTimeData {
	timestamp: number;
}

export const MAX_RESPONSE_TIME_GAP_MS = 30 * 60 * 1000;
export const RESPONSE_TIME_CHART_HEIGHT = 280;

export interface ResponseTimeChartPoint extends PreparedResponseTimeSample {
	x: number;
	y: number;
}

export interface ResponseTimeChartSegment {
	points: ResponseTimeChartPoint[];
	linePath: string;
	areaPath: string;
}

export interface ResponseTimeGapRegion {
	x: number;
	width: number;
	startTimestamp: number;
	endTimestamp: number;
}

export interface ResponseTimeChartGeometry {
	width: number;
	height: number;
	plot: { left: number; right: number; top: number; bottom: number; width: number; height: number };
	points: ResponseTimeChartPoint[];
	segments: ResponseTimeChartSegment[];
	gaps: ResponseTimeGapRegion[];
	xLabels: Array<{ x: number; timestamp: number; anchor: 'start' | 'middle' | 'end' }>;
	yLabels: Array<{ y: number; value: number }>;
}

export function prepareResponseTimeSeries(samples: ResponseTimeData[]): PreparedResponseTimeSample[] {
	return samples
		.map((sample) => ({ ...sample, timestamp: new Date(sample.datetime).getTime() }))
		.filter((sample) => Number.isFinite(sample.value) && sample.value >= 0 && Number.isFinite(sample.timestamp))
		.sort((a, b) => a.timestamp - b.timestamp);
}

export function splitResponseTimeSeries<T extends { timestamp: number }>(samples: T[], maxGapMs = MAX_RESPONSE_TIME_GAP_MS): T[][] {
	if (samples.length === 0) return [];

	const segments: T[][] = [[samples[0]]];
	for (let index = 1; index < samples.length; index += 1) {
		const previous = samples[index - 1];
		const current = samples[index];
		if (current.timestamp - previous.timestamp > maxGapMs) segments.push([]);
		segments[segments.length - 1].push(current);
	}
	return segments;
}

export function createMonotonePath(points: Array<{ x: number; y: number }>): string {
	if (points.length === 0) return '';
	if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
	if (points.length === 2) return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;

	const intervals = Array.from({ length: points.length - 1 }, (_, index) => {
		const dx = points[index + 1].x - points[index].x || 1;
		return { dx, slope: (points[index + 1].y - points[index].y) / dx };
	});
	const tangents = new Array<number>(points.length);
	tangents[0] = intervals[0].slope;
	tangents[tangents.length - 1] = intervals[intervals.length - 1].slope;
	for (let index = 1; index < points.length - 1; index += 1) {
		const previousSlope = intervals[index - 1].slope;
		const nextSlope = intervals[index].slope;
		if (previousSlope === 0 || nextSlope === 0 || previousSlope * nextSlope < 0) {
			tangents[index] = 0;
		} else {
			const previousWidth = intervals[index - 1].dx;
			const nextWidth = intervals[index].dx;
			const weight1 = 2 * nextWidth + previousWidth;
			const weight2 = nextWidth + 2 * previousWidth;
			tangents[index] = (weight1 + weight2) / (weight1 / previousSlope + weight2 / nextSlope);
		}
	}

	const path = [`M ${points[0].x} ${points[0].y}`];
	for (let index = 0; index < points.length - 1; index += 1) {
		const current = points[index];
		const next = points[index + 1];
		const controlWidth = intervals[index].dx / 3;
		const localMin = Math.min(current.y, next.y);
		const localMax = Math.max(current.y, next.y);
		const controlY1 = Math.min(localMax, Math.max(localMin, current.y + tangents[index] * controlWidth));
		const controlY2 = Math.min(localMax, Math.max(localMin, next.y - tangents[index + 1] * controlWidth));
		path.push(`C ${current.x + controlWidth} ${controlY1}, ${next.x - controlWidth} ${controlY2}, ${next.x} ${next.y}`);
	}
	return path.join(' ');
}

export function createResponseTimeGeometry(
	samples: ResponseTimeData[],
	containerWidth: number,
	height = RESPONSE_TIME_CHART_HEIGHT,
): ResponseTimeChartGeometry {
	const width = Math.max(240, containerWidth || 0);
	const plot = {
		left: width < 420 ? 42 : 48,
		right: width - 12,
		top: 16,
		bottom: height - 30,
		width: 0,
		height: 0,
	};
	plot.width = Math.max(1, plot.right - plot.left);
	plot.height = Math.max(1, plot.bottom - plot.top);

	const prepared = prepareResponseTimeSeries(samples);
	if (prepared.length === 0) {
		return { width, height, plot, points: [], segments: [], gaps: [], xLabels: [], yLabels: [] };
	}

	const firstTimestamp = prepared[0].timestamp;
	const lastTimestamp = prepared[prepared.length - 1].timestamp;
	const timeRange = lastTimestamp - firstTimestamp || 1;
	const values = prepared.map((sample) => sample.value);
	const minValue = Math.min(...values);
	const maxValue = Math.max(...values);
	const valueRange = maxValue - minValue;
	const paddedMin = valueRange === 0 ? Math.max(0, minValue - Math.max(1, minValue * 0.1)) : Math.max(0, minValue - valueRange * 0.04);
	const paddedMax = valueRange === 0 ? maxValue + Math.max(1, maxValue * 0.1) : maxValue + valueRange * 0.04;
	const paddedRange = paddedMax - paddedMin || 1;

	const points = prepared.map<ResponseTimeChartPoint>((sample) => ({
		...sample,
		x: prepared.length === 1 ? plot.left + plot.width / 2 : plot.left + ((sample.timestamp - firstTimestamp) / timeRange) * plot.width,
		y: plot.bottom - ((sample.value - paddedMin) / paddedRange) * plot.height,
	}));

	const pointSegments = splitResponseTimeSeries(points);
	const segments = pointSegments.map<ResponseTimeChartSegment>((segment) => {
		const linePath = createMonotonePath(segment);
		const areaPath = segment.length < 2
			? ''
			: `${linePath} L ${segment[segment.length - 1].x} ${plot.bottom} L ${segment[0].x} ${plot.bottom} Z`;
		return { points: segment, linePath, areaPath };
	});

	const gaps: ResponseTimeGapRegion[] = [];
	for (let index = 1; index < points.length; index += 1) {
		const previous = points[index - 1];
		const current = points[index];
		if (current.timestamp - previous.timestamp > MAX_RESPONSE_TIME_GAP_MS) {
			gaps.push({
				x: previous.x,
				width: current.x - previous.x,
				startTimestamp: previous.timestamp,
				endTimestamp: current.timestamp,
			});
		}
	}

	const xLabelCount = Math.max(2, Math.min(5, Math.floor(plot.width / 130)));
	const xLabels = Array.from({ length: xLabelCount + 1 }, (_, index) => {
		const ratio = index / xLabelCount;
		return {
			x: plot.left + plot.width * ratio,
			timestamp: firstTimestamp + timeRange * ratio,
			anchor: index === 0 ? 'start' as const : index === xLabelCount ? 'end' as const : 'middle' as const,
		};
	});

	const yLabelCount = 5;
	const yLabels = Array.from({ length: yLabelCount }, (_, index) => {
		const ratio = index / (yLabelCount - 1);
		return {
			y: plot.top + plot.height * ratio,
			value: paddedMax - paddedRange * ratio,
		};
	});

	return { width, height, plot, points, segments, gaps, xLabels, yLabels };
}
