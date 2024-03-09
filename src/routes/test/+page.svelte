<script lang="ts">
	import { submitHelper } from '$lib/form';
	import { onMount } from 'svelte';
	import type { FileMeta } from '../../ambient';
	import { api } from '$lib/req';
	import { fileSize } from '$lib/utils';

	let bucketOk = 0;
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
	onMount(() => {
		api('ok')
			.get()
			.success(async (a) => {
				bucketOk = +a;
				await loadLs();
			});
	});
	const [handler, result] = submitHelper();
	result.subscribe((a) => {
		if (!a.pending && (a.data || a.error)) loadLs();
	});
</script>

<div>
	<p>
		<button on:click={loadLs}>load files</button>
		bucketOk:{bucketOk}
	</p>
	<form on:submit={handler} method="post" action="files">
		<input name="file" type="file" />
		<input type="submit" value={$result.pending ? 'uploading' : 'upload'} />
	</form>
	<table>
		<tbody>
			{#each ls as item}
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
		</tbody>
	</table>
</div>

<style lang="scss">
	table {
		width: 100%;
		background: #fefefe;
		border-collapse: collapse;

		td {
			border: 1px solid #eee;
		}
	}
</style>
