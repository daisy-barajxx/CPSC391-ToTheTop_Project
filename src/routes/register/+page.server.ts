import { redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { createSession, isValidSession } from "$lib/server/auth";
import sql from "$lib/server/db";
import { hash } from "@node-rs/argon2";
import { usernameValid, passwordValid, nameValid } from "$lib/user.svelte";
import { error } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ cookies }) => {
    // If the user is already logged in, redirect them to the home page
    if (await isValidSession(cookies)) {
        throw redirect(302, "/");
    }
};

export const actions: Actions = {
    default: async ({ cookies, request }) => {
        const data = await request.formData();

        const username = data.get("username")?.toString();
        const password = data.get("password")?.toString();
        const name = data.get("name")?.toString();

        if (!username || !password || !name) {
            throw error(400, "All fields are required");
        }

        if (!usernameValid(username)) {
            return { error: "Invalid username" };
        }

        if (!passwordValid(password)) {
            return { error: "Invalid password" };
        }

        if (!nameValid(name)) {
            return { error: "Invalid name" };
        }

        const existingUsers =
            await sql`SELECT * FROM users WHERE username = ${username}`;

        if (existingUsers.length > 0) {
            return { error: "Username is already taken" };
        }

        const hashedPassword = await hash(password);

        const result =
            await sql`INSERT INTO users (username, password, name) VALUES (${username}, ${hashedPassword}, ${name}) RETURNING id`;

        const userId = result[0]!.id;

        const session = await createSession(userId);
        cookies.set("session", session.token, { path: "/" });

        return { user: { id: userId, name } };
    },
};
