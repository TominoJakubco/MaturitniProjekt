import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<"USER" | "ADMIN">("USER");
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !name || !surname || !password) {
            alert("Vyplň všechny povinné údaje!");
            return;
        }

        try {
            await axios.post("/auth/register", { email, name, surname, password, role });
            alert("Registrace úspěšná! Přihlaš se.");
            navigate("/login");
        } catch (err: any) {
            alert("Chyba při registraci: " + (err.response?.data || err.message));
        }
    };

    const buttonColor = "#B8C6DE";

    return (
        <div
            style={{
                minHeight: "100vh",
                backgroundColor: "#f7f9fc",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "20px"
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: "450px",
                    backgroundColor: "#fff",
                    borderRadius: "12px",
                    boxShadow: "0 12px 32px rgba(0, 0, 0, 0.08)",
                    padding: "40px 32px",
                    fontFamily: "Arial, sans-serif",
                    textAlign: "center"
                }}
            >
                <h1 style={{ fontSize: "2rem", marginBottom: "28px", color: "#222" }}>
                    Registrace
                </h1>

                <form
                    onSubmit={handleRegister}
                    style={{ display: "grid", gap: "14px", marginBottom: "10px" }}
                >
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={inputStyle}
                    />

                    <input
                        type="text"
                        placeholder="Jméno"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={inputStyle}
                    />

                    <input
                        type="text"
                        placeholder="Příjmení"
                        value={surname}
                        onChange={(e) => setSurname(e.target.value)}
                        style={inputStyle}
                    />

                    <input
                        type="password"
                        placeholder="Heslo"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={inputStyle}
                    />

                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as "USER" | "ADMIN")}
                        style={{ ...inputStyle, cursor: "pointer" }}
                    >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                    </select>

                    <button
                        type="submit"
                        style={buttonStyle(buttonColor)}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4F82E0")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = buttonColor)}
                    >
                        Registrovat
                    </button>
                </form>

                <p style={{ marginTop: 10, fontSize: "0.95rem" }}>
                    Už máš účet? <Link to="/login">Přihlas se</Link>
                </p>
            </div>
        </div>
    );
}

const inputStyle: React.CSSProperties = {
    padding: "14px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "1rem",
    background: "white",
};

const buttonStyle = (color: string): React.CSSProperties => ({
    padding: "14px",
    fontSize: "1.1rem",
    fontWeight: 500,
    backgroundColor: color,
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.2s, transform 0.1s",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
});
