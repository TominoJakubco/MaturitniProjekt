import { Link } from "react-router-dom";

export default function MainMenu() {
    return (
        <div
            style={{
                maxWidth: 800,
                margin: "100px auto",
                textAlign: "center",
                fontFamily: "Arial, sans-serif",
            }}
        >
            <h1 style={{ fontSize: "2.5rem", marginBottom: "50px" }}>Hlavní menu</h1>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "20px",
                    maxWidth: "600px",
                    margin: "0 auto",
                }}
            >
                <Link
                    to="/users"
                    style={linkStyle("#4CAF50")}
                >
                    👤 Uživatelé
                </Link>
                <Link
                    to="/boxes"
                    style={linkStyle("#2196F3")}
                >
                    📦 Boxy
                </Link>
                <Link
                    to="/containers"
                    style={linkStyle("#FF9800")}
                >
                    🚢 Kontejnery
                </Link>
                <Link
                    to="/shipments"
                    style={linkStyle("#9C27B0")}
                >
                    📋 Zásilky
                </Link>

                {/* 🧩 NEW: Login Button */}
                <Link
                    to="/login"
                    style={linkStyle("#607D8B")}
                >
                    🔐 Přihlášení
                </Link>
                <Link
                    to="/create-shipment"
                    style={linkStyle("#E91E63")}
                >
                    Create Shipment
                </Link>
            </div>
        </div>
    );
}

// 🎨 Reusable inline style function
function linkStyle(color: string): React.CSSProperties {
    return {
        padding: "40px",
        fontSize: "1.2rem",
        cursor: "pointer",
        backgroundColor: color,
        color: "white",
        border: "none",
        borderRadius: "8px",
        textDecoration: "none",
        display: "block",
        transition: "background-color 0.3s",
    };
}
