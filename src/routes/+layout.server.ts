import { SESSION_COOKIE_NAME, validateSessionToken } from "$lib/server/auth";
import sql from "$lib/server/db";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ cookies }) => {
    const sessionToken = cookies.get(SESSION_COOKIE_NAME);

    if (sessionToken) {
        const existingSession = await validateSessionToken(sessionToken);

        if (existingSession) {
            const user =
                await sql`SELECT id, name FROM users WHERE id = ${existingSession.userId}`;
            return { user: { id: user[0].id, name: user[0].name } };
        }
    }

    return { user: null };
};
