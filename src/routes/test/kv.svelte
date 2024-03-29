<script lang="ts">
	import Table from '$lib/components/table.svelte';
	import { api } from '$lib/req';
	import { onMount } from 'svelte';
	import Box from './box.svelte';

	let ls: [string, string | null][] = [];
	const load = async () => {
		ls = await kv.get();
	};
	let p = 0;
	const kv = api('kv');
	const submit = () => {
		p = 1;
		kv.post([key, value])
			.then(load)
			.finally(() => {
				p = 0;
			});
	};
	const del = (k: string) => () => {
		kv.delete(k).then(load);
	};
	onMount(load);
	let key = '',
		value = '';
</script>

<Box name="KV TEST">
	<div>
		<label><span>key:</span><input bind:value={key} name="key" /></label>
		<label><span>value:</span><input bind:value name="value" /></label>
		<button on:click={submit}>Submit{p ? 'ing' : ''}</button>
		<button on:click={load}>Load</button>
	</div>
	<Table>
		<tr slot="thead">
			<th>Key</th>
			<th>Value</th>
			<th></th>
		</tr>
		{#each ls as [k, v] (k)}
			<tr>
				<td>{k}</td>
				<td>{v}</td>
				<td>
					<button on:click={del(k)}>Delete</button>
				</td>
			</tr>
		{/each}
	</Table>
</Box>
