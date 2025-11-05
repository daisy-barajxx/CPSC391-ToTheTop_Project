import {
    deleteSession,
    SESSION_COOKIE_NAME,
    validateSessionToken,
} from "$lib/server/auth";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ cookies }) => {
    // If the user is already logged in, log them out and redirect to home page
    const sessionToken = cookies.get(SESSION_COOKIE_NAME);

    if (sessionToken) {
        const existingSession = await validateSessionToken(sessionToken);

        if (existingSession) {
            await deleteSession(existingSession.id);
            cookies.delete(SESSION_COOKIE_NAME, { path: "/" });

            return;
        }
    }

    // If no session, just redirect to home page

    throw redirect(302, "/");
};
