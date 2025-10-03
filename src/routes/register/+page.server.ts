import { redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { createSession, validateSessionToken } from "$lib/server/auth";
import sql from "$lib/server/db";
import { hash } from "@node-rs/argon2";

export const load: PageServerLoad = async ({ cookies }) => {
    // If the user is already logged in, redirect them to the home page
    const sessionToken = cookies.get("session");

    if (sessionToken) {
        const existingSession = await validateSessionToken(sessionToken);

        if (existingSession) {
            throw redirect(302, "/");
        }
    }
};

export const actions: Actions = {
    default: async ({ cookies, request }) => {
        const data = await request.formData();

        const username = data.get("username")!.toString();
        const password = data.get("password")!.toString();
        const name = data.get("name")!.toString();

        // Check if the username already exists
        const existingUser =
            await sql`SELECT * FROM users WHERE username = ${username}`;

        if (existingUser.length > 0) {
            return { error: "Username is taken" };
        }

        const hashedPassword = await hash(password);

        const result =
            await sql`INSERT INTO users (username, password, name) VALUES (${username}, ${hashedPassword}, ${name}) RETURNING id`;

        const userId = result[0]!.id;

        const session = await createSession(userId);
        cookies.set("session", session.token, { path: "/" });

        throw redirect(302, "/");
    },
};
