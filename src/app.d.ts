export {};

declare global {
	interface Window {
		_git_hash: string;
		__tokeeScrollbarListeners?: boolean;
		__tokeeSwupLifecycleBound?: boolean;
		swup?: {
			hooks: {
				on: (name: string, callback: () => void) => void;
				before: (name: string, callback: () => void) => void;
			};
		};
	}
}

