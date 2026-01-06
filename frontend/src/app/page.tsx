import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuthGuard } from "../hooks/useAuthGuard";
import { isAdminFromToken } from "../utils/jwtHelpers";

export default function MainMenu() {
    useAuthGuard(); // auto-logout when token expires

    const isLoggedIn = Boolean(localStorage.getItem("token"));
    const isAdmin = isAdminFromToken();

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
                display: "flex",
                flexDirection: "column",
                fontFamily: "'Helvetica Neue', -apple-system, BlinkMacSystemFont, sans-serif",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Animated background elements */}
            <div style={{ position: "absolute", top: "10%", right: "15%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(59, 130, 246, 0.15), transparent 70%)", borderRadius: "50%", filter: "blur(60px)", animation: "float 8s ease-in-out infinite" }} />
            <div style={{ position: "absolute", bottom: "15%", left: "10%", width: "350px", height: "350px", background: "radial-gradient(circle, rgba(14, 165, 233, 0.12), transparent 70%)", borderRadius: "50%", filter: "blur(60px)", animation: "float 10s ease-in-out infinite reverse" }} />

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) translateX(0px); }
                    50% { transform: translateY(-30px) translateX(20px); }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .menu-card { animation: scaleIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .header-title { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .header-subtitle { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards; opacity: 0; }
                .nav-grid { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards; opacity: 0; }
            `}</style>

            <Navbar breadcrumb={[{ label: "Home" }]} />

            <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", padding: "40px 20px", position: "relative", zIndex: 1 }}>
                <div
                    className="menu-card"
                    style={{ width: "100%", maxWidth: "920px", backgroundColor: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(20px)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "24px", boxShadow: "0 24px 60px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)", padding: "64px 48px", textAlign: "center" }}
                >
                    <div style={{ marginBottom: "56px" }}>
                        <h1 className="header-title" style={{ fontSize: "3.5rem", fontWeight: "700", color: "#ffffff", marginBottom: "16px", letterSpacing: "-0.03em", lineHeight: "1.1" }}>
                            Řízení zásilek
                        </h1>
                        <p className="header-subtitle" style={{ fontSize: "1.15rem", color: "rgba(255, 255, 255, 0.6)", fontWeight: "400", letterSpacing: "0.01em" }}>
                            Komplexní správa boxů, kontejnerů a shipmentů
                        </p>
                    </div>

                    <nav className="nav-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", maxWidth: "800px", margin: "0 auto" }}>
                        <MenuButton to="/boxes"           label="Boxy"          icon="📦" description="Správa boxů" />
                        <MenuButton to="/containers"      label="Kontejnery"    icon="🚛" description="Přehled kontejnerů" />
                        <MenuButton to="/shipments"       label="Shipmenty"     icon="🌍" description="Sledování zásilek" />
                        <MenuButton to="/create-shipment" label="Nový Shipment" icon="➕" description="Vytvořit zásilku" highlight />

                        {/* Admin button — only visible to admins */}
                        {isAdmin && (
                            <MenuButton to="/admin" label="Admin Panel" icon="🛡️" description="Správa systému" danger />
                        )}

                        {!isLoggedIn && (
                            <MenuButton to="/login" label="Přihlášení" icon="🔐" description="Přístup k systému" />
                        )}
                    </nav>
                </div>
            </div>

            <div style={{ position: "absolute", bottom: "32px", left: "50%", transform: "translateX(-50%)", color: "rgba(255, 255, 255, 0.3)", fontSize: "0.85rem", letterSpacing: "0.05em", zIndex: 1 }}>
                Logistics Management System
            </div>
        </div>
    );
}

function MenuButton({
                        to, label, icon, description, highlight = false, danger = false,
                    }: {
    to: string; label: string; icon: string; description: string; highlight?: boolean; danger?: boolean;
}) {
    const base = danger
        ? { bg: "linear-gradient(135deg, rgba(239,68,68,0.12), rgba(220,38,38,0.07))", border: "1px solid rgba(239,68,68,0.25)", bgHover: "linear-gradient(135deg, rgba(239,68,68,0.22), rgba(220,38,38,0.16))", borderHover: "rgba(239,68,68,0.45)" }
        : highlight
            ? { bg: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(37,99,235,0.1))", border: "1px solid rgba(59,130,246,0.3)", bgHover: "linear-gradient(135deg, rgba(59,130,246,0.25), rgba(37,99,235,0.2))", borderHover: "rgba(59,130,246,0.5)" }
            : { bg: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", bgHover: "rgba(255,255,255,0.08)", borderHover: "rgba(255,255,255,0.15)" };

    return (
        <Link to={to}
              style={{ padding: "32px 24px", background: base.bg, border: base.border, color: "#fff", textDecoration: "none", borderRadius: "16px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", backdropFilter: "blur(10px)", position: "relative", overflow: "hidden" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = base.bgHover; e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.3)"; e.currentTarget.style.borderColor = base.borderHover; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = base.bg; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = base.border.replace("1px solid ", ""); }}
        >
            <div style={{ fontSize: "2.5rem", marginBottom: "4px", filter: "grayscale(20%)" }}>{icon}</div>
            <div style={{ fontSize: "1.25rem", fontWeight: "600", letterSpacing: "-0.01em" }}>{label}</div>
            <div style={{ fontSize: "0.875rem", color: danger ? "rgba(252,165,165,0.6)" : "rgba(255,255,255,0.5)", fontWeight: "400" }}>{description}</div>
        </Link>
    );
}