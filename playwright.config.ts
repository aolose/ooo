import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
	webServer: {
		command: 'npm run build && wrangler dev --port 4173',
		port: 4173
	},
	testDir: 'test/e2e',
	testMatch: /(.+\.)?(test|spec)\.[jt]s/
};

export default config;
