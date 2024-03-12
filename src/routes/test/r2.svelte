<script lang="ts">
	import { submitHelper } from '$lib/form';
	import { onMount } from 'svelte';
	import type { FileMeta } from '../../ambient';
	import { api } from '$lib/req';
	import { fileSize } from '$lib/utils';
	import Table from '$lib/components/table.svelte';

	let ls: FileMeta[] = [];
	const apiFile = api('files');
	const loadLs = async () => {
		ls = (await apiFile.get()) as FileMeta[];
	};
	const del = (key: string) => () => {
		apiFile.delete(key).success(() => {
			ls = ls.filter((a) => a.key !== key);
		});
	};
	onMount(loadLs);
	const [handler, result] = submitHelper();
	result.subscribe((a) => {
		if (!a.pending && (a.data || a.error)) loadLs();
	});
</script>

<fieldset>
	<legend>R2 TEST</legend>
	<form on:submit={handler} method="post" action="files">
		<button on:click={loadLs}>load files</button>
		<input name="file" type="file" />
		<input type="submit" value={$result.pending ? 'uploading' : 'upload'} />
	</form>
	<Table>
		<tr slot="thead">
			<th>Filename</th>
			<th>Type</th>
			<th>size</th>
			<th>Updated</th>
			<th></th>
		</tr>
		{#each ls as item (item.key)}
			<tr>
				<td><a href={`/res/${item.key}`}>{item.name}</a></td>
				<td>{item.type}</td>
				<td>{fileSize(item.size)}</td>
				<td>{new Date(item.updated)}</td>
				<td>
					<button on:click={del(item.key)}>delete</button>
				</td>
			</tr>
		{/each}
	</Table>
</fieldset>
