import type { SearchResult } from "$lib";
import { dummyStocks } from "./dummyStocks";

export async function search(term: string): Promise<SearchResult[]> {
    return dummyStocks.filter(
        (stock) =>
            stock.name.toLowerCase().includes(term) ||
            stock.symbol.toLowerCase().includes(term)
    );
}
