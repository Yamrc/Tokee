import { fileURLToPath } from "node:url";
import svelte from "@astrojs/svelte";
import swup from "@swup/astro";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

const src = (path) => fileURLToPath(new URL(`./src/${path}`, import.meta.url));

export default defineConfig({
	integrations: [
		swup({
			theme: false,
			animationClass: "transition-swup-",
			containers: ["main"],
			smoothScrolling: true,
			cache: true,
			preload: true,
			accessibility: true,
			updateHead: true,
			updateBodyClass: false,
			reloadScripts: true,
			globalInstance: true,
			ignore: (url, { el } = {}) => {
				const href = el?.getAttribute("href") || url;
				if (!href) return false;
				if (el?.closest("a[download]")) return true;
				if (/^(mailto:|tel:)/i.test(href)) return true;
				if (/\.(?:7z|avi|csv|docx?|gif|ico|jpe?g|js|json|m4a|m4v|mov|mp3|mp4|pdf|png|svg|tar|txt|webm|webp|xml|zip)(?:[?#].*)?$/i.test(href)) return true;

				try {
					return new URL(href, window.location.href).origin !== window.location.origin;
				} catch {
					return false;
				}
			},
		}),
		svelte(),
	],
	server: {
		port: 7210,
	},
	vite: {
		plugins: [tailwindcss()],
		resolve: {
			alias: {
				"@": src(""),
				"@config": src("config.ts"),
				"@layouts": src("layouts"),
				"@islands": src("islands"),
				"@lib": src("lib"),
				"@scripts": src("scripts"),
				"@styles": src("styles"),
			},
		},
	},
});
