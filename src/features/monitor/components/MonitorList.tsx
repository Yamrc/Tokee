import { Component, For } from 'solid-js';
import type { ProcessedMonitor } from '@/types/api';
import MonitorCard from './MonitorCard';

interface MonitorListProps {
	monitors: ProcessedMonitor[];
	onMonitorClick?: (monitor: ProcessedMonitor) => void;
}

const MonitorList: Component<MonitorListProps> = (props) => (
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
		<For each={props.monitors}>
			{(monitor) => (
				<MonitorCard
					monitor={monitor}
					onClick={() => props.onMonitorClick?.(monitor)}
				/>
			)}
		</For>
	</div>
);

export default MonitorList;
