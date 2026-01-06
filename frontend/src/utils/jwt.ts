import axiosInstance from "../app/axiosInstance";

type User = {
    id: number;
    email: string;
    name: string;
    surname: string;
};

export function getEmailFromToken(): string | null {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
        const payload = token.split(".")[1];
        const decoded = JSON.parse(atob(payload));
        return decoded.sub ?? null; // sub = email
    } catch {
        return null;
    }
}

export async function getUserNameFromToken(): Promise<string | null> {
    try {
        const res = await axiosInstance.get<User>("/api/users/me");
        return res.data.name;
    } catch (err) {
        console.error("Chyba při načítání uživatele:", err);
        return null;
    }
}

