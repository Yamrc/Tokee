interface CacheEntry<T> {
	data: T;
	timestamp: number;
	ttl: number;
}

class Cache {
	private store: Map<string, CacheEntry<unknown>> = new Map();

	private defaultTTL: number = 300000;

	get<T>(key: string, ttl?: number): T | null {
		const entry = this.store.get(key);
		if (!entry) return null;

		const effectiveTTL: number = ttl ?? this.defaultTTL;
		if (Date.now() - entry.timestamp > effectiveTTL) {
			this.store.delete(key);
			return null;
		}

		return entry.data as T;
	}

	set<T>(key: string, data: T, ttl?: number): void {
		const effectiveTTL: number = ttl ?? this.defaultTTL;
		this.store.set(key, {
			data,
			timestamp: Date.now(),
			ttl: effectiveTTL,
		});
	}

	delete(key: string): void {
		this.store.delete(key);
	}

	clear(): void {
		this.store.clear();
	}

	has(key: string): boolean {
		const entry = this.store.get(key);
		if (!entry) return false;

		if (Date.now() - entry.timestamp > entry.ttl) {
			this.store.delete(key);
			return false;
		}

		return true;
	}

	removeExpired(): void {
		const now: number = Date.now();
		for (const [key, entry] of this.store) {
			if (now - entry.timestamp > entry.ttl) {
				this.store.delete(key);
			}
		}
	}
}

export const cache: Cache = new Cache();
export default cache;
