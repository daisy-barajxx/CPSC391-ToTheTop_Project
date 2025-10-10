import { type RequestHandler } from "@sveltejs/kit";
import { dummyStocks } from "$lib/server/dummyStocks";
// import { stringify } from "querystring";

export const GET: RequestHandler = async ({ url }) => {
    const term = url.searchParams.get("term")?.toLowerCase() || "";

    const results = dummyStocks.filter(
        (stock) =>
            stock.name.toLowerCase().includes(term) || 
            stock.symbol.toLowerCase().includes(term)
    );

    return new Response(JSON.stringify(results), {
        headers: { 'Content-Type': 'application/json'}
    });
};
