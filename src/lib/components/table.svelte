<table>
	<thead>
		<slot name="thead" />
	</thead>
	<tbody>
		<slot />
	</tbody>
</table>

<style lang="scss">
	table {
		margin: 30px 0;
		width: 100%;
		background: #fefefe;
		border-collapse: collapse;
		text-align: left;
		thead {
			background: rgba(0, 0, 0, 0.2);
		}
		:global(tr:nth-child(2n)) {
			background: rgba(0, 0, 0, 0.1);
		}
		:global(td),
		:global(th) {
			font-size: 14px;
			padding: 8px;
			border: 1px solid rgba(0, 0, 0, 0.2);
		}
	}
</style>
