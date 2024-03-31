<script lang="ts">
	export let name = '';
</script>

<fieldset>
	<legend>{name}</legend>
	<slot />
</fieldset>

<style>
	fieldset {
		min-width: 45%;
		margin-bottom: 10px;
	}
</style>
