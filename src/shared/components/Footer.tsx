import { Component } from 'solid-js';
import { Icon } from '@iconify-icon/solid';
import { siteConfig } from '@/config';

const Footer: Component = () => {
	return (
		<footer class="max-w-(--page-width) w-full md:px-4 mx-auto mb-4">
			<div class="transition flex flex-col items-center justify-center px-6">
				<div class="transition text-50 text-sm text-center whitespace-nowrap">
					<span style={{ 'font-family': "'Roboto', system-ui, sans-serif" }}>©</span> <span id="copyright-year">{new Date().getFullYear()}</span> {siteConfig.author}. All Rights Reserved.
				</div>
				<div class="flex flex-wrap items-center justify-center gap-1 transition text-50 text-sm text-center whitespace-nowrap">
					<span class="gap-1">
						Powered by{' '}
						<a class="transition link text-(--primary) font-medium" target="_blank" rel="noopener noreferrer" href="https://uptimerobot.com">UptimeRobot</a> &{' '}
						<a class="transition link text-(--primary) font-medium" target="_blank" rel="noopener noreferrer" href="https://github.com/Yamrc/Tokee">Tokee</a>
					</span>
					<span class="inline-flex items-center align-baseline gap-1">
						<Icon icon="material-symbols:commit-rounded" width="0.875rem" height="0.875rem" />{window._git_hash}
					</span>
					{siteConfig.record?.enable && (
						<>
							{' / '}
							<a class="transition link text-(--primary) font-medium" target="_blank" rel="noopener noreferrer" href={siteConfig.record.url}>{siteConfig.record.text}</a>
						</>
					)}
				</div>
			</div>
		</footer>
	);
};

export default Footer;

