import { Component, For } from 'solid-js';
import { Icon } from '@iconify-icon/solid';
import type { MonitorDetail } from '@/types/api';
import { getUptimeColor } from '@features/monitor/constants/monitor';
import { formatRatio } from '@shared/utils/format';

interface UptimeSectionProps {
	monitor: MonitorDetail;
}

const UptimeSection: Component<UptimeSectionProps> = (props) => {
	const last24h = props.monitor['1dRatio'] ? parseFloat(props.monitor['1dRatio'].ratio) : 0;
	const avg7d = props.monitor['7dRatio'] ? parseFloat(props.monitor['7dRatio'].ratio) : 0;
	const avg30d = props.monitor['30dRatio'] ? parseFloat(props.monitor['30dRatio'].ratio) : 0;
	const avg90d = props.monitor['90dRatio'] ? parseFloat(props.monitor['90dRatio'].ratio) : 0;

	const dailyRatios = props.monitor.dailyRatios;
	const overall = dailyRatios.length > 0
		? dailyRatios.reduce((sum, day) => sum + parseFloat(day.ratio), 0) / dailyRatios.length
		: 0;

	const uptimeItems = [
		{ label: '24小时', value: last24h, icon: 'material-symbols:schedule' },
		{ label: '7天', value: avg7d, icon: 'material-symbols:calendar-today' },
		{ label: '30天', value: avg30d, icon: 'material-symbols:calendar-month' },
		{ label: '90天', value: avg90d, icon: 'material-symbols:calendar-view-month' },
	];

	return (
		<section class="card-base card-shadow p-5">
			<div class="flex items-center gap-2.5 mb-4">
				<Icon icon="material-symbols:trending-up" width="1.5rem" height="1.5rem" class="text-(--primary)" aria-hidden="true" />
				<h3 class="text-90 text-lg font-semibold">整体运行时间</h3>
			</div>
			<div class="space-y-3">
				<For each={uptimeItems}>
					{(item) => (
						<div class="grid grid-cols-[4rem_1fr_5rem] items-center gap-3">
							<div class="flex items-center gap-1.5">
								<Icon icon={item.icon} width="1rem" height="1rem" class="text-75 shrink-0" aria-hidden="true" />
								<span class="text-75 text-sm whitespace-nowrap">{item.label}</span>
							</div>
							<div class="h-2 bg-(--btn-regular-bg) rounded-full overflow-hidden" role="progressbar" aria-valuenow={item.value} aria-valuemin={0} aria-valuemax={100} aria-label={`${item.label}运行时间`}>
								<div
									class={`h-full ${getUptimeColor(item.value)} transition-all`}
									style={{ width: `${Math.min(item.value, 100)}%` }}
								/>
							</div>
							<div class="text-90 text-lg font-bold text-right whitespace-nowrap">
								{formatRatio(item.value.toString())}%
							</div>
						</div>
					)}
				</For>
				<div class="grid grid-cols-[4rem_1fr_5rem] items-center gap-3 pt-2 relative">
					<div class="absolute top-0 left-0 right-0 h-px bg-(--line-divider) opacity-20" />
					<div class="flex items-center gap-1.5">
						<Icon icon="material-symbols:bar-chart" width="1rem" height="1rem" class="text-75 shrink-0" aria-hidden="true" />
						<span class="text-75 text-sm font-medium whitespace-nowrap">总体</span>
					</div>
					<div class="h-2 bg-(--btn-regular-bg) rounded-full overflow-hidden" role="progressbar" aria-valuenow={overall} aria-valuemin={0} aria-valuemax={100} aria-label="总体运行时间">
						<div
							class={`h-full ${getUptimeColor(overall)} transition-all`}
							style={{ width: `${Math.min(overall, 100)}%` }}
						/>
					</div>
					<div class="text-90 text-xl font-bold text-right whitespace-nowrap">
						{formatRatio(overall.toString())}%
					</div>
				</div>
			</div>
		</section>
	);
};

export default UptimeSection;
