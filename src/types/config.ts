export interface AutoRefreshConfig {
	enable: boolean;
	/** Interval in seconds. */
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
	pageId: string;
	autoRefresh?: AutoRefreshConfig;
}
