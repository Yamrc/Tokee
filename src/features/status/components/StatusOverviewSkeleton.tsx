import { Component, For } from 'solid-js';
import Skeleton from '@shared/components/Skeleton';

const StatusOverviewSkeleton: Component = () => (
	<section class="card-base card-shadow p-6 mb-4" aria-label="状态概览加载中">
		<Skeleton width="8rem" height="1.5rem" borderRadius="0.375rem" class="mb-4" />
		<div class="grid grid-cols-2 md:grid-cols-5 gap-4">
			<For each={Array.from({ length: 5 })}>
				{() => (
					<div class="text-center">
						<Skeleton width="3rem" height="2.25rem" borderRadius="0.375rem" class="mx-auto mb-2" />
						<Skeleton width="4rem" height="0.875rem" borderRadius="0.25rem" class="mx-auto" />
					</div>
				)}
			</For>
		</div>
	</section>
);

export default StatusOverviewSkeleton;
