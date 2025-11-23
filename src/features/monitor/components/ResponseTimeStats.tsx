import { Component } from 'solid-js';
import { Icon } from '@iconify-icon/solid';
import type { ResponseTimeStats as ResponseTimeStatsType } from '@/types/api';
import { formatTime } from '@shared/utils/format';

interface ResponseTimeStatsProps {
	stats: ResponseTimeStatsType;
}

const ResponseTimeStats: Component<ResponseTimeStatsProps> = (props) => (
	<div class="card-base card-shadow p-5">
		<div class="flex items-center gap-2.5 mb-4">
			<Icon icon="material-symbols:speed" width="1.5rem" height="1.5rem" class="text-[var(--primary)]" />
			<h3 class="text-90 text-lg font-semibold">响应时间</h3>
		</div>
		<div class="grid grid-cols-2 gap-4">
			<div class="p-3 rounded-lg bg-[var(--btn-regular-bg)]">
				<div class="flex items-center gap-1.5 mb-1">
					<Icon icon="material-symbols:avg-time" width="1rem" height="1rem" class="text-75" />
					<div class="text-75 text-xs">平均响应时间</div>
				</div>
				<div class="text-xl font-bold text-90">{formatTime(props.stats.avg_response_time)}</div>
			</div>
			<div class="p-3 rounded-lg bg-[var(--btn-regular-bg)]">
				<div class="flex items-center gap-1.5 mb-1">
					<Icon icon="material-symbols:trending-down" width="1rem" height="1rem" class="text-75" />
					<div class="text-75 text-xs">最小响应时间</div>
				</div>
				<div class="text-xl font-bold text-90">{formatTime(props.stats.min_response_time)}</div>
			</div>
			<div class="p-3 rounded-lg bg-[var(--btn-regular-bg)]">
				<div class="flex items-center gap-1.5 mb-1">
					<Icon icon="material-symbols:trending-up" width="1rem" height="1rem" class="text-75" />
					<div class="text-75 text-xs">最大响应时间</div>
				</div>
				<div class="text-xl font-bold text-90">{formatTime(props.stats.max_response_time)}</div>
			</div>
			<div class="p-3 rounded-lg bg-[var(--btn-regular-bg)]">
				<div class="flex items-center gap-1.5 mb-1">
					<Icon icon="material-symbols:summarize" width="1rem" height="1rem" class="text-75" />
					<div class="text-75 text-xs">总请求数</div>
				</div>
				<div class="text-xl font-bold text-90">{props.stats.total_requests.toLocaleString()}</div>
			</div>
		</div>
	</div>
);

export default ResponseTimeStats;
