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
}