import { json, type RequestHandler } from "@sveltejs/kit";
import { search } from "$lib/server/search";

export const GET: RequestHandler = async ({ url }) => {
    const term = url.searchParams.get("term") || "";
    const results = search(term);
    
    return json(results);
};
