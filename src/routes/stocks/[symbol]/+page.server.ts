import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { isValidSession } from "$lib/server/auth";

export const load: PageServerLoad = async ({ cookies, params }) => {
    if (!(await isValidSession(cookies))) {
        throw error(401, "Unauthorized");
    }

    return { symbol: params.symbol };
};
