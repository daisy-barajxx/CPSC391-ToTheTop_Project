import { validateSessionToken } from "$lib/server/auth";
import sql from "$lib/server/db";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ cookies }) => {
    const sessionToken = cookies.get("session");

    if (sessionToken) {
        const existingSession = await validateSessionToken(sessionToken);

        if (existingSession) {
            const user =
                await sql`SELECT id, name FROM users WHERE id = ${existingSession.userId}`;

            return { user: user[0] };
        }
    }

    return { user: null };
};
