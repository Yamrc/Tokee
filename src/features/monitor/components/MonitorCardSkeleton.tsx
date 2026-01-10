import { Component, For } from 'solid-js';
import Skeleton from '@shared/components/Skeleton';

interface MonitorCardSkeletonProps {
	count?: number;
}

const MonitorCardSkeleton: Component<MonitorCardSkeletonProps> = (props) => {
	const count = () => props.count ?? 6;

	return (
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" aria-label="加载中">
			<For each={Array.from({ length: count() })}>
				{() => (
					<article class="card-base card-shadow p-6">
						<div class="flex items-center gap-3 mb-4">
							<Skeleton width="60%" height="1.5rem" borderRadius="0.375rem" class="flex-1 min-w-0" />
							<div class="flex items-center gap-2 shrink-0">
								<Skeleton width="4rem" height="1.5rem" borderRadius="0.375rem" />
								<Skeleton width="3.5rem" height="1.5rem" borderRadius="0.375rem" />
								<Skeleton width="2rem" height="2rem" borderRadius="0.375rem" />
							</div>
						</div>

						<Skeleton height="2rem" borderRadius="0.25rem" class="mb-4" />

						<Skeleton height="0.75rem" borderRadius="0.25rem" width="40%" class="mb-2" />
						<Skeleton height="0.75rem" borderRadius="0.25rem" width="30%" />
					</article>
				)}
			</For>
		</div>
	);
};

export default MonitorCardSkeleton;
