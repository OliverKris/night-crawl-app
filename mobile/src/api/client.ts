const API_BASE_URL = "http://localhost:3000";

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
    authToken = token;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : []),
            ...options.headers,
        },
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? `Request failed: ${res.status}`);
    }

    return res.json();
}

export const api = {
    signUp: (email: string, password: string, displayName: string) =>
        request<{ accessToken: string }>("/auth/signup", {
            method: "POST",
            body: JSON.stringify({ email, password, displayName }),
        }),

    login: (email: string, password: string) =>
        request<{ accessToken: string }>("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        }),

    me: () => request<{ userId: string; email: string }>("/auth/me"),
};
