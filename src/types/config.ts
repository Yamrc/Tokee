export interface AutoRefreshConfig {
	enable: boolean;
	interval: number;
}

export type NavBarLink = {
	name: string;
	url: string;
};

export type NavBarConfig = {
	links: NavBarLink[];
};

export interface SiteConfig {
	title: string;
	description: string;
	author: string;
	lang?: string;
	hue: number;
	pageWidth: number;
	record?: {
		enable: boolean;
		text: string;
		url: string;
	};
	pageId: string;
	autoRefresh?: AutoRefreshConfig;
}