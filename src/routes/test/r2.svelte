<script lang="ts">
	import { onMount } from 'svelte';
	import type { FileMeta } from '../../ambient';
	import { api } from '$lib/req';
	import { fileSize } from '$lib/utils';
	import { uploader } from '$lib/upload';
	import Table from '$lib/components/table.svelte';
	import Box from './box.svelte';

	let ls: FileMeta[] = [];
	const apiFile = api('files');
	const loadLs = async () => {
		ls = (await apiFile.get().use({ cache: { expire: 10 } })) as FileMeta[];
	};
	const del = (key: string) => () => {
		apiFile.delete(key).success(() => {
			ls = ls.filter((a) => a.key !== key);
		});
	};
	onMount(loadLs);
	let file: HTMLInputElement;
	let pending = false;

	function up() {
		uploader(file.files?.[0])?.progress((info) => {
			pending = info.uploading;
			console.log('uploaded:', Math.floor((info.uploaded * 100) / info.total), '%');
			if (!pending) loadLs();
		});
		file.value = '';
	}
</script>

<Box name="R2 TEST">
	<button on:click={loadLs}>load files</button>
	<input bind:this={file} name="file" type="file" />
	<button on:click={up}>{pending ? 'uploading' : 'upload'}</button>
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
				<td><a href={`/res/${item.key}`}>{decodeURI(item.name)}</a></td>
				<td>{item.type}</td>
				<td>{fileSize(item.size)}</td>
				<td>{new Date(item.updated)}</td>
				<td>
					<button on:click={del(item.key)}>delete</button>
				</td>
			</tr>
		{/each}
	</Table>
</Box>
