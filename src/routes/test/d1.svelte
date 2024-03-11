<script lang="ts">
	import { api } from '$lib/req';
	import { onMount } from 'svelte';
	import { toTable } from '$lib/utils';

	let list = [] as unknown[][];
	const head = ['CustomerName', 'CompanyName', 'ContactName'];
	const userApi = api('user');
	const load = async () => {
		const o = await userApi.get<string>(head.join());
		list = toTable(3, o);
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
	<table>
		<thead>
			<tr>
				{#each head as h}
					<th>{h}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each list as item}
				<tr>
					{#each item as d}
						<td>{d}</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</fieldset>

<style lang="scss">
	table {
		width: 100%;
		background: #fefefe;
		border-collapse: collapse;
		text-align: left;
		th {
			padding: 5px;
			background: rgba(0, 0, 0, 0.1);
		}
		td {
			padding: 5px;
			border: 1px solid #ddd;
		}
	}
</style>
