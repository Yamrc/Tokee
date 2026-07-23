interface CacheEntry<T> {
	data: T;
	timestamp: number;
	ttl: number;
}

class Cache {
	private store: Map<string, CacheEntry<unknown>> = new Map();
	private defaultTTL = 300000;

	get<T>(key: string, ttl?: number): T | null {
		const entry = this.store.get(key);
		if (!entry) return null;

		const effectiveTTL = ttl ?? this.defaultTTL;
		if (Date.now() - entry.timestamp > effectiveTTL) {
			this.store.delete(key);
			return null;
		}

		return entry.data as T;
	}

	set<T>(key: string, data: T, ttl?: number): void {
		const effectiveTTL = ttl ?? this.defaultTTL;
		this.store.set(key, {
			data,
			timestamp: Date.now(),
			ttl: effectiveTTL,
		});
	}

	delete(key: string): void {
		this.store.delete(key);
	}

	deleteByPrefix(prefix: string): void {
		for (const key of this.store.keys()) {
			if (key.startsWith(prefix)) {
				this.store.delete(key);
			}
		}
	}

	clear(): void {
		this.store.clear();
	}
}

export const cache = new Cache();
