const rtf = new Intl.RelativeTimeFormat('zh-CN', { numeric: 'auto' });
const units: [Intl.RelativeTimeFormatUnit, number][] = [
	['year', 31536000000],
	['month', 2592000000],
	['week', 604800000],
	['day', 86400000],
	['hour', 3600000],
	['minute', 60000],
];

export function formatRelativeTime(dateString: string): string {
	try {
		const diff = Date.now() - new Date(dateString).getTime();
		if (Math.abs(diff) < 60000) return '刚刚';
		for (const [unit, ms] of units) {
			if (Math.abs(diff) >= ms) {
				return rtf.format(-Math.round(diff / ms), unit);
			}
		}
		return '刚刚';
	} catch {
		return dateString;
	}
}
