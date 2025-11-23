import { Component } from 'solid-js';
import { Icon } from '@iconify-icon/solid';

interface AppHeaderProps {
	onHomeClick: () => void;
	onRefresh: () => void;
	loading: boolean;
}

const AppHeader: Component<AppHeaderProps> = (props) => (
	<header class="max-w-[var(--page-width)] w-full md:px-4 mx-auto">
		<div class="card-base card-shadow h-[4.5rem] flex items-center justify-between px-4 !rounded-t-none">
			<button
				class="btn-plain scale-animation rounded-lg h-[3.25rem] px-5 font-bold active:scale-95"
				onClick={props.onHomeClick}
			>
				<div class="flex flex-row text-[var(--primary)] items-center text-md">
					<Icon icon="material-symbols:home-outline-rounded" width="1.75rem" height="1.75rem" class="mb-1 mr-2" />
					Tokee
				</div>
			</button>
			<button
				class="btn-regular inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm transition active:scale-95"
				onClick={props.onRefresh}
				disabled={props.loading}
			>
				<Icon icon="material-symbols:refresh" width="1.25rem" height="1.25rem" />
				刷新
			</button>
		</div>
	</header>
);

export default AppHeader;
