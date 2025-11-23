import { UserConfig } from 'vite';
import analyze from 'rollup-plugin-analyzer';
import solidPlugin from 'vite-plugin-solid';
import devtools from 'solid-devtools/vite';
import tailwindcss from '@tailwindcss/vite';

const config: UserConfig = {
	plugins: [devtools(), solidPlugin(), tailwindcss(), analyze({ summaryOnly: true })],
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