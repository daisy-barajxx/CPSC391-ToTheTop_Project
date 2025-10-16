<script lang="ts">
	import type { PageData } from './$types';
    import { formatPrice, formatCurrency, getArrow } from '$lib/formatters';

	let { data } = $props<{ data: PageData }>();
	const { stock, symbol } = data;


	const arrow = getArrow(stock.percentChange);
    const isPositive = stock.percentChange > 0;
	const isNegative = stock.percentChange < 0;
	const changeClass = isPositive ? 'positive' : isNegative ? 'negative' : 'neutral';
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
			<span class={changeClass}>
				{arrow.symbol}
			</span>
			<span class={changeClass}>
				{formatCurrency(Math.abs(stock.priceChange))}
			</span>
			<span class={changeClass}>
				({Math.abs(stock.percentChange).toFixed(2)}%)
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
