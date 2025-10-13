import type { SearchResult } from "$lib";
import { dummyStocks } from "./dummyStocks";

export async function search(term: string): Promise<SearchResult[]> {
    if (!term) {
        throw new Error("Search term is required");
    }

    const lowerTerm = term.toLowerCase();

    const results = await dummyStocks.filter(
        (stock) =>
            stock.name.toLowerCase().includes(lowerTerm) ||
            stock.symbol.toLowerCase().includes(lowerTerm)
    );

    return results.slice(0, 5);
}
