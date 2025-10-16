export interface SearchResult {
    symbol: string;
    name: string;
}

export interface Stock {
    symbol: string;
    name: string;
    price: number;
    priceChange: number;
    percentChange: number;
}
