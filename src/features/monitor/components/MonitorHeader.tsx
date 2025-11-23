import { Component, For, createMemo } from 'solid-js';
import { Icon } from '@iconify-icon/solid';
import type { MonitorDetail } from '@/types/api';
import { getStatus, getBarColor } from '@features/monitor/constants/monitor';
import { useMediaQuery } from '@shared/hooks/useMediaQuery';

interface MonitorHeaderProps {
	monitor: MonitorDetail;
}

const MonitorHeader: Component<MonitorHeaderProps> = (props) => {
	const isMobile = useMediaQuery('(max-width: 640px)');
	const status = getStatus(props.monitor.statusClass);
	const displayedRatios = createMemo(() => {
		const allRatios = props.monitor.dailyRatios.slice(-90);
		return isMobile() ? allRatios.slice(-30) : allRatios;
	});

	return (
		<div class="card-base card-shadow p-5">
			<div class="flex items-start justify-between gap-4">
				<div class="flex-1 min-w-0">
					<div class="flex items-center gap-3 mb-3">
						<h2 class="text-90 text-2xl font-bold truncate">{props.monitor.name}</h2>
						<div class={`flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-medium shrink-0 ${status.color} ${status.bg}`}>
							<div class={`w-2 h-2 rounded-full ${status.dot}`} />
							{status.text}
						</div>
					</div>
					<div class="flex flex-wrap items-center gap-x-6 gap-y-2 text-75 text-sm">
						<div class="flex items-center gap-1.5">
							<Icon icon="material-symbols:category" width="1rem" height="1rem" aria-hidden="true" />
							<span>类型:</span>
							<span class="text-90 font-medium">{props.monitor.type}</span>
						</div>
						<div class="flex items-center gap-1.5">
							<Icon icon="material-symbols:schedule" width="1rem" height="1rem" aria-hidden="true" />
							<span>检查间隔:</span>
							<span class="text-90 font-medium">{props.monitor.checkInterval}</span>
						</div>
						{props.monitor.url && (
							<div class="flex items-center gap-1.5">
								<a
									href={props.monitor.url}
									target="_blank"
									rel="noopener noreferrer"
									class="text-(--primary) hover:underline flex items-center gap-1.5"
									aria-label={`访问 ${props.monitor.name} 的网站`}
								>
									<Icon icon="material-symbols:open-in-new" width="1rem" height="1rem" aria-hidden="true" />
									<span>访问站点</span>
								</a>
							</div>
						)}
					</div>
					<div class="mt-4 pt-4 relative">
						<div class="absolute top-0 left-0 right-0 h-px bg-(--line-divider) opacity-20" />
						<div class="flex items-center gap-2 mb-3">
							<Icon icon="material-symbols:bar-chart" width="1rem" height="1rem" class="text-75" aria-hidden="true" />
							<span class="text-75 text-xs font-medium">
								{isMobile() ? '30天运行时间趋势' : '90天运行时间趋势'}
							</span>
						</div>
						<div class="flex gap-0.5 h-14 items-end">
							{displayedRatios().length > 0 ? (
								<For each={displayedRatios()}>
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
						{displayedRatios().length > 0 && (() => {
							const ratios = displayedRatios();
							const firstDate = ratios[0]?.date;
							const lastDate = ratios[ratios.length - 1]?.date;
							return firstDate && lastDate ? (
								<div class="flex items-center justify-between mt-2 text-75 text-xs">
									<span>{firstDate}</span>
									<span>{lastDate}</span>
								</div>
							) : null;
						})()}
					</div>
				</div>
			</div>
		</div>
	);
};

export default MonitorHeader;
