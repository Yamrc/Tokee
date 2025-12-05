import { Component } from 'solid-js';
import { siteConfig } from '@/config';

const Footer: Component = () => {
	const current_year = new Date().getFullYear();

	return (
		<footer class="max-w-(--page-width) w-full md:px-4 mx-auto mb-4">
			<div class="transition flex flex-col items-center justify-center px-6">
				<div class="transition text-50 text-sm text-center whitespace-nowrap">
					&copy; <span id="copyright-year">{new Date().getFullYear()}</span> {siteConfig.author}. All Rights Reserved.
				</div>
				<div class="transition text-50 text-sm text-center whitespace-nowrap">
					Powered by{' '}
					<a class="transition link text-(--primary) font-medium" target="_blank" rel="noopener noreferrer" href="https://uptimerobot.com">UptimeRobot</a> &{' '}
					<a class="transition link text-(--primary) font-medium" target="_blank" rel="noopener noreferrer" href="https://github.com/Yamrc/Tokee">Tokee</a>
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

