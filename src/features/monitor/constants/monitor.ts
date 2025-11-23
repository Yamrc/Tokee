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
