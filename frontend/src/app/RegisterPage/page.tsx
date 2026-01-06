import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!email || !name || !surname || !password) { setError("Vyplň všechna povinná pole"); return; }
        if (password !== confirmPassword) { setError("Hesla se neshodují"); return; }
        if (password.length < 6) { setError("Heslo musí mít alespoň 6 znaků"); return; }
        setLoading(true);
        try {
            await axios.post("/auth/register", { email, name, surname, password, role: "ROLE_USER" });
            navigate("/login");
        } catch (err: any) {
            setError("Chyba při registraci: " + (err.response?.data || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            fontFamily: "'Helvetica Neue', -apple-system, BlinkMacSystemFont, sans-serif",
            position: "relative",
            overflow: "hidden",
        }}>
            <div style={{ position: "absolute", top: "15%", left: "20%", width: "350px", height: "350px", background: "radial-gradient(circle, rgba(59,130,246,0.13), transparent 70%)", borderRadius: "50%", filter: "blur(80px)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: "15%", right: "15%", width: "280px", height: "280px", background: "radial-gradient(circle, rgba(14,165,233,0.09), transparent 70%)", borderRadius: "50%", filter: "blur(80px)", pointerEvents: "none" }} />

            <style>{`
                *, *::before, *::after { box-sizing: border-box; }
                html, body { background: #0f172a !important; margin: 0; padding: 0; }
                @keyframes scaleIn { from { opacity: 0; transform: scale(0.96) translateY(14px); } to { opacity: 1; transform: scale(1) translateY(0); } }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus {
                    -webkit-box-shadow: 0 0 0 100px rgba(20, 30, 50, 0.98) inset !important;
                    -webkit-text-fill-color: rgba(255,255,255,0.9) !important;
                    caret-color: white;
                }
                /* Collapse name row to single column on very small screens */
                @media (max-width: 380px) {
                    .reg-name-row { flex-direction: column !important; }
                }
            `}</style>

            <div style={{
                width: "100%",
                maxWidth: "440px",
                background: "rgba(255,255,255,0.03)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                borderRadius: "20px",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 32px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
                padding: "44px 36px",
                animation: "scaleIn 0.45s cubic-bezier(0.16,1,0.3,1) forwards",
                position: "relative",
                zIndex: 1,
            }}>
                {/* Logo */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "32px", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z" fill="url(#lg-r)" />
                            <defs>
                                <linearGradient id="lg-r" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#3b82f6" /><stop offset="1" stopColor="#2563eb" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <span style={{ fontWeight: 700, fontSize: "0.9375rem", color: "#ffffff", letterSpacing: "-0.01em" }}>Logistics Platform</span>
                    </div>
                    <div style={{ textAlign: "center" }}>
                        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.03em", margin: "0 0 4px" }}>Registrace</h1>
                        <p style={{ color: "rgba(255,255,255,0.38)", fontSize: "0.8125rem", margin: 0 }}>Vytvořte si nový účet</p>
                    </div>
                </div>

                {error && (
                    <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", color: "#fca5a5", fontSize: "0.8rem", marginBottom: "16px", display: "flex", alignItems: "center", gap: "7px" }}>
                        <span>⚠️</span>{error}
                    </div>
                )}

                <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "14px", width: "100%" }}>
                    {/* Jméno + Příjmení — two columns, each cell clips its child */}
                    <div className="reg-name-row" style={{ display: "flex", gap: "12px", width: "100%" }}>
                        <div style={{ flex: "1 1 0", minWidth: 0 }}>
                            <Field label="Jméno">
                                <input type="text" placeholder="Jan" value={name} onChange={(e) => setName(e.target.value)} style={inp} onFocus={foc} onBlur={blu} />
                            </Field>
                        </div>
                        <div style={{ flex: "1 1 0", minWidth: 0 }}>
                            <Field label="Příjmení">
                                <input type="text" placeholder="Novák" value={surname} onChange={(e) => setSurname(e.target.value)} style={inp} onFocus={foc} onBlur={blu} />
                            </Field>
                        </div>
                    </div>

                    <Field label="Email">
                        <input type="email" placeholder="vas@email.cz" value={email} onChange={(e) => setEmail(e.target.value)} style={inp} onFocus={foc} onBlur={blu} />
                    </Field>

                    <Field label="Heslo">
                        <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} style={inp} onFocus={foc} onBlur={blu} />
                    </Field>

                    <Field label="Potvrďte heslo">
                        <input type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={inp} onFocus={foc} onBlur={blu} />
                    </Field>

                    <button type="submit" disabled={loading} style={{
                        marginTop: "4px", padding: "13px", width: "100%",
                        background: loading ? "rgba(59,130,246,0.18)" : "linear-gradient(135deg, #3b82f6, #2563eb)",
                        color: "#fff", border: "none", borderRadius: "9px",
                        cursor: loading ? "not-allowed" : "pointer",
                        fontSize: "0.875rem", fontWeight: 700, letterSpacing: "0.01em",
                        transition: "all 0.25s", boxShadow: loading ? "none" : "0 4px 14px rgba(59,130,246,0.35)",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                        fontFamily: "inherit",
                    }}
                            onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 22px rgba(59,130,246,0.45)"; }}}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = loading ? "none" : "0 4px 14px rgba(59,130,246,0.35)"; }}
                    >
                        {loading ? (<><Spinner />Registruji...</>) : "Zaregistrovat se"}
                    </button>
                </form>

                <p style={{ textAlign: "center", marginTop: "24px", fontSize: "0.8rem", color: "rgba(255,255,255,0.35)" }}>
                    Už máš účet?{" "}
                    <Link to="/login" style={{ color: "#93c5fd", fontWeight: 600, textDecoration: "none" }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#60a5fa")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#93c5fd")}>
                        Přihlas se
                    </Link>
                </p>
            </div>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%", minWidth: 0 }}>
            <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "rgba(255,255,255,0.52)", letterSpacing: "0.02em" }}>{label}</label>
            {children}
        </div>
    );
}

function Spinner() {
    return <div style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.25)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.7s linear infinite", flexShrink: 0 }} />;
}

const inp: React.CSSProperties = {
    padding: "12px 14px", borderRadius: "8px",
    border: "1.5px solid rgba(255,255,255,0.1)",
    fontSize: "0.875rem", outline: "none",
    background: "rgba(255,255,255,0.05)",
    color: "rgba(255,255,255,0.9)",
    backdropFilter: "blur(10px)",
    transition: "all 0.2s",
    fontFamily: "'Helvetica Neue', -apple-system, sans-serif",
    /* CRITICAL: width+minWidth prevent grid children from overflowing */
    width: "100%",
    minWidth: 0,
    display: "block",
};

function foc(e: React.FocusEvent<HTMLInputElement>) {
    e.currentTarget.style.borderColor = "rgba(59,130,246,0.55)";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.12)";
    e.currentTarget.style.background = "rgba(255,255,255,0.08)";
}
function blu(e: React.FocusEvent<HTMLInputElement>) {
    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
    e.currentTarget.style.boxShadow = "none";
    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
}