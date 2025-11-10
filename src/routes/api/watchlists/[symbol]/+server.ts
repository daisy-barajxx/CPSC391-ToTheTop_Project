import { authorizeUserAction } from "$lib/server/auth";
import { addToWatchlist, removeFromWatchlist } from "$lib/server/watchlists";
import { error, json, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ cookies, request, params }) => {
    const reqData = await request.json();
    const userId = reqData.userId;

    if (!userId) {
        throw error(400, "User ID is required.");
    }

    if (!params.symbol) {
        throw error(400, "Stock symbol is required.");
    }

    const authorized = await authorizeUserAction(cookies, userId);

    if (authorized == null) {
        throw error(401, "Unauthenticated");
    }

    if (!authorized) {
        throw error(403, "Unauthorized");
    }

    return json(await addToWatchlist(userId, params.symbol));
};

export const DELETE: RequestHandler = async ({ cookies, request, params }) => {
    const reqData = await request.json();
    const userId = reqData.userId;

    if (!params.symbol) {
        throw error(400, "Stock symbol is required.");
    }

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

    return json(await removeFromWatchlist(userId, params.symbol));
};
