<script lang="ts">
	import { api } from '$lib/req';
	import { onMount } from 'svelte';
	import { groupArr } from '$lib/utils';
	import Table from '$lib/components/table.svelte';

	let list = [] as unknown[][];
	const head = ['CustomerName', 'CompanyName', 'ContactName'];
	const userApi = api('user');
	const load = async () => {
		const o = await userApi.get<unknown[]>(head.join());
		list = groupArr(3, o);
	};
	const add = async () => {
		await userApi.put();
		await load();
	};
	const clear = async () => {
		await userApi.delete();
		await load();
	};
	onMount(load);
</script>

<fieldset>
	<legend>DB TEST</legend>
	<button on:click={add}>ADD</button>
	<button on:click={clear}>Clear</button>
	<Table>
		<tr slot="thead">
			{#each head as h}
				<th>{h}</th>
			{/each}
		</tr>
		{#each list as item}
			<tr>
				{#each item as d}
					<td>{d}</td>
				{/each}
			</tr>
		{/each}
	</Table>
</fieldset>
