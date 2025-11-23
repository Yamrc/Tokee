import { Component, createSignal, Show, For } from 'solid-js';
import { Icon } from '@iconify-icon/solid';
import type { MonitorLog } from '@/types/api';
import { logClassColors, logLabels, logIcons } from '@features/monitor/constants/monitor';
import { formatRelativeTime } from '@shared/utils/timeUtils';

interface RecentEventsProps {
	logs: MonitorLog[];
}

const RecentEvents: Component<RecentEventsProps> = (props) => {
	const [visibleCount, setVisibleCount] = createSignal(5);

	return (
		<div class="card-base card-shadow p-5">
			<div class="flex items-center gap-2.5 mb-4">
				<Icon icon="material-symbols:history" width="1.5rem" height="1.5rem" class="text-[var(--primary)]" />
				<h3 class="text-90 text-lg font-semibold">近期事件</h3>
			</div>
			<div class="space-y-0">
				<For each={props.logs.slice(0, visibleCount())}>
					{(log) => (
						<div class="flex items-start gap-3 py-3 hover:bg-[var(--btn-plain-bg-hover)] -mx-2 px-2 rounded-md transition-colors">
							<div class="flex-1 min-w-0">
								<div class="flex items-center gap-2 mb-1.5 flex-wrap">
									<span class={`flex items-center gap-1.5 text-sm font-semibold ${logClassColors[log.class] || 'text-[var(--text-secondary)]'}`}>
										{logIcons[log.label] && <Icon icon={logIcons[log.label]} width="1rem" height="1rem" />}
										{logLabels[log.label] || log.label}
									</span>
									<span class="text-75 text-xs">{formatRelativeTime(log.date)}</span>
									{log.duration !== '0 seconds' && (
										<span class="text-75 text-xs px-2 py-0.5 rounded font-medium bg-[var(--btn-regular-bg)]">
											持续: {log.duration}
										</span>
									)}
								</div>
								<div class="text-75 text-sm leading-relaxed">
									{log.label === 'down' ? (log.reason.detail.full || log.reason.detail.short) : '无相关声明。'}
								</div>
							</div>
						</div>
					)}
				</For>
			</div>
			<div class="pt-3 mt-3 relative">
				<div class="absolute top-0 left-0 right-0 h-px bg-[var(--line-divider)] opacity-20" />
				<Show
					when={props.logs.length > visibleCount()}
					fallback={
						<div class="text-center py-2">
							<span class="text-75 text-xs">已全部显示</span>
						</div>
					}
				>
					{(() => {
						const remaining = props.logs.length - visibleCount();
						const nextBatch = Math.min(10, remaining);
						return (
							<button
								class="btn-regular inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition active:scale-95 w-full justify-center"
								onClick={() => setVisibleCount((c) => Math.min(c + 10, props.logs.length))}
							>
								<Icon icon="material-symbols:expand-more" width="1rem" height="1rem" />
								展开更多 ({nextBatch} 条)
							</button>
						);
					})()}
				</Show>
			</div>
		</div>
	);
};

export default RecentEvents;
