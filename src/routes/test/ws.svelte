<script lang="ts">
	import Box from './box.svelte';
	import { onMount } from 'svelte';

	let ws: WebSocket;
	const open = () => {
		message = 'connecting...';
		ws = new WebSocket(`${location.protocol[5] ? 'wss' : 'ws'}://${location.host}/api/hello`);
		ws.onopen = () => {
			message = 'open';
		};
		ws.onerror = (e: Event) => {
			message = e.toString();
		};
		ws.onmessage = (d) => {
			message = d.data;
		};
		return () => {
			ws.close();
		};
	};
	const send = () => {
		if (ws.OPEN && value) {
			ws.send(value);
			value = '';
		}
	};
	let value = '';
	let message = 'connecting...';
	onMount(open);
</script>

<Box name="Websocket">
	<input bind:value />
	<button on:click={send}>Send</button>
	<button on:click={open}>ReConnect</button>
	<textarea readonly>{message}</textarea>
</Box>

<style lang="scss">
	textarea {
		display: block;
		width: 300px;
		resize: none;
		height: 100px;
		padding: 10px;
		margin-top: 10px;
	}
</style>
