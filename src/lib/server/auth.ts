// Much of the code below has been taken from https://lucia-auth.com
import sql from "./db";

interface Session {
    id: string;
    secretHash: Uint8Array;
    createdAt: Date;
}

interface SessionWithToken extends Session {
    token: string;
}

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

export async function createSession(): Promise<SessionWithToken> {
    console.log("Creating session");

    const now = new Date();

    const id = generateSecureRandomString();
    const secret = generateSecureRandomString();
    const secretHash = await hashSecret(secret);

    const token = `${id}.${secret}`;

    console.log(`Token: ${token}`);
    console.log(`Hashed: ${secretHash}`);

    const session: SessionWithToken = {
        id,
        secretHash,
        createdAt: now,
        token,
    };

    await sql`INSERT INTO session (id, secret_hash, created_at) VALUES (${session.id}, ${session.secretHash}, ${session.createdAt})`;

    return session;
}

async function getSession(sessionId: string): Promise<Session | null> {
    // TODO: Expire old sessions

    const result = await sql`SELECT * FROM session WHERE id = ${sessionId}`;

    if (result.length !== 1) {
        return null;
    }

    return {
        id: result[0].id,
        secretHash: result[0].secret_hash,
        createdAt: result[0].created_at,
    };
}

export async function deleteSession(sessionId: string): Promise<void> {
    await sql`DELETE FROM session WHERE id = ${sessionId}`;
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
