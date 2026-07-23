import type { DailyRatio, MonitorDetail } from './uptime-robot-types';

export const statusConfig = {
	success: {
		color: 'text-[var(--status-success)]',
		bg: 'bg-[oklch(0.50_0.20_150/0.2)]',
		dot: 'bg-[var(--status-success)]',
		text: '正常运行',
		badge: 'bg-[var(--status-success-badge)]',
		icon: 'material-symbols:check',
	},
	paused: {
		color: 'text-[var(--status-warning)]',
		bg: 'bg-[oklch(0.55_0.14_60/0.2)]',
		dot: 'bg-[var(--status-warning)]',
		text: '已暂停',
		badge: 'bg-[var(--status-warning-badge)]',
		icon: 'material-symbols:pause-circle',
	},
	down: {
		color: 'text-[var(--status-error)]',
		bg: 'bg-[oklch(0.50_0.20_25/0.2)]',
		dot: 'bg-[var(--status-error)]',
		text: '异常',
		badge: 'bg-[var(--status-error-badge)]',
		icon: 'material-symbols:error',
	},
} as const;

export const getStatus = (statusClass: string): typeof statusConfig[keyof typeof statusConfig] => 
	statusConfig[statusClass as keyof typeof statusConfig] || statusConfig.down;

export const getBarColor = (ratio: number): string => {
	if (ratio >= 99.9) return 'bg-[var(--status-success)]';
	if (ratio >= 95) return 'bg-[var(--status-warning)]';
	return ratio > 0 ? 'bg-[var(--status-error)]' : 'bg-gray-400';
};

export const getUptimeColor = (ratio: number): string => {
	if (ratio >= 99.9) return 'bg-[var(--status-success)]';
	if (ratio >= 95) return 'bg-[var(--status-warning)]';
	return 'bg-[var(--status-error)]';
};

export const logClassColors: Record<string, string> = {
	success: 'text-[var(--status-success)]',
	danger: 'text-[var(--status-error)]',
};

export const logLabels: Record<string, string> = {
	up: '上线',
	down: '宕机',
	paused: '已暂停',
	resume: '已恢复',
	started: '已启动',
};

export const logIcons: Record<string, string> = {
	up: 'material-symbols:check-circle',
	started: 'material-symbols:check-circle',
	resume: 'material-symbols:check-circle',
	down: 'material-symbols:error',
	paused: 'material-symbols:pause-circle',
};

export type SearchInput = string | URLSearchParams;

const toSearchParams = (search: SearchInput): URLSearchParams =>
	typeof search === 'string' ? new URLSearchParams(search) : search;

export const getPageFromSearch = (search: SearchInput): number => {
	const pageParam = toSearchParams(search).get('p');
	const page = Number.parseInt(pageParam ?? '1', 10);
	return Number.isNaN(page) || page < 1 ? 1 : page;
};

export const getVisiblePageNumbers = (currentPage: number, totalPages: number): number[] => {
	if (totalPages <= 5) return Array.from({ length: totalPages }, (_, index) => index + 1);
	if (currentPage <= 3) return [1, 2, 3, 4, 5];
	if (currentPage >= totalPages - 2) return Array.from({ length: 5 }, (_, index) => totalPages - 4 + index);
	return Array.from({ length: 5 }, (_, index) => currentPage - 2 + index);
};

export const parseMonitorIdFromSearch = (search: SearchInput): number | null => {
	const idParam = toSearchParams(search).get('id');
	const id = Number.parseInt(idParam ?? '', 10);
	return Number.isNaN(id) || id < 1 ? null : id;
};

export const ratioValue = (monitor: MonitorDetail, key: '1dRatio' | '7dRatio' | '30dRatio' | '90dRatio'): number => {
	const ratio = monitor[key]?.ratio;
	return ratio ? Number.parseFloat(ratio) : 0;
};

export const averageUptime = (monitor: MonitorDetail): number => {
	return monitor.dailyRatios.length > 0
		? monitor.dailyRatios.reduce((sum, day) => sum + Number.parseFloat(day.ratio), 0) / monitor.dailyRatios.length
		: 0;
};

export type TrendWindowDays = 30 | 60 | 90;

/** Pick trend bar count by viewport width so bars stay readable on tablets. */
export const getTrendWindowDays = (width: number): TrendWindowDays => {
	if (width <= 640) return 30;
	if (width <= 1024) return 60;
	return 90;
};

export const trendWindowLabel = (days: TrendWindowDays): string => `${days}天运行时间趋势`;

export const displayedDailyRatios = (dailyRatios: DailyRatio[], days: number): DailyRatio[] => {
	const windowDays = Math.min(Math.max(days, 1), 90);
	return dailyRatios.slice(-90).slice(-windowDays);
};
