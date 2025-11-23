export const formatRatio = (ratio: string | number): string => {
	const v = typeof ratio === 'string' ? Number.parseFloat(ratio) : ratio;
	return Number.isNaN(v) ? '0.00' : v.toFixed(2);
};

export const formatTime = (ms: number): string => 
	ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`;
