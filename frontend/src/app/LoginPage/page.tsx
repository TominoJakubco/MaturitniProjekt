import React, { useState } from "react";
import axios from "axios";
import {Link} from "react-router-dom";

function LoginPage() {
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

    return (
        <div style={{ maxWidth: 400, margin: "50px auto", fontFamily: "Arial, sans-serif" }}>
            <form onSubmit={handleLogin}>
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}/>
                <input type="password" placeholder="Password" value={password}
                       onChange={(e) => setPassword(e.target.value)}/>
                <button type="submit">Login</button>
            </form>
            <p style={{marginTop: 10}}>
                Nemáš účet? <Link to="/register">Zaregistruj se</Link>
            </p>
        </div>
    );
}

export default LoginPage;
