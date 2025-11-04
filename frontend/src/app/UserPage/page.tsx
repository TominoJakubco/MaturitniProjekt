import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../axiosInstance";

interface User {
    id?: number;
    email: string;
    name: string;
    surname: string;
    password: string;
    role: "USER" | "ADMIN";
}

export default function UserPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [newUser, setNewUser] = useState<User>({
        email: "",
        name: "",
        surname: "",
        password: "",
        role: "USER",
    });
    const [editUser, setEditUser] = useState<User | null>(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get<User[]>("/api/users");
            setUsers(res.data);
        } catch (err) {
            console.error("Chyba při načítání uživatelů:", err);
            setError("Nepodařilo se načíst uživatele.");
            handleApiError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleApiError = (error: any) => {
        if (error.response?.status === 401) {
            alert('Nejste přihlášeni');
            // přesměrování na login
        } else if (error.response?.status === 403) {
            alert('Nemáte dostatečná oprávnění');
        } else {
            alert('Došlo k chybě: ' + error.message);
        }
    };

    const handleAddUser = async () => {
        if (!newUser.email || !newUser.name || !newUser.surname || !newUser.password) {
            alert("Vyplň všechny povinné údaje!");
            return;
        }
        try {
            await axiosInstance.post("/api/users", newUser);
            setNewUser({ email: "", name: "", surname: "", password: "", role: "USER" });
            await fetchUsers();
            alert("Uživatel přidán!");
        } catch (err) {
            console.error(err);
            alert("Chyba při přidávání uživatele");
            handleApiError(err);
        }
    };

    const handleDeleteUser = async (id: number) => {
        if (!window.confirm("Opravdu chceš smazat tohoto uživatele?")) return;
        try {
            await axiosInstance.delete(`/api/users/${id}`);
            await fetchUsers();
            alert("Uživatel smazán!");
        } catch (err) {
            console.error(err);
            alert("Chyba při mazání uživatele");
        }
    };

    const handleUpdateUser = async () => {
        if (!editUser?.id) return;
        try {
            await axiosInstance.put(`/api/users/${editUser.id}`, editUser);
            setEditUser(null);
            await fetchUsers();
            alert("Uživatel aktualizován!");
        } catch (err) {
            console.error(err);
            handleApiError(err);
        }
    };

    return (
        <div style={{ maxWidth: 900, margin: "50px auto", fontFamily: "Arial, sans-serif" }}>
            <Link to="/" style={{ display: "inline-block", marginBottom: "20px", color: "#FF9800" }}>
                ⬅️ Zpět na menu
            </Link>

            <h1 style={{ textAlign: "center" }}>Správa uživatelů</h1>

            {loading && <p>Načítám uživatele...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            <h2>Přidat uživatele</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px" }}>
                <input
                    placeholder="Email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
                <input
                    placeholder="Jméno"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
                <input
                    placeholder="Příjmení"
                    value={newUser.surname}
                    onChange={(e) => setNewUser({ ...newUser, surname: e.target.value })}
                />
                <input
                    placeholder="Heslo"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
                <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as "USER" | "ADMIN" })}
                >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                </select>
            </div>
            <button type="button" style={{ marginTop: 10 }} onClick={handleAddUser}>
                Přidat
            </button>

            <hr style={{ margin: "30px 0" }} />

            {!loading && !error && (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                    <tr style={{ background: "#f2f2f2" }}>
                        <th style={{ border: "1px solid #ddd", padding: "8px" }}>ID</th>
                        <th style={{ border: "1px solid #ddd", padding: "8px" }}>Email</th>
                        <th style={{ border: "1px solid #ddd", padding: "8px" }}>Jméno</th>
                        <th style={{ border: "1px solid #ddd", padding: "8px" }}>Příjmení</th>
                        <th style={{ border: "1px solid #ddd", padding: "8px" }}>Role</th>
                        <th style={{ border: "1px solid #ddd", padding: "8px" }}>Akce</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.length === 0 && (
                        <tr>
                            <td
                                style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}
                                colSpan={6}
                            >
                                Žádní uživatelé
                            </td>
                        </tr>
                    )}
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td style={{ border: "1px solid #ddd", padding: "8px" }}>{user.id}</td>
                            <td style={{ border: "1px solid #ddd", padding: "8px" }}>{user.email}</td>
                            <td style={{ border: "1px solid #ddd", padding: "8px" }}>{user.name}</td>
                            <td style={{ border: "1px solid #ddd", padding: "8px" }}>{user.surname}</td>
                            <td style={{ border: "1px solid #ddd", padding: "8px" }}>{user.role}</td>
                            <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                                <button type="button" onClick={() => setEditUser(user)}>
                                    ✏️ Upravit
                                </button>
                                <button
                                    type="button"
                                    style={{ marginLeft: 8, color: "red" }}
                                    onClick={() => handleDeleteUser(user.id!)}
                                >
                                    🗑️ Smazat
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}

            {editUser && (
                <div style={{ marginTop: 30, border: "1px solid #ccc", padding: 20 }}>
                    <h3>Upravit uživatele</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px" }}>
                        <input
                            placeholder="Email"
                            value={editUser.email}
                            onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                        />
                        <input
                            placeholder="Jméno"
                            value={editUser.name}
                            onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                        />
                        <input
                            placeholder="Příjmení"
                            value={editUser.surname}
                            onChange={(e) => setEditUser({ ...editUser, surname: e.target.value })}
                        />
                        <input
                            placeholder="Heslo"
                            type="password"
                            value={editUser.password}
                            onChange={(e) => setEditUser({ ...editUser, password: e.target.value })}
                        />
                        <select
                            value={editUser.role}
                            onChange={(e) => setEditUser({ ...editUser, role: e.target.value as "USER" | "ADMIN" })}
                        >
                            <option value="USER">USER</option>
                            <option value="ADMIN">ADMIN</option>
                        </select>
                    </div>
                    <div style={{ marginTop: 10 }}>
                        <button type="button" onClick={handleUpdateUser}>
                            💾 Uložit změny
                        </button>
                        <button type="button" style={{ marginLeft: 10 }} onClick={() => setEditUser(null)}>
                            ❌ Zrušit
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
