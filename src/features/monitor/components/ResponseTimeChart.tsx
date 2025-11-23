import { Component, onMount, onCleanup, createSignal, createEffect } from 'solid-js';
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

const get_css_var = (name: string, fallback: string): string =>
		getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;

const format_time = (value: number, decimals = 0): string =>
		value < 1000 ? `${Math.round(value)}ms` : `${(value / 1000).toFixed(decimals)}s`;

const format_datetime = (timestamp: number): string => {
	const date = new Date(timestamp);
	const month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	const month = month_names[date.getMonth()];
	const day = date.getDate();
	const year = date.getFullYear();
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	return `${month} ${day}, ${year} ${hours}:${minutes}`;
};

const format_time_label = (timestamp: number): string => {
	const date = new Date(timestamp);
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	return `${hours}:${minutes}`;
};

const catmull_rom_spline = (points: ChartPoint[], tension = 0.5): string => {
	if (points.length < 2) return '';
	if (points.length === 2) {
		return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
	}

	const path: string[] = [];
	path.push(`M ${points[0].x} ${points[0].y}`);

	for (let i = 0; i < points.length - 1; i++) {
		const p0 = i > 0 ? points[i - 1] : points[i];
		const p1 = points[i];
		const p2 = points[i + 1];
		const p3 = i < points.length - 2 ? points[i + 2] : points[i + 1];

		const cp1x = p1.x + (p2.x - p0.x) / 6 * tension;
		const cp1y = p1.y + (p2.y - p0.y) / 6 * tension;
		const cp2x = p2.x - (p3.x - p1.x) / 6 * tension;
		const cp2y = p2.y - (p3.y - p1.y) / 6 * tension;

		path.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`);
	}

	return path.join(' ');
};

const ResponseTimeChart: Component<ResponseTimeChartProps> = (props) => {
	let svg_element: SVGSVGElement | undefined;
	let container_element: HTMLDivElement | undefined;
	let tooltip_element: HTMLDivElement | undefined;
	let observer: MutationObserver | null = null;

	const [chart_width, set_chart_width] = createSignal(0);
	const [hovered_point, set_hovered_point] = createSignal<ChartPoint | null>(null);
	const [tooltip_position, set_tooltip_position] = createSignal({ x: 0, y: 0, visible: false });

	const response_times = () => props.responseTimes || [];
	const chart_data = (): ChartPoint[] => {
		const data = response_times();
		if (data.length === 0) return [];

		const width = chart_width();
		const plot_width = width - PADDING_X * 2;
		const plot_height = CHART_HEIGHT - PADDING_Y * 2;

		const x_values = data.map((rt) => new Date(rt.datetime).getTime());
		const y_values = data.map((rt) => rt.value);

		const x_min = Math.min(...x_values);
		const x_max = Math.max(...x_values);
		const y_min = Math.min(...y_values);
		const y_max = Math.max(...y_values);

		const x_range = x_max - x_min || 1;
		const y_range = y_max - y_min || 1;

		return data.map((rt, idx) => ({
			x: PADDING_X + (x_values[idx] - x_min) / x_range * plot_width,
			y: PADDING_Y + plot_height - (y_values[idx] - y_min) / y_range * plot_height,
			value: rt.value,
			datetime: rt.datetime,
		}));
	};

	const area_path = (): string => {
		const points = chart_data();
		if (points.length === 0) return '';

		const line_path = catmull_rom_spline(points);
		const first_point = points[0];
		const last_point = points[points.length - 1];
		const bottom_y = CHART_HEIGHT - PADDING_Y;

		return `${line_path} L ${last_point.x} ${bottom_y} L ${first_point.x} ${bottom_y} Z`;
	};

	const line_path = (): string => {
		const points = chart_data();
		return catmull_rom_spline(points);
	};

	const x_axis_labels = (): Array<{ x: number; label: string; anchor: 'start' | 'middle' | 'end' }> => {
		const data = response_times();
		if (data.length === 0) return [];

		const width = chart_width();
		const plot_width = width - PADDING_X * 2;
		const label_count = Math.min(6, Math.max(2, Math.floor(plot_width / 80)));

		const x_values = data.map((rt) => new Date(rt.datetime).getTime());
		const x_min = Math.min(...x_values);
		const x_max = Math.max(...x_values);
		const x_range = x_max - x_min || 1;

		const labels: Array<{ x: number; label: string; anchor: 'start' | 'middle' | 'end' }> = [];

		for (let i = 0; i <= label_count; i++) {
			const timestamp = x_min + (x_range * i) / label_count;
			const x = PADDING_X + (timestamp - x_min) / x_range * plot_width;

			if (x >= PADDING_X && x <= width - PADDING_X) {
				let anchor: 'start' | 'middle' | 'end' = 'middle';
				if (i === 0) {
					anchor = 'start';
				} else if (i === label_count) {
					anchor = 'end';
				}

				let label_x = x;
				if (anchor === 'start') {
					label_x = Math.max(PADDING_X, x);
				} else if (anchor === 'end') {
					label_x = Math.min(width - PADDING_X, x);
				}

				labels.push({
					x: label_x,
					label: format_time_label(timestamp),
					anchor,
				});
			}
		}

		return labels;
	};

	const y_axis_labels = (): Array<{ y: number; label: string }> => {
		const points = chart_data();
		if (points.length === 0) return [];

		const plot_height = CHART_HEIGHT - PADDING_Y * 2;
		const y_values = points.map((p) => p.value);
		const y_min = Math.min(...y_values);
		const y_max = Math.max(...y_values);
		const y_range = y_max - y_min || 1;

		const label_count = 5;
		const labels: Array<{ y: number; label: string }> = [];

		for (let i = 0; i <= label_count; i++) {
			const value = y_min + (y_max - y_min) * (i / label_count);
			const y = PADDING_Y + plot_height - (value - y_min) / y_range * plot_height;
			labels.push({ y, label: format_time(value, 1) });
		}

		return labels;
	};

	const handle_mouse_move = (e: MouseEvent) => {
		if (!svg_element || !container_element) return;

		const points = chart_data();
		if (points.length === 0) {
			set_tooltip_position({ x: 0, y: 0, visible: false });
			return;
		}

		const rect = svg_element.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		let closest_point: ChartPoint | null = null;
		let min_distance = Infinity;

		for (const point of points) {
			const distance = Math.abs(point.x - x);
			if (distance < min_distance) {
				min_distance = distance;
				closest_point = point;
			}
		}

		if (closest_point && min_distance < 20) {
			set_hovered_point(closest_point);
			const container_rect = container_element.getBoundingClientRect();
			set_tooltip_position({
				x: e.clientX - container_rect.left,
				y: e.clientY - container_rect.top - 60,
				visible: true,
			});
		} else {
			set_hovered_point(null);
			set_tooltip_position({ x: 0, y: 0, visible: false });
		}
	};

	const handle_mouse_leave = () => {
		set_hovered_point(null);
		set_tooltip_position({ x: 0, y: 0, visible: false });
	};

	const handle_touch_move = (e: TouchEvent) => {
		if (!svg_element || !container_element) return;
		e.preventDefault();

		const points = chart_data();
		if (points.length === 0) {
			set_tooltip_position({ x: 0, y: 0, visible: false });
			return;
		}

		const touch = e.touches[0];
		const rect = svg_element.getBoundingClientRect();
		const x = touch.clientX - rect.left;
		const y = touch.clientY - rect.top;

		let closest_point: ChartPoint | null = null;
		let min_distance = Infinity;

		for (const point of points) {
			const distance = Math.abs(point.x - x);
			if (distance < min_distance) {
				min_distance = distance;
				closest_point = point;
			}
		}

		if (closest_point && min_distance < 30) {
			set_hovered_point(closest_point);
			const container_rect = container_element.getBoundingClientRect();
			set_tooltip_position({
				x: touch.clientX - container_rect.left,
				y: touch.clientY - container_rect.top - 60,
				visible: true,
			});
		} else {
			set_hovered_point(null);
			set_tooltip_position({ x: 0, y: 0, visible: false });
		}
	};

	const handle_touch_end = () => {
		set_hovered_point(null);
		set_tooltip_position({ x: 0, y: 0, visible: false });
	};

	const update_chart_width = () => {
		if (container_element) {
			set_chart_width(container_element.clientWidth || 0);
		}
	};

	onMount(() => {
		update_chart_width();
		const resize_observer = new ResizeObserver(update_chart_width);
		if (container_element) {
			resize_observer.observe(container_element);
		}

		observer = new MutationObserver(() => {
			if (svg_element) {
				svg_element.dispatchEvent(new Event('themechange'));
			}
		});
		observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

		return () => {
			resize_observer.disconnect();
		};
	});

	onCleanup(() => {
		observer?.disconnect();
		observer = null;
	});

	createEffect(() => {
		chart_data();
	});

	const is_dark = () => document.documentElement.classList.contains('dark');
	const text_color = () => get_css_var('--text-secondary', '#666');
	const line_color = () => get_css_var('--line-divider', '#ddd');
	const primary_color = () => get_css_var('--primary', '#FF6699');

	const tooltip_bg = () => is_dark() ? 'oklch(.19 .015 345)' : 'white';
	const tooltip_border = () => is_dark() ? 'oklch(.30 .035 345)' : 'rgba(0,0,0,0.1)';
	const tooltip_text = () => is_dark() ? 'oklch(.90 .01 345)' : 'oklch(.25 .02 345)';

	return (
		<div class="w-full relative overflow-visible" ref={container_element}>
			{response_times().length === 0 ? (
				<div class="text-center text-75 py-8">暂无响应时间数据</div>
			) : (
				<>
					<svg
						ref={svg_element}
						width={chart_width()}
						height={CHART_HEIGHT}
						class="w-full"
						style={{ 'touch-action': 'pan-y', overflow: 'visible' }}
						onMouseMove={handle_mouse_move}
						onMouseLeave={handle_mouse_leave}
						onTouchMove={handle_touch_move}
						onTouchEnd={handle_touch_end}
					>
						<defs>
							<linearGradient id="area-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
								<stop offset="0%" stop-color={primary_color()} stop-opacity="0.4" />
								<stop offset="90%" stop-color={primary_color()} stop-opacity="0.1" />
								<stop offset="100%" stop-color={primary_color()} stop-opacity="0.1" />
							</linearGradient>
						</defs>

						<g class="grid-lines">
							{y_axis_labels().map((label) => (
								<line
									x1={PADDING_X}
									y1={label.y}
									x2={chart_width() - PADDING_X}
									y2={label.y}
									stroke={line_color()}
									stroke-width="1"
									stroke-dasharray="4"
									vector-effect="non-scaling-stroke"
								/>
							))}
						</g>

						<path
							d={area_path()}
							fill="url(#area-gradient)"
							class="area-path"
						/>

						<path
							d={line_path()}
							fill="none"
							stroke={primary_color()}
							stroke-width={STROKE_WIDTH}
							stroke-linecap="round"
							stroke-linejoin="round"
							class="line-path"
						/>

						{hovered_point() && (
							<g class="hover-indicator">
								<line
									x1={hovered_point()!.x}
									y1={PADDING_Y}
									x2={hovered_point()!.x}
									y2={CHART_HEIGHT - PADDING_Y}
									stroke={primary_color()}
									stroke-width="1"
									stroke-dasharray="4"
									opacity="0.5"
								/>
								<circle
									cx={hovered_point()!.x}
									cy={hovered_point()!.y}
									r="4"
									fill={primary_color()}
									stroke="white"
									stroke-width="2"
								/>
							</g>
						)}

						<g class="x-axis-labels" font-size="11" fill={text_color()}>
							{x_axis_labels().map((label) => {
								const clamped_x = Math.max(0, Math.min(label.x, chart_width()));
								return (
									<text
										x={clamped_x}
										y={CHART_HEIGHT - PADDING_Y + 15}
										text-anchor={label.anchor}
										dominant-baseline="hanging"
									>
										{label.label}
									</text>
								);
							})}
						</g>
						<g class="y-axis-labels" font-size="11" fill={text_color()}>
							{y_axis_labels().map((label) => (
								<text
									x={Math.max(0, PADDING_X - 12)}
									y={Math.max(PADDING_Y, Math.min(label.y, CHART_HEIGHT - PADDING_Y))}
									text-anchor="end"
									dominant-baseline="middle"
								>
									{label.label}
								</text>
							))}
						</g>
					</svg>

					{tooltip_position().visible && hovered_point() && (
						<div
							ref={tooltip_element}
							class="absolute pointer-events-none z-10 px-3 py-2 rounded-md shadow-lg text-sm"
							style={{
								left: window.innerWidth <= 768
									? '50%'
									: `${Math.min(tooltip_position().x, chart_width() - 200)}px`,
								top: window.innerWidth <= 768
									? '50%'
									: `${Math.max(10, tooltip_position().y)}px`,
								background: tooltip_bg(),
								border: `1px solid ${tooltip_border()}`,
								color: tooltip_text(),
								transform: window.innerWidth <= 768
									? 'translate(-50%, -50%)'
									: tooltip_position().x > chart_width() - 200
										? 'translateX(-100%)'
										: 'none',
							}}
						>
							<div class="flex items-center gap-2 mb-1">
								<div
									class="w-3 h-3 rounded-full"
									style={{ background: primary_color() }}
								/>
								<span class="font-medium">响应时间</span>
							</div>
							<div class="text-xs opacity-75 mb-1">
								{format_datetime(new Date(hovered_point()!.datetime).getTime())}
							</div>
							<div class="font-semibold">
								{format_time(hovered_point()!.value, 2)}
							</div>
						</div>
					)}
				</>
			)}
		</div>
	);
};

export default ResponseTimeChart;
