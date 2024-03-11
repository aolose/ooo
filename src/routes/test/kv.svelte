<script lang="ts">
	import Table from '$lib/components/table.svelte';
	import { submitHelper } from '$lib/form';
	import { api } from '$lib/req';
	import { onMount } from 'svelte';

	let ls: [string, string | null][] = [];
	const load = async () => {
		ls = await kv.get();
	};

	const [handler, result] = submitHelper(load);
	let p = 0;
	const kv = api('kv');
	const del = (k: string) => () => {
		kv.delete(k).then(load);
	};
	result.subscribe((o) => {
		p = o.pending;
	});
	onMount(load);
	let key = '',
		value = '';
</script>

<fieldset>
	<legend>KV TEST</legend>
	<form on:submit={handler} action="kv" method="post">
		<label><span>key:</span><input bind:value={key} name="key" /></label>
		<label><span>value:</span><input bind:value name="value" /></label>
		<button type="submit">submit{p ? 'ing' : ''}</button>
	</form>
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
</fieldset>
