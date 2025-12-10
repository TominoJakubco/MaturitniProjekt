import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const res = await axios.post("/auth/login", { email, password });
            localStorage.setItem("token", res.data);
            window.location.href = "/";
        } catch (err) {
            alert("Invalid credentials");
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
                    maxWidth: "420px",
                    backgroundColor: "#fff",
                    borderRadius: "12px",
                    boxShadow: "0 12px 32px rgba(0, 0, 0, 0.08)",
                    padding: "40px 32px",
                    fontFamily: "Arial, sans-serif",
                    textAlign: "center"
                }}
            >
                <h1 style={{ fontSize: "2rem", marginBottom: "28px", color: "#222" }}>
                    Přihlášení
                </h1>

                <form
                    onSubmit={handleLogin}
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
                        type="password"
                        placeholder="Heslo"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={inputStyle}
                    />

                    <button
                        type="submit"
                        style={buttonStyle(buttonColor)}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4F82E0")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = buttonColor)}
                    >
                        Přihlásit se
                    </button>
                </form>

                <p style={{ marginTop: 10, fontSize: "0.95rem" }}>
                    Nemáš účet? <Link to="/register">Zaregistruj se</Link>
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
