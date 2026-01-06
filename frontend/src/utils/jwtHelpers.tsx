/**
 * Reads the JWT stored in localStorage and returns its decoded payload,
 * or null if missing / malformed.
 */
export function getTokenPayload(): Record<string, any> | null {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
        return JSON.parse(atob(token.split(".")[1]));
    } catch {
        return null;
    }
}

/** Returns the email claim (sub) from the current token. */
export function getEmailFromToken(): string | null {
    return getTokenPayload()?.sub ?? null;
}

/** Returns true when the current user has the ROLE_ADMIN authority. */
export function isAdminFromToken(): boolean {
    const payload = getTokenPayload();
    if (!payload) return false;

    // Spring Security puts authorities as an array of { authority: "ROLE_ADMIN" }
    // or sometimes as a plain string array — handle both shapes.
    const authorities: any[] = payload.authorities ?? payload.roles ?? [];
    return authorities.some((a) =>
        (typeof a === "string" ? a : a?.authority) === "ROLE_ADMIN"
    );
}