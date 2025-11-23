import { Component, For } from 'solid-js';
import { Icon } from '@iconify-icon/solid';

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	loading: boolean;
	onPageChange: (page: number) => void;
}

const Pagination: Component<PaginationProps> = (props) => {
	if (props.totalPages <= 1) return null;

	const getPageNumbers = () => {
		const total = props.totalPages;
		const current = props.currentPage;
		if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
		if (current <= 3) return [1, 2, 3, 4, 5];
		if (current >= total - 2) return Array.from({ length: 5 }, (_, i) => total - 4 + i);
		return Array.from({ length: 5 }, (_, i) => current - 2 + i);
	};

	return (
		<div class="flex items-center justify-center gap-2 mt-6">
			<button
				class="btn-regular px-3 py-2 rounded-md text-sm transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
				onClick={() => props.onPageChange(props.currentPage - 1)}
				disabled={props.currentPage === 1 || props.loading}
			>
				<Icon icon="material-symbols:chevron-left" width="1.25rem" height="1.25rem" />
			</button>
			<div class="flex items-center gap-1">
				<For each={getPageNumbers()}>
					{(pageNum) => (
						<button
							class={`px-3 py-2 rounded-md text-sm transition active:scale-95 ${
								pageNum === props.currentPage
									? 'bg-[var(--primary)] text-white'
									: 'btn-regular'
							}`}
							onClick={() => props.onPageChange(pageNum)}
							disabled={props.loading}
						>
							{pageNum}
						</button>
					)}
				</For>
			</div>
			<button
				class="btn-regular px-3 py-2 rounded-md text-sm transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
				onClick={() => props.onPageChange(props.currentPage + 1)}
				disabled={props.currentPage === props.totalPages || props.loading}
			>
				<Icon icon="material-symbols:chevron-right" width="1.25rem" height="1.25rem" />
			</button>
		</div>
	);
};

export default Pagination;
