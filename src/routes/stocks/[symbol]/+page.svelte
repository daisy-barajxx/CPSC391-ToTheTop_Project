<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const { stock, symbol } = data;

</script>

<div>
	<h1>{symbol}</h1>
	<p>{stock.name}</p>
</div>

