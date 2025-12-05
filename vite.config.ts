import { UserConfig, Plugin } from 'vite';
import analyze from 'rollup-plugin-analyzer';
import solidPlugin from 'vite-plugin-solid';
import devtools from 'solid-devtools/vite';
import tailwindcss from '@tailwindcss/vite';
import { siteConfig } from './src/config';

const inject_config_plugin = (): Plugin => {
	return {
		name: 'inject-config',
		transformIndexHtml(html) {
			return html
				.replace(/<title>.*?<\/title>/, `<title>${siteConfig.title}</title>`)
				.replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${siteConfig.description}" />`)
				.replace(/<meta name="author" content=".*?" \/>/, `<meta name="author" content="${siteConfig.author}" />`)
				.replace(/<html lang=".*?"/, `<html lang="${siteConfig.lang || 'zh-CN'}" style="--hue: ${siteConfig.hue};--page-width: ${siteConfig.pageWidth}"`);
		},
	};
};

const config: UserConfig = {
	plugins: [devtools(), solidPlugin(), tailwindcss(), inject_config_plugin(), analyze({ summaryOnly: true })],
	server: {
		port: 7210,
	},
	build: {
		target: 'esnext',
	},
	resolve: {
		alias: {
			'@': '/src',
			'@features': '/src/features',
			'@shared': '/src/shared',
			'@services': '/src/services',
		},
	},
};

export default config;
