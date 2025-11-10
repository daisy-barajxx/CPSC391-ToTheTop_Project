import { authorizeUserAction } from "$lib/server/auth";
import { getWatchlist } from "$lib/server/watchlists";
import { error, json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ cookies, request }) => {
    const reqData = await request.json();
    const userId = reqData.userId;

    if (!userId) {
        throw error(400, "User ID is required.");
    }

    const authorized = await authorizeUserAction(cookies, userId);

    if (authorized == null) {
        throw error(401, "Unauthenticated");
    }

    if (!authorized) {
        throw error(403, "Unauthorized");
    }

    return json(await getWatchlist(userId));
};
