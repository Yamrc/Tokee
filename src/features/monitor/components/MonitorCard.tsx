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

	const handleKeyDown = (e: KeyboardEvent & { currentTarget: HTMLElement; target: Element }) => {
		if ((e.key === 'Enter' || e.key === ' ') && props.onClick) {
			e.preventDefault();
			props.onClick();
		}
	};

	return (
		<article
			class="card-base card-shadow p-6 cursor-pointer transition-colors hover:bg-(--btn-card-bg-hover) [&:hover_h3]:text-(--primary)!"
			onClick={props.onClick}
			onKeyDown={handleKeyDown}
			tabIndex={props.onClick ? 0 : undefined}
			aria-label={props.onClick ? `查看 ${monitor.name} 的详细信息` : undefined}
		>
			<div class="flex items-center gap-3 mb-4">
				<h3 class="text-90 text-lg font-semibold transition-colors duration-200 flex-1 min-w-0 truncate">{monitor.name}</h3>
				<div class="flex items-center gap-2 shrink-0">
					<span class={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-white whitespace-nowrap ${status.badge}`}>
						<Icon icon={status.icon} width="1rem" height="1rem" />
						{status.text}
					</span>
					<span class="text-75 text-xs px-2 py-1 rounded-md bg-(--btn-regular-bg) whitespace-nowrap">
						{monitor.type}
					</span>
					<Show when={monitor.url}>
						<a
							href={monitor.url!}
							target="_blank"
							rel="noopener noreferrer"
							class="btn-card w-8 h-8 rounded-md shrink-0"
							onClick={(e) => e.stopPropagation()}
							onKeyDown={(e) => e.stopPropagation()}
							aria-label={`访问 ${monitor.name} 的网站`}
						>
							<Icon icon="material-symbols:open-in-new" width="1rem" height="1rem" aria-hidden="true" />
						</a>
					</Show>
				</div>
			</div>

			<div class="flex gap-0.5 mb-4 h-8 items-end relative">
				{monitor.dailyRatios.length > 0 ? (
					<For each={monitor.dailyRatios.slice(-30).reverse()}>
						{(day) => {
							const ratio = parseFloat(day.ratio);
							const height = Math.max(ratio, 4);
							return (
								<div
									class={`flex-1 rounded-t transition-colors duration-100 ${getBarColor(ratio)} opacity-80 hover:opacity-100 cursor-pointer`}
									style={{ height: `${height}%` }}
									title={`${day.date}: ${day.ratio}%`}
									role="img"
									aria-label={`${day.date}: ${day.ratio}% 可用性`}
								/>
							);
						}}
					</For>
				) : (
					<div class="text-75 text-xs w-full text-center">暂无数据</div>
				)}
			</div>
			{monitor.dailyRatios.length > 0 && (() => {
				const ratios = monitor.dailyRatios.slice(-30);
				const firstDate = ratios[0]?.date;
				const lastDate = ratios[ratios.length - 1]?.date;
				return firstDate && lastDate ? (
					<div class="flex items-center justify-between -mt-2 mb-4 text-75 text-xs">
						<span>{firstDate}</span>
						<span>{lastDate}</span>
					</div>
				) : null;
			})()}

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
