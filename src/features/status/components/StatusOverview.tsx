import { Component, createMemo } from 'solid-js';
import type { ProcessedMonitor } from '@/types/api';

interface StatusOverviewProps {
	monitors: ProcessedMonitor[];
}

const StatusOverview: Component<StatusOverviewProps> = (props) => {
	const stats = createMemo(() => {
		const ms = props.monitors;
		const total = ms.length;
		const success = ms.filter((m) => m.status === 'success').length;
		const down = ms.filter((m) => m.status === 'down').length;
		const paused = ms.filter((m) => m.status === 'paused').length;
		const avg = total === 0 ? 0 : ms.reduce((acc, m) => acc + m.ratio, 0) / total;
		return { total, success, down, paused, avg };
	});

	return (
		<section class="card-base card-shadow p-6 mb-4">
			<h2 class="text-90 text-xl font-semibold mb-4">状态概览</h2>
			<div class="grid grid-cols-2 md:grid-cols-5 gap-4">
				<div class="text-center">
					<div class="text-3xl font-bold text-90 mb-1">{stats().total}</div>
					<div class="text-75 text-sm">总站点数</div>
				</div>
				<div class="text-center">
					<div class="text-3xl font-bold text-(--status-success) mb-1">{stats().success}</div>
					<div class="text-75 text-sm">正常运行</div>
				</div>
				<div class="text-center">
					<div class="text-3xl font-bold text-(--status-error) mb-1">{stats().down}</div>
					<div class="text-75 text-sm">异常</div>
				</div>
				<div class="text-center">
					<div class="text-3xl font-bold text-(--status-warning) mb-1">{stats().paused}</div>
					<div class="text-75 text-sm">已暂停</div>
				</div>
				<div class="text-center">
					<div class="text-3xl font-bold text-90 mb-1">{stats().avg.toFixed(2)}%</div>
					<div class="text-75 text-sm">平均可用性</div>
				</div>
			</div>
		</section>
	);
};

export default StatusOverview;
