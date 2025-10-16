<script lang="ts">
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
	const { stock, symbol } = data;
</script>

<div>
	<h1>{symbol}</h1>
	<p>{stock.name}</p>

	<div>
		<h2>Price Chart</h2>
		<p>Chart will render here</p>
	</div>
</div>

