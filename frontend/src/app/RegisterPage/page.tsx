import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<"USER" | "ADMIN">("USER"); // default USER
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !name || !surname || !password) {
            alert("Vyplň všechny povinné údaje!");
            return;
        }

        try {
            await axios.post("auth/register", { email, name, surname, password, role });
            alert("Registrace úspěšná! Přihlaš se.");
            navigate("/login"); // přesměrování na login
        } catch (err: any) {
            console.error(err);
            alert("Chyba při registraci: " + (err.response?.data || err.message));
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: "50px auto", fontFamily: "Arial, sans-serif" }}>
            <h1>Registrace</h1>
            <form onSubmit={handleRegister} style={{ display: "grid", gap: 10 }}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Jméno"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Příjmení"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Heslo"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <select value={role} onChange={(e) => setRole(e.target.value as "USER" | "ADMIN")}>
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                </select>
                <button type="submit">Registrovat</button>
            </form>
            <p style={{ marginTop: 10 }}>
                Už máš účet? <Link to="/login">Přihlas se</Link>
            </p>
        </div>
    );
}
