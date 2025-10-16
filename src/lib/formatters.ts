export function formatPrice(value: number): string {
		return new Intl.NumberFormat('en-US', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		}).format(value);
}

export function formatCurrency(value: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(value);
}

export function getArrow(change: number): { symbol: string; color: string } {
		if (change > 0) {
			return { symbol: '+', color: 'green' }; 
		} else if (change < 0) {
			return { symbol: '-', color: 'red' }; 
		}
		return { symbol: ' ', color: 'grey' }; 
}