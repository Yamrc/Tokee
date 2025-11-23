import { Component } from 'solid-js';
import { Icon } from '@iconify-icon/solid';
import DarkModeToggle from './DarkModeToggle';

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
			<div class="flex items-center gap-1">
				<DarkModeToggle />
				<button
					class="btn-plain scale-animation rounded-lg h-11 px-3 inline-flex items-center gap-2 text-sm transition active:scale-90 text-90"
					onClick={props.onRefresh}
					disabled={props.loading}
				>
					<Icon icon="material-symbols:refresh" width="1.25rem" height="1.25rem" />
				</button>
			</div>
		</div>
	</header>
);

export default AppHeader;
