import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
	plugins: [
		sveltekit(),
		basicSsl({
			name: 'dev',
			certDir: 'C:/Users/ufota/Downloads',
			domains: ['a.dev']
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
