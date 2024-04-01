import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import basicSsl from '@vitejs/plugin-basic-ssl';
import wsPlugin from 'vite-sveltekit-cf-ws';
export default defineConfig({
	plugins: [
		sveltekit(),
		wsPlugin(),
		basicSsl({
			name: 'dev',
			certDir: '.cert'
		})
	],
	server: {
		host: '127.0.0.1',
		https: {}
	},
	test: {
		include: ['test/unit/**/*.{js,ts}']
	}
});
