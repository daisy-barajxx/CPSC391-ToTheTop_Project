import { redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import {
    createSession,
    isValidSession,
    SESSION_COOKIE_NAME,
} from "$lib/server/auth";
import sql from "$lib/server/db";
import { verify } from "@node-rs/argon2";
import { error } from "@sveltejs/kit";
import { validateUserInfo } from "$lib/validate";

export const load: PageServerLoad = async ({ cookies }) => {
    if (await isValidSession(cookies)) {
        throw redirect(302, "/");
    }
};

export const actions: Actions = {
    default: async ({ cookies, request }) => {
        const data = await request.formData();

        const username = data.get("username")?.toString();
        const password = data.get("password")?.toString();

        if (!username || !password) {
            throw error(400, "Username and password are required");
        }

        const errors = validateUserInfo(username, password);

        if (errors.size > 0) {
            return { invalid: errors };
        }

        const users =
            await sql`SELECT * FROM users WHERE username = ${username}`;

        if (users.length != 1) {
            return { error: "Invalid username or password" };
        }

        const user = users[0]!;

        if (!(await verify(user.password, password))) {
            return { error: "Invalid username or password" };
        }

        const session = await createSession(user.id);
        cookies.set(SESSION_COOKIE_NAME, session.token, { path: "/" });

        return { user: { id: user.id, name: user.name } };
    },
};
