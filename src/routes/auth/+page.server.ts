import { redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import {
    createSession,
    deleteSession,
    isValidSession,
    SESSION_COOKIE_NAME,
    validateSessionToken,
} from "$lib/server/auth";
import {
    nameValid,
    passwordValid,
    usernameValid,
    userState,
    type AuthFormValues,
} from "$lib/user.svelte";
import sql from "$lib/server/db";
import { hash, verify } from "@node-rs/argon2";

function parseFormData(data: FormData): AuthFormValues | null {
    const username = data.get("username")?.toString();
    const password = data.get("password")?.toString();
    const name = data.get("name")?.toString();

    if (!username || !password) {
        return null;
    }

    return { username, password, name };
}

export const load: PageServerLoad = async ({ cookies }) => {
    if (await isValidSession(cookies)) {
        throw redirect(302, "/");
    }

    // If we reach here, the user is not logged in
    throw redirect(302, "/login");
};

export const actions: Actions = {
    login: async ({ cookies, request }) => {
        const data = parseFormData(await request.formData());

        if (!data) {
            return { error: "Invalid form data" };
        }

        const { username, password } = data;

        const users =
            await sql`SELECT * FROM users WHERE username = ${username}`;

        if (users.length !== 1) {
            return { error: "Invalid username or password" };
        }

        const user = users[0]!;

        if (!(await verify(user.password, password))) {
            return { error: "Invalid username or password" };
        }

        const session = await createSession(user.id);
        cookies.set(SESSION_COOKIE_NAME, session.token, { path: "/" });

        userState.set({ id: user.id, name: user.name });

        throw redirect(302, "/");
    },
    logout: async ({ cookies }) => {
        const token = cookies.get(SESSION_COOKIE_NAME);

        if (token) {
            const session = await validateSessionToken(token);

            if (session) {
                await deleteSession(session.id);
                cookies.delete(SESSION_COOKIE_NAME, { path: "/" });
            }
        }

        userState.set(null);

        throw redirect(302, "/");
    },
    register: async ({ cookies, request }) => {
        const data = parseFormData(await request.formData());

        if (!data || !data.name) {
            return { error: "Invalid form data" };
        }

        const { username, password, name } = data;

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

        userState.set({ id: userId, name });

        throw redirect(302, "/");
    },
};
