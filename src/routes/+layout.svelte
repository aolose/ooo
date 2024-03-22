<script lang="ts">
	import { dev, browser } from '$app/environment';
	if (browser) {
		const swUrl = '/service-worker.js';
		navigator.serviceWorker.register(swUrl, {
			type: dev ? 'module' : 'classic'
		});
	}
</script>

<slot />
