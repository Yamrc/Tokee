import { Component, onMount, onCleanup } from 'solid-js';
import type { ResponseTimeData } from '@/types/api';

interface ResponseTimeChartProps {
	responseTimes: ResponseTimeData[];
	avgResponseTime: number;
	minResponseTime: number;
	maxResponseTime: number;
}

const ResponseTimeChart: Component<ResponseTimeChartProps> = (props) => {
	let chartContainer: HTMLDivElement | undefined;
	let chartContainerWrapper: HTMLDivElement | undefined;
	let chartInstance: any = null;
	let observer: MutationObserver | null = null;
	let fullDataRange: { min: number; max: number } | null = null;

	const getCSSVar = (name: string, fallback: string) =>
		getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;

	const formatTime = (value: number, decimals = 0) =>
		value < 1000 ? `${Math.round(value)}ms` : `${(value / 1000).toFixed(decimals)}s`;

	const getCurrentXRange = () => {
		if (!chartInstance || !fullDataRange) return fullDataRange;
		try {
			const w = (chartInstance as any).w;
			if (w?.globals?.minX !== undefined && w?.globals?.maxX !== undefined) {
				return { min: w.globals.minX, max: w.globals.maxX };
			}
		} catch {}
		return fullDataRange;
	};

	const zoomToRange = (newMin: number, newMax: number) => {
		if (!fullDataRange) return;
		const clampedMin = Math.max(fullDataRange.min, newMin);
		const clampedMax = Math.min(fullDataRange.max, newMax);
		chartInstance?.zoomX(clampedMin, clampedMax);
	};

	onMount(async () => {
		if (!document.getElementById('apexcharts-toolbar-style')) {
			const style = document.createElement('style');
			style.id = 'apexcharts-toolbar-style';
			style.textContent = `@media(max-width:768px){.apexcharts-tooltip{left:50%!important;transform:translateX(-50%)!important}.apexcharts-tooltip.apexcharts-theme-light,.apexcharts-tooltip.apexcharts-theme-dark{left:50%!important;transform:translateX(-50%)!important}.apexcharts-tooltip-series-group{padding-left:0!important;padding-right:0!important}.apexcharts-tooltip-marker{margin-right:6px!important;margin-left:0!important}}`;
			document.head.appendChild(style);
		}

		if (!chartContainer) return;

		const responseTimes = props.responseTimes || [];
		if (responseTimes.length === 0) {
			chartContainer.innerHTML = '<div class="text-center text-75 py-8">暂无响应时间数据</div>';
			return;
		}

		const data = responseTimes.map((rt) => ({ x: new Date(rt.datetime).getTime(), y: rt.value }));
		if (data.length > 0) {
			fullDataRange = { min: data[0].x, max: data[data.length - 1].x };
		}

		const ApexCharts = (await import('apexcharts')).default;
		const initChart = () => {
			const isDark = document.documentElement.classList.contains('dark');
			const textColor = getCSSVar('--text-secondary', '#666');
			const lineColor = getCSSVar('--line-divider', '#ddd');
			const primaryColor = getCSSVar('--primary', '#FF6699');

			const options: import('apexcharts').ApexOptions = {
				series: [{ name: '响应时间', data }],
				chart: {
					type: 'area',
					height: 300,
					zoom: { enabled: true, type: 'x', autoScaleYaxis: true },
					toolbar: { show: false },
					events: {},
					fontFamily: 'inherit',
					background: 'transparent',
				},
				dataLabels: { enabled: false },
				stroke: { curve: 'smooth', width: 2, colors: [primaryColor] },
				fill: {
					type: 'gradient',
					gradient: {
						shadeIntensity: 1,
						opacityFrom: 0.4,
						opacityTo: 0.1,
						stops: [0, 90, 100],
						colorStops: [
							{ offset: 0, color: primaryColor, opacity: 0.4 },
							{ offset: 90, color: primaryColor, opacity: 0.1 },
							{ offset: 100, color: primaryColor, opacity: 0.1 },
						],
					},
				},
				xaxis: {
					type: 'datetime',
					labels: { format: 'HH:mm', style: { colors: textColor, fontSize: '11px' } },
					tooltip: { enabled: false },
					axisBorder: { show: false },
					axisTicks: { show: false },
				},
				yaxis: {
					labels: { formatter: (v) => formatTime(v, 1), style: { colors: textColor, fontSize: '11px' } },
					title: { text: '响应时间', style: { color: textColor, fontSize: '12px' } },
				},
				grid: {
					borderColor: lineColor,
					strokeDashArray: 4,
					xaxis: { lines: { show: false } },
					yaxis: { lines: { show: true } },
					padding: { top: 0, right: 0, bottom: 0, left: 0 },
				},
				tooltip: {
					theme: isDark ? 'dark' : 'light',
					x: { format: 'MMM dd, yyyy HH:mm' },
					y: { formatter: (v) => formatTime(v, 2) },
					marker: { show: true },
					fixed: { enabled: false },
				},
				colors: [primaryColor],
			};

			if (chartInstance) chartInstance.destroy();
			chartInstance = new ApexCharts(chartContainer, options);
			chartInstance.render().then(() => {
				if (!chartContainer || !chartContainerWrapper || !fullDataRange) return;

				const existingToolbar = chartContainerWrapper.querySelector('.apexcharts-toolbar');
				if (existingToolbar) existingToolbar.remove();

				const toolbar = document.createElement('div');
				toolbar.className = 'apexcharts-toolbar top-0 right-2 gap-1 transition-opacity duration-200 opacity-0 group-hover:opacity-100!';
				toolbar.style.zIndex = '10';

				const icons = {
					zoomIn: '<path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"/>',
					zoomOut: '<path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM7 10h6"/>',
					panLeft: '<path d="M15 18l-6-6 6-6v12z"/>',
					panRight: '<path d="M9 18l6-6-6-6v12z"/>',
					reset: '<path d="M3 12a9 9 0 019-9 9.75 9.75 0 016.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 01-9 9 9.75 9.75 0 01-6.74-2.74L3 16"/><path d="M3 21v-5h5"/>',
				};

				const createButton = (icon: string, title: string, onClick: () => void) => {
					const btn = document.createElement('button');
					btn.className = 'btn-regular w-8 h-8 md:w-10 md:h-10 rounded-md flex items-center justify-center p-0 touch-manipulation cursor-pointer';
					btn.title = title;
					btn.innerHTML = `<svg width="16" height="16" class="md:w-5 md:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icon}</svg>`;
					btn.onclick = (e) => {
						e.stopPropagation();
						e.preventDefault();
						onClick();
					};
					btn.ontouchstart = () => (btn.style.transform = 'scale(0.95)');
					btn.ontouchend = () => setTimeout(() => (btn.style.transform = ''), 150);
					return btn;
				};

				if (!fullDataRange) return;
				const dataRange = fullDataRange;
				const actions = [
					{ icon: icons.zoomIn, title: '放大', fn: () => {
						const r = getCurrentXRange();
						if (!r) return;
						const c = (r.min + r.max) / 2, nr = (r.max - r.min) * 0.5;
						zoomToRange(c - nr / 2, c + nr / 2);
					}},
					{ icon: icons.zoomOut, title: '缩小', fn: () => {
						const r = getCurrentXRange();
						if (!r) return;
						const c = (r.min + r.max) / 2, nr = Math.min(dataRange.max - dataRange.min, (r.max - r.min) * 2);
						zoomToRange(c - nr / 2, c + nr / 2);
					}},
					{ icon: icons.panLeft, title: '向左平移', fn: () => {
						const r = getCurrentXRange();
						if (!r) return;
						const pa = (r.max - r.min) * 0.2;
						let nm = r.min - pa, nx = r.max - pa;
						if (nm < dataRange.min) {
							const d = dataRange.min - nm;
							nm = dataRange.min;
							nx -= d;
						}
						zoomToRange(nm, nx);
					}},
					{ icon: icons.panRight, title: '向右平移', fn: () => {
						const r = getCurrentXRange();
						if (!r) return;
						const pa = (r.max - r.min) * 0.2;
						let nm = r.min + pa, nx = r.max + pa;
						if (nx > dataRange.max) {
							const d = nx - dataRange.max;
							nx = dataRange.max;
							nm += d;
						}
						zoomToRange(nm, nx);
					}},
					{ icon: icons.reset, title: '重置', fn: () => chartInstance?.zoomX(dataRange.min, dataRange.max) },
				];
				actions.forEach(({ icon, title, fn }) => toolbar.appendChild(createButton(icon, title, fn)));

				chartContainerWrapper.appendChild(toolbar);
				chartContainerWrapper.classList.add('group');
			});
		};

		initChart();

		observer = new MutationObserver(() => {
			if (chartInstance) initChart();
		});
		observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
	});

	onCleanup(() => {
		observer?.disconnect();
		chartInstance?.destroy();
		observer = null;
		chartInstance = null;
	});

	return (
		<div class="w-full relative" ref={chartContainerWrapper}>
			<div ref={chartContainer}></div>
		</div>
	);
};

export default ResponseTimeChart;
