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

export function formatPercent(value: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value / 100);
}
export function getArrow(change: number): { symbol: string; color: string } {
		if (change > 0) {
			return { symbol: '+', color: 'green' }; 
		} else if (change < 0) {
			return { symbol: '-', color: 'red' }; 
		}
		return { symbol: ' ', color: 'grey' }; 
}

export function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

export function formatChange(change: number, percent: number): { text: string; color: string } {
    const arrow = getArrow(change);
    return {
        text: `${arrow.symbol}${change.toFixed(2)} (${percent.toFixed(2)}%)`,
        color: arrow.color
    };
}
export function formatChangeText(change: number, percent: number): string {
  const arrow = getArrow(change);
  return `${arrow.symbol}${formatPrice(Math.abs(change))} (${formatPercent(Math.abs(percent))})`;
}

export function formatChangeDisplay(
  change: number,
  percent: number
): { text: string; color: string } {
  const arrow = getArrow(change);
  return {
    text: `${arrow.symbol}${formatPrice(Math.abs(change))} (${formatPercent(Math.abs(percent))})`,
    color: arrow.color,
  };
}