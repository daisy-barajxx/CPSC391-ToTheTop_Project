import { json, type RequestHandler } from "@sveltejs/kit";
import { search } from "$lib/server/search";

export const GET: RequestHandler = async ({ url }) => {
    // const term = url.searchParams.get("term") || "";

    // Don't waste time searching with no search term
    // if (term == "") {
    //     return json([]);
    // }

    // const results = await search(term);

//lines 15 & 16 for dummy data 
    const term = url.searchParams.get("term") || "";
    const results = search(term);
    
    return json(results);
};
