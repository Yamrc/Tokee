import type { NavBarConfig, SiteConfig } from './types/config';

export const siteConfig: SiteConfig = {
	title: 'Tokee',
	description: 'A beautiful, modern third-party status page for UptimeRobot.',
	author: 'Yamrc',
	hue: 295,
	pageWidth: 85,
	lang: 'zh-CN',
	pageId: 'b7Ow2LAqjd',
	autoRefresh: {
		enable: true,
		interval: 300,
	},
};

export const navBarConfig: NavBarConfig = {
	links: [
		// Only entries with a non-empty `url` are rendered in the navbar.
		// { name: 'Blog', url: 'https://yamr.cc' },
	],
};
