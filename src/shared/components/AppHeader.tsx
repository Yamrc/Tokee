import { Component, For } from 'solid-js';
import { Icon } from '@iconify-icon/solid';
import { siteConfig } from '@/config';
import { navBarConfig } from '@/config';
import DarkModeToggle from './DarkModeToggle';

interface AppHeaderProps {
	onHomeClick: () => void;
	onRefresh: () => void;
	loading: boolean;
}

const AppHeader: Component<AppHeaderProps> = (props) => (
	<header class="max-w-(--page-width) w-full md:px-4 mx-auto">
		<nav class="card-base card-shadow h-18 flex items-center justify-between px-4 rounded-t-none!" aria-label="主导航">
			<button
				class="btn-plain scale-animation rounded-lg h-13 px-5 font-bold active:scale-95"
				onClick={props.onHomeClick}
				aria-label="返回首页"
			>
				<div class="flex flex-row text-(--primary) items-center text-md">
					<Icon icon="material-symbols:home-outline-rounded" width="1.75rem" height="1.75rem" class="mb-1 mr-2" aria-hidden="true" />
					{siteConfig.title}
				</div>
			</button>
			<div class="hidden md:flex">
				<For each={navBarConfig.links}>
					{(link) => (
						<a
							href={link.url}
							target="_blank"
							rel="noopener noreferrer"
							class="btn-plain scale-animation rounded-lg h-11 font-bold px-5 active:scale-95"
							aria-label={link.name}
						>
							{link.name}
						</a>
					)}
				</For>
			</div>
			<div class="flex items-center gap-1">
				<button
					class="btn-plain scale-animation rounded-lg h-11 px-3 inline-flex items-center gap-2 text-sm transition active:scale-90 text-90"
					onClick={props.onRefresh}
					disabled={props.loading}
					aria-label="刷新数据"
					aria-busy={props.loading}
				>
					<Icon icon="material-symbols:refresh" width="1.25rem" height="1.25rem" aria-hidden="true" />
				</button>
				<DarkModeToggle />
			</div>
		</nav>
	</header>
);

export default AppHeader;
