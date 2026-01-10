import { Component, For } from 'solid-js';
import Skeleton from '@shared/components/Skeleton';

const MonitorDetailSkeleton: Component = () => (
	<div class="space-y-4" aria-label="加载中">
		<article class="card-base card-shadow p-5">
			<div class="flex items-center gap-3 mb-3">
				<Skeleton width="50%" height="1.75rem" borderRadius="0.375rem" />
				<div class="flex items-center gap-2">
					<Skeleton width="5rem" height="1.5rem" borderRadius="0.375rem" />
					<Skeleton width="4.5rem" height="1.5rem" borderRadius="0.375rem" />
				</div>
			</div>
			<div class="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm mb-4">
				<Skeleton width="6rem" height="1rem" borderRadius="0.25rem" />
				<Skeleton width="5rem" height="1rem" borderRadius="0.25rem" />
				<Skeleton width="5rem" height="1rem" borderRadius="0.25rem" />
			</div>
			<div class="pt-4 relative">
				<div class="absolute top-0 left-0 right-0 h-px opacity-20" />
				<Skeleton width="30%" height="0.75rem" borderRadius="0.25rem" class="mb-3" />
				<Skeleton height="3.5rem" borderRadius="0.25rem" />
			</div>
		</article>

		<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
			<section class="card-base card-shadow p-5">
				<Skeleton width="8rem" height="1.5rem" borderRadius="0.375rem" class="mb-4" />
				<div class="space-y-3">
					<For each={Array.from({ length: 5 })}>
						{() => (
							<div class="grid grid-cols-[4rem_1fr_5rem] items-center gap-3">
								<Skeleton width="3rem" height="1rem" borderRadius="0.25rem" />
								<Skeleton height="0.5rem" borderRadius="9999px" />
								<Skeleton width="3rem" height="1.25rem" borderRadius="0.25rem" />
							</div>
						)}
					</For>
				</div>
			</section>

			<section class="card-base card-shadow p-5">
				<Skeleton width="6rem" height="1.5rem" borderRadius="0.375rem" class="mb-4" />
				<div class="grid grid-cols-2 gap-4">
					<For each={Array.from({ length: 4 })}>
						{() => (
							<div class="p-3 rounded-lg">
								<Skeleton width="70%" height="0.75rem" borderRadius="0.25rem" class="mb-2" />
								<Skeleton width="60%" height="1.5rem" borderRadius="0.25rem" />
							</div>
						)}
					</For>
				</div>
			</section>
		</div>

		<div class="card-base card-shadow p-5">
			<div class="flex items-center gap-2.5 mb-4">
				<Skeleton width="8rem" height="1.5rem" borderRadius="0.375rem" />
			</div>
			<Skeleton height="18.75rem" borderRadius="0.375rem" />
		</div>

		<section class="card-base card-shadow p-5">
			<div class="flex items-center gap-2.5 mb-4">
				<Skeleton width="6rem" height="1.5rem" borderRadius="0.375rem" />
			</div>
			<div class="space-y-0">
				<For each={Array.from({ length: 4 })}>
					{() => (
						<div class="flex items-start gap-3 py-3">
							<Skeleton width="8rem" height="1rem" borderRadius="0.25rem" class="flex-1" />
							<Skeleton width="6rem" height="1rem" borderRadius="0.25rem" />
						</div>
					)}
				</For>
			</div>
		</section>
	</div>
);

export default MonitorDetailSkeleton;
