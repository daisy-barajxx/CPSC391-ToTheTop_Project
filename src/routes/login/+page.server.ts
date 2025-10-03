import { redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import {
    constantTimeCompare,
    createSession,
    validateSessionToken,
} from "$lib/server/auth";
import sql from "$lib/server/db";

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
    // const session = await createSession();
    // cookies.set("session", session.token, { path: "/" });

    // throw redirect(302, "/");
};

export const actions: Actions = {
    default: async ({ cookies, request }) => {
        const data = await request.formData();

        const username = data.get("username")!.toString();
        const password = data.get("password")!.toString();

        const user = await sql`SELECT * FROM users WHERE id = ${username}`;

        if (user.length != 1) {
            return { error: "Invalid username or password" };
        }

        // Convert user-supplied password to UInt8Array
        const passwordBytes = new TextEncoder().encode(password);

        if (!constantTimeCompare(user[0].password, passwordBytes)) {
            return { error: "Invalid username or password" };
        }

        const session = await createSession();
        cookies.set("session", session.token, { path: "/" });

        throw redirect(302, "/");
    },
};
