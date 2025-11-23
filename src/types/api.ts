export interface DailyRatio {
	date: string;
	ratio: string;
	label: string;
	color: string;
}

export interface Monitor {
	monitorId: number;
	createdAt: string;
	statusClass: string;
	name: string;
	url: string | null;
	type: string;
	groupId: number;
	groupName: string;
	dailyRatios: DailyRatio[];
	'30dRatio': {
		ratio: string;
		label: string;
		color: string;
	};
	'90dRatio': {
		ratio: string;
		label: string;
		color: string;
	};
	ratio: {
		ratio: string;
		label: string;
		color: string;
	};
	hasIncidentComments: boolean;
}

export interface UptimeStatistics {
	l1: {
		label: string;
		ratio: string;
	};
	l7: {
		label: string;
		ratio: string;
	};
	l30: {
		label: string;
		ratio: string;
	};
	l90: {
		label: string;
		ratio: string;
	};
	latest_downtime: string | null;
	counts: {
		up: number;
		down: number;
		paused: number;
		total: number;
	};
	count_result: string;
}

export interface PaginationInfo {
	monitors: Monitor[];
	totalMonitors: number;
	perPage: number;
	timezone: string;
}

export interface MonitorListResponse {
	status: string;
	psp: PaginationInfo;
	statistics: UptimeStatistics;
	days: string[];
}

// 处理后的监控数据
export interface ProcessedMonitor {
	id: number;
	name: string;
	type: string;
	status: 'success' | 'down' | 'paused';
	statusClass: string;
	url: string | null;
	dailyRatios: DailyRatio[];
	ratio30d: number;
	ratio90d: number;
	ratio: number;
	createdAt: string;
}

export interface MonitorLog {
	class: string;
	label: string;
	date: string;
	dateGMT: string;
	dateGMTISO: string;
	time: number;
	timezone: string;
	duration: string;
	reason: {
		code: string;
		detail: {
			short: string;
			full: string;
		};
	};
}

export interface ResponseTimeData {
	value: number;
	datetime: string;
}

export interface ResponseTimeStats {
	avg_response_time: number;
	min_response_time: number;
	max_response_time: number;
	total_requests: number;
}

export interface MonitorDetail {
	monitorId: number;
	statusClass: string;
	name: string;
	createdAt: string;
	url: string | null;
	type: string;
	checkInterval: string;
	logs: MonitorLog[];
	dailyRatios: DailyRatio[];
	responseTimes?: ResponseTimeData[];
	responseTimeStats: ResponseTimeStats;
	'1dRatio'?: {
		ratio: string;
		label: string;
		color: string;
	};
	'7dRatio'?: {
		ratio: string;
		label: string;
		color: string;
	};
	'30dRatio'?: {
		ratio: string;
		label: string;
		color: string;
	};
	'90dRatio'?: {
		ratio: string;
		label: string;
		color: string;
	};
}

export interface MonitorDetailResponse {
	status: string;
	title: string;
	monitor: MonitorDetail;
	days: string[];
	timezone: string;
	statistics: {
		counts: {
			up: number;
			down: number;
			paused: number;
			total: number;
		};
	};
}
