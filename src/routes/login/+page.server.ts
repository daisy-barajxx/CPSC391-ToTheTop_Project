import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { createSession, validateSessionToken } from "$lib/server/auth";

export const load: PageServerLoad = async ({ cookies }) => {
    // If the user is already logged in, redirect them to the home page
    const sessionToken = cookies.get("session");

    if (sessionToken) {
        const existingSession = await validateSessionToken(sessionToken);

        if (existingSession) {
            throw redirect(302, "/");
        }
    }

    // TODO: Proper logging in, just creates a new session for now
    const session = await createSession();
    cookies.set("session", session.token, { path: "/" });

    throw redirect(302, "/");
};
