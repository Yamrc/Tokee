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
		// apexcharts 实在是太大
		rollupOptions: {
			treeshake: {
				moduleSideEffects: (id: string) => {
					if (id.includes('.css') || id.includes('.scss') || id.includes('.less')) {
						return true;
					}
					if (id.includes('solid-devtools')) {
						return true;
					}
					return false;
				},
				preset: 'smallest',
				propertyReadSideEffects: false,
				tryCatchDeoptimization: false,
			},
			output: {
				manualChunks(id) {
					if (id.includes('node_modules')) {
						if (id.includes('apexcharts')) return 'apexcharts';
						if (id.includes('iconify-icon')) return 'iconify';
						if (id.includes('overlayscrollbars')) return 'scrollbars';
						if (id.includes('solid-js')) return 'solid';
					}
					return null;
				},
			},
		},
	},
	optimizeDeps: {
		include: ['solid-js', '@iconify-icon/solid'],
		exclude: ['apexcharts'],
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