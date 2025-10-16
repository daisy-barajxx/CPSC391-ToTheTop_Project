<script lang="ts">
	import type { PageData } from './$types';
    import { formatPrice, formatCurrency, getArrow } from '$lib/formatters';

	let { data }: { data: PageData } = $props();
	const { stock, symbol } = data;


	const arrow = getArrow(stock.percentChange);
</script>

<div>
	<div>
		<h1>{symbol}</h1>
		<p>{stock.name}</p>
	</div>

	<div>
		<div>
			<p>USD</p>
			<p>{formatPrice(stock.price)}</p>
		</div>

		<div>
			<span class={stock.percentChange >= 0 ? 'positive' : stock.percentChange < 0 ? 'negative' : 'neutral'}>
				{arrow.symbol}
			</span>
			<span class={stock.percentChange >= 0 ? 'positive' : stock.percentChange < 0 ? 'negative' : 'neutral'}>
				{stock.priceChange >= 0 ? '' : ''}{formatCurrency(stock.priceChange)}
			</span>
			<span class={stock.percentChange >= 0 ? 'positive' : stock.percentChange < 0 ? 'negative' : 'neutral'}>
				({stock.percentChange >= 0 ? '' : ''}{stock.percentChange.toFixed(2)}%)
			</span>
		</div>
	</div>

	<div>
		<h2>Price Chart</h2>
		<p>Chart will render here</p>
	</div>
</div>

<style>
    .positive {
	color: green;
    }

    .negative {
	color: red;
    }

    .neutral {
	color: gray;
    }
</style>