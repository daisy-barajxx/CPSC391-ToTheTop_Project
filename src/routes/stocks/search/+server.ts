import { json, type RequestHandler } from "@sveltejs/kit";
import { search } from "$lib/server/search";
// import { stringify } from "querystring";

export const GET: RequestHandler = async ({ url }) => {
    const term = url.searchParams.get("term")?.toLowerCase() || "";

    // Don't waste time searching with no search term
    if (term == "") {
        return json([]);
    }

    const results = await search(term);

    return json(results);
};
