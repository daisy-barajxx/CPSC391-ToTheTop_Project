import { dummyStocks } from "./dummyStocks";

export interface SearchResult {
    symbol: string;
    name: string;
}

export async function search(term: string): Promise<SearchResult[]> {
    return dummyStocks.filter(
        (stock) =>
            stock.name.toLowerCase().includes(term) ||
            stock.symbol.toLowerCase().includes(term)
    );
}
