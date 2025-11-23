import { Component, Show, For } from 'solid-js';
import { Icon } from '@iconify-icon/solid';
import type { ProcessedMonitor } from '@/types/api';
import { getStatus, getBarColor } from '@features/monitor/constants/monitor';
import { formatRatio } from '@shared/utils/format';

interface MonitorCardProps {
	monitor: ProcessedMonitor;
	onClick?: () => void;
}

const MonitorCard: Component<MonitorCardProps> = (props) => {
	const { monitor } = props;
	const status = getStatus(monitor.status);

	return (
		<article
			class="card-base card-shadow p-6 cursor-pointer transition-colors hover:bg-[var(--btn-card-bg-hover)] [&:hover_h3]:text-[var(--primary)]!"
			onClick={props.onClick}
		>
			<div class="flex items-center gap-3 mb-4">
				<h3 class="text-90 text-lg font-semibold transition-colors duration-200 flex-1 min-w-0 truncate">{monitor.name}</h3>
				<div class="flex items-center gap-2 flex-shrink-0">
					<span class={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-white whitespace-nowrap ${status.badge}`}>
						<Icon icon={status.icon} width="1rem" height="1rem" />
						{status.text}
					</span>
					<span class="text-75 text-xs px-2 py-1 rounded-md bg-[var(--btn-regular-bg)] whitespace-nowrap">
						{monitor.type}
					</span>
					<Show when={monitor.url}>
						<a
							href={monitor.url!}
							target="_blank"
							rel="noopener noreferrer"
							class="btn-card w-8 h-8 rounded-md flex-shrink-0"
							onClick={(e) => e.stopPropagation()}
							title="访问站点"
						>
							<Icon icon="material-symbols:open-in-new" width="1rem" height="1rem" />
						</a>
					</Show>
				</div>
			</div>

			<div class="flex gap-0.5 mb-4 h-8 items-end">
				{monitor.dailyRatios.length > 0 ? (
					<For each={monitor.dailyRatios.slice(-30)}>
						{(day) => {
							const ratio = parseFloat(day.ratio);
							const height = Math.max(ratio, 4);
							return (
								<div
									class={`flex-1 rounded-t transition-colors ${getBarColor(ratio)} opacity-80 hover:opacity-100 cursor-pointer transition-opacity duration-100 cursor-pointer`}
									style={{ height: `${height}%` }}
									title={`${day.date}: ${day.ratio}%`}
								/>
							);
						}}
					</For>
				) : (
					<div class="text-75 text-xs w-full text-center">暂无数据</div>
				)}
			</div>

			<div class="flex items-center justify-between text-sm text-75 flex-wrap gap-2">
				<div class="flex items-center gap-4">
					<span>30天: <span class="text-90 font-medium">{formatRatio(monitor.ratio30d)}%</span></span>
					<span>90天: <span class="text-90 font-medium">{formatRatio(monitor.ratio90d)}%</span></span>
				</div>
				<span>总体: <span class="text-90 font-medium">{formatRatio(monitor.ratio)}%</span></span>
			</div>
		</article>
	);
};

export default MonitorCard;
