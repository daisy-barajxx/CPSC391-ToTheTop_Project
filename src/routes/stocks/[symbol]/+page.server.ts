import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { validateSessionToken } from "$lib/server/auth";

export const load: PageServerLoad = async ({ cookies, params }) => {
    const sessionToken = cookies.get("session");

    if (!sessionToken) {
        error(401, "Unauthorized");
    }

    const session = await validateSessionToken(sessionToken);

    if (!session) {
        error(401, "Unauthorized");
    }

    return { symbol: params.symbol };
};
