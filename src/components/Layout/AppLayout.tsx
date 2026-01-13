import { Component, JSX } from 'solid-js';
import AppHeader from '@shared/components/AppHeader';
import Footer from '@shared/components/Footer';

interface AppLayoutProps {
	children: JSX.Element;
	onHomeClick: () => void;
	onRefresh: () => void;
	loading: boolean;
	countdown: number;
}

const AppLayout: Component<AppLayoutProps> = (props) => {
	return (
		<div class="min-h-screen bg-(--page-bg)">
			<AppHeader
				onHomeClick={props.onHomeClick}
				onRefresh={props.onRefresh}
				loading={props.loading}
			/>
			<main class="relative max-w-(--page-width) w-full md:px-4 mx-auto mt-4 pb-8">
				{props.children}
			</main>
			<Footer countdown={props.countdown} />
		</div>
	);
};

export default AppLayout;
