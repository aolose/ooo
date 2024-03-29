<script lang="ts">
	import { api } from '$lib/req';
	import { delay } from '$lib/utils';
	import Box from './box.svelte';

	let value = '';
	let p = false;
	const q = api('echo');
	let result = Promise.resolve('');
	let echo = '';
	$: {
		result.then((a) => (echo = a));
	}

	const post = delay(() => {
		if (!value) return;
		p = true;
		result = q
			.post<string>(value)
			.use({ encrypt: true })
			.finally(() => (p = false));
	}, 300);

	const get = delay(() => {
		if (!value) return;
		p = true;
		result = q
			.get<string>(value)
			.use({ encrypt: true })
			.finally(() => (p = false));
	}, 300);
</script>

<Box name="Encrypt TEST">
	<input bind:value />
	<button on:click={post}>
		{p ? 'pending' : 'POST'}
	</button>
	<button on:click={get}>
		{p ? 'pending' : 'GET'}
	</button>
	<textarea readonly>{echo}</textarea>
</Box>

<style>
	textarea {
		resize: none;
		display: block;
		margin: 10px 0;
		width: 400px;
		height: 100px;
	}
</style>
