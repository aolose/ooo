<script lang="ts">
	import R2 from './r2.svelte';
	import D1 from './d1.svelte';
	import KV from './kv.svelte';
	import { onMount } from 'svelte';
  import {arrayify} from '$lib/utils-wasm'

	onMount(async ()=>{
		await arrayify({})
		console.log({arrayify})
	})

</script>

<R2 />
<D1 />
<KV />
