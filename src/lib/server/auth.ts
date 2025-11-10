// Much of the code below has been taken from https://lucia-auth.com
import type { Cookies } from "@sveltejs/kit";
import sql from "./db";

interface Session {
    id: string;
    secretHash: Uint8Array;
    userId: string;
    createdAt: Date;
}

interface SessionWithToken extends Session {
    token: string;
}

export const SESSION_COOKIE_NAME = "sessionToken";

function generateSecureRandomString(): string {
    // Alphabet without confusing/similar chars
    const alphabet = "abcdefghijkmnpqrstuvwxyz23456789";

    const bytes = new Uint8Array(24);
    crypto.getRandomValues(bytes);

    let id = "";
    for (let i = 0; i < bytes.length; i++) {
        id += alphabet[bytes[i] >> 3];
    }

    return id;
}

function constantTimeCompare(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) return false;

    let diff = 0;

    for (let i = 0; i < a.length; i++) {
        diff |= a[i] ^ b[i];
    }

    return diff === 0;
}

async function hashSecret(secret: string): Promise<Uint8Array> {
    const secretBytes = new TextEncoder().encode(secret);
    const secretHashBuffer = await crypto.subtle.digest("SHA-256", secretBytes);
    return new Uint8Array(secretHashBuffer);
}

export async function createSession(userId: string): Promise<SessionWithToken> {
    console.log("Creating new session");

    const now = new Date();

    const id = generateSecureRandomString();
    const secret = generateSecureRandomString();
    const secretHash = await hashSecret(secret);

    const token = `${id}.${secret}`;

    const session: SessionWithToken = {
        id,
        secretHash,
        userId,
        createdAt: now,
        token,
    };

    await sql`INSERT INTO sessions VALUES (${session.id}, ${session.secretHash}, ${session.userId}, ${session.createdAt})`;

    return session;
}

async function getSession(sessionId: string): Promise<Session | null> {
    // TODO: Expire old sessions

    const result = await sql`SELECT * FROM sessions WHERE id = ${sessionId}`;

    if (result.length !== 1) {
        return null;
    }

    return {
        id: result[0].id,
        secretHash: result[0].secret_hash,
        userId: result[0].user_id,
        createdAt: result[0].created_at,
    };
}

export async function deleteSession(sessionId: string): Promise<void> {
    await sql`DELETE FROM sessions WHERE id = ${sessionId}`;
}

export async function validateSessionToken(
    token: string
): Promise<Session | null> {
    const [id, secret] = token.split(".");
    if (!id || !secret) return null;

    const session = await getSession(id);

    if (!session) return null;

    const secretHash = await hashSecret(secret);

    if (!constantTimeCompare(secretHash, session.secretHash)) {
        return null;
    }

    return session;
}

export async function isValidSession(cookies: Cookies): Promise<boolean> {
    const token = cookies.get(SESSION_COOKIE_NAME);

    if (!token) {
        return false;
    }

    return (await validateSessionToken(token)) != null;
}

/**
 * Authorizes that the session in the cookies belongs to the given user ID.
 * That is, make sure a user can only perform actions on their own behalf.
 *
 * @param cookies SvelteKit cookies object
 * @param userId The user ID to authorize against
 * @returns True if the session belongs to the given user ID, false otherwise. Null if no valid session exists.
 */
export async function authorizeUserAction(
    cookies: Cookies,
    userId: string
): Promise<boolean | null> {
    const token = cookies.get(SESSION_COOKIE_NAME);

    if (!token) {
        return null;
    }

    const session = await validateSessionToken(token);

    if (!session) {
        return null;
    }

    return session.userId == userId;
}
