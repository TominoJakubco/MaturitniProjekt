import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getEmailFromToken, getUserNameFromToken } from "../utils/jwt";

interface BreadcrumbItem {
    label: string;
    path?: string;
}

interface NavbarProps {
    breadcrumb?: BreadcrumbItem[];
}

export default function Navbar({ breadcrumb = [] }: NavbarProps) {
    const [name, setUserName] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    const email = getEmailFromToken();
    const isLoggedIn = !!email;

    useEffect(() => {
        if (!isLoggedIn) return;
        getUserNameFromToken().then(setUserName).catch(() => setUserName(null));
    }, [isLoggedIn]);

    const logout = () => {
        localStorage.removeItem("token");
        setUserName(null);
        navigate("/login");
    };

    // Close dropdown on outside click
    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (!(e.target as HTMLElement).closest("[data-navbar-user]")) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    return (
        <>
            <style>{`
                html, body {
                    background: #0f172a !important;
                    margin: 0;
                    padding: 0;
                }
                @keyframes dropdownIn {
                    from { opacity: 0; transform: translateY(-6px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>

            <div style={{
                width: "100%",
                backgroundColor: "rgba(10, 18, 35, 0.97)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                position: "sticky",
                top: 0,
                zIndex: 1000,
                fontFamily: "'Helvetica Neue', -apple-system, BlinkMacSystemFont, sans-serif",
            }}>
                <div style={{
                    maxWidth: "1400px",
                    margin: "0 auto",
                    height: "64px",
                    display: "grid",
                    gridTemplateColumns: "1fr auto 1fr",
                    alignItems: "center",
                    padding: "0 24px",
                    gap: "16px",
                }}>

                    {/* LEFT — Logo */}
                    <div
                        style={{ fontWeight: 700, fontSize: "1rem", cursor: "pointer", color: "#ffffff", display: "flex", alignItems: "center", gap: "10px", letterSpacing: "-0.01em", transition: "opacity 0.2s", userSelect: "none" }}
                        onClick={() => navigate("/")}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                            <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z" fill="url(#nav-lg)" />
                            <defs>
                                <linearGradient id="nav-lg" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#3b82f6" /><stop offset="1" stopColor="#2563eb" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <span>EffiPack</span>
                    </div>

                    {/* CENTER — Breadcrumb */}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8125rem", whiteSpace: "nowrap" }}>
                        {breadcrumb.map((item, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                {item.path ? (
                                    <span
                                        style={{ cursor: "pointer", color: "rgba(255,255,255,0.45)", fontWeight: 500, transition: "color 0.2s" }}
                                        onClick={() => navigate(item.path!)}
                                        onMouseEnter={(e) => (e.currentTarget.style.color = "#3b82f6")}
                                        onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
                                    >
                                        {item.label}
                                    </span>
                                ) : (
                                    <span style={{ fontWeight: 600, color: "#ffffff" }}>{item.label}</span>
                                )}
                                {i < breadcrumb.length - 1 && (
                                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                        <path d="M6 4l4 4-4 4" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* RIGHT — User */}
                    <div style={{ position: "relative", display: "flex", justifyContent: "flex-end" }} data-navbar-user>
                        {!isLoggedIn ? (
                            <button
                                onClick={() => navigate("/login")}
                                style={{ padding: "9px 22px", background: "linear-gradient(135deg, #3b82f6, #2563eb)", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "0.8125rem", fontWeight: 600, transition: "all 0.2s", letterSpacing: "0.01em", boxShadow: "0 4px 12px rgba(59,130,246,0.3)", fontFamily: "inherit" }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 18px rgba(59,130,246,0.45)"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 12px rgba(59,130,246,0.3)"; }}
                            >
                                Přihlásit se
                            </button>
                        ) : (
                            <>
                                <div
                                    onClick={() => setOpen(!open)}
                                    style={{ position: "relative", cursor: "pointer", padding: "8px 16px 8px 44px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", fontWeight: 600, fontSize: "0.875rem", color: "#ffffff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "220px", transition: "all 0.2s", userSelect: "none" }}
                                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
                                >
                                    <div style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "24px", height: "24px", borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #2563eb)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, color: "#fff" }}>
                                        {name?.charAt(0).toUpperCase() || "U"}
                                    </div>
                                    <span>{name || "..."}</span>
                                </div>

                                {open && (
                                    <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", backgroundColor: "rgba(10,18,35,0.98)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", borderRadius: "12px", boxShadow: "0 20px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", minWidth: "200px", overflow: "hidden", animation: "dropdownIn 0.15s cubic-bezier(0.16,1,0.3,1)" }}>
                                        <div
                                            onClick={() => { navigate("/profile"); setOpen(false); }}
                                            style={{ padding: "12px 18px", cursor: "pointer", color: "rgba(255,255,255,0.85)", fontWeight: 500, fontSize: "0.8125rem", transition: "all 0.15s", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: "10px" }}
                                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#fff"; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.85)"; }}
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                            Můj profil
                                        </div>
                                        <div
                                            onClick={logout}
                                            style={{ padding: "12px 18px", cursor: "pointer", color: "#ef4444", fontWeight: 500, fontSize: "0.8125rem", transition: "all 0.15s", display: "flex", alignItems: "center", gap: "10px" }}
                                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.08)"; e.currentTarget.style.color = "#fca5a5"; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#ef4444"; }}
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                                            Odhlásit se
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}