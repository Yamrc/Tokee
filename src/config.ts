import { SiteConfig, NavBarConfig } from "@/types/config";

export const siteConfig: SiteConfig = {
	title: 'Tokee',
	description: 'A beautiful, modern third-party status page for UptimeRobot.',
	author: 'Yamrc',
	hue: 295,
	pageWidth: 85, // rem
	lang: 'zh-CN',
	record: {
		enable: false,
		text: '',
		url: '',
	},
	pageId: 'b7Ow2LAqjd',
	autoRefresh: {
		enable: true,
		interval: 300,
	},
};

export const navBarConfig: NavBarConfig = {
	links: [],
};

