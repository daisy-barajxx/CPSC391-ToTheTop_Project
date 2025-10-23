import { json, type RequestHandler } from "@sveltejs/kit";
import { search } from "$lib/server/search";

export const GET: RequestHandler = async ({ url }) => {
    const term = (url.searchParams.get("term") || "").trim();

    // Avoid wasteful queries; require at least 1 meaningful char
    if (term.length < 1) {
        return json([]);
    }

    // Perform search and cap results to reduce payload
    const results = search(term).slice(0, 5);

    return json(results);
};
