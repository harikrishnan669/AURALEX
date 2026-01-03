export async function hashPassword(password: string) {
    const enc = new TextEncoder();
    const data = enc.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function getAllUsers(): any[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem("users");
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function saveAllUsers(users: any[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem("users", JSON.stringify(users));
}

export function setAuth(user: any, rememberIdentifier?: string) {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("isAuthenticated", "true");
    if (rememberIdentifier) {
        localStorage.setItem("rememberEmail", rememberIdentifier);
    }
}

export function clearAuth() {
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");
}
