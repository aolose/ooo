<script lang="ts">
	export let name = '';
</script>

<fieldset>
	<legend>{name}</legend>
	<slot />
</fieldset>

<style>
	fieldset {
		margin-bottom: 10px;
	}
</style>
