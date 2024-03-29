<script lang="ts">
	import R2 from './r2.svelte';
	import D1 from './d1.svelte';
	import KV from './kv.svelte';
	import En from './encrypt.svelte';
	import { onMount } from 'svelte';
	import init, { is_object } from '$lib/utils-wasm/pkg';

	onMount(async () => {
		await init();
		is_object({});
	});
</script>

<R2 />
<D1 />
<KV />
<En />
