import type { SearchResult } from "$lib";
import sql from "./db";
import { dummyStocks } from "./dummyStocks";

export async function search(term: string): Promise<SearchResult[]> {
    if (!term) {
        throw new Error("Search term is required");
    }

    // Use dummy data if Vitest or Playwright is running
    if (process.env.PLAYWRIGHT_TEST_BASE_URL || process.env.VITEST) {
        const lowerTerm = term.toLowerCase().trim();

        const results = dummyStocks.filter(
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

export async function getSymbolName(symbol: string): Promise<string> {
    if (!symbol) {
        throw new Error("Symbol is required");
    }

    const results =
        await sql`SELECT name FROM stocks WHERE symbol = ${symbol} LIMIT 1`;

    if (results.length == 0) {
        throw new Error("Stock not found");
    }

    return results[0].name;
}
