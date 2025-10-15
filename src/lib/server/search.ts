import { dev } from "$app/environment";
import type { SearchResult } from "$lib";
import sql from "./db";
import { dummyStocks } from "./dummyStocks";

export async function search(term: string): Promise<SearchResult[]> {
    if (!term) {
        throw new Error("Search term is required");
    }

    // Temp
    if (true) {
        const lowerTerm = term.toLowerCase();

        const results = await dummyStocks.filter(
            (stock) =>
                stock.name.toLowerCase().includes(lowerTerm) ||
                stock.symbol.toLowerCase().includes(lowerTerm)
        );

        return results.slice(0, 5);
    }

    const sqlTerm = `%${term}%`;

    const results =
        await sql`SELECT * FROM stocks WHERE symbol ilike ${sqlTerm} OR name ilike ${sqlTerm} LIMIT 5`;

    return results.map((val) => {
        return { symbol: val.symbol, name: val.name };
    });
}
