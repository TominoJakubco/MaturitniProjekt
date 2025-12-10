import { Link } from "react-router-dom";

export default function MainMenu() {
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
                    maxWidth: "480px",
                    backgroundColor: "#fff",
                    borderRadius: "12px",
                    boxShadow: "0 12px 32px rgba(0, 0, 0, 0.08)",
                    padding: "40px 24px",
                    textAlign: "center",
                    fontFamily: "Arial, sans-serif"
                }}
            >
                <h1 style={{ fontSize: "2rem", marginBottom: "32px", color: "#222" }}>
                    Hlavní menu
                </h1>

                <nav style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "18px"
                }}>
                    <MenuButton to="/users" color={buttonColor} label="Uživatelé" />
                    <MenuButton to="/boxes" color={buttonColor} label="Boxy" />
                    <MenuButton to="/containers" color={buttonColor} label="Kontejnery" />
                    <MenuButton to="/shipments" color={buttonColor} label="Shipmenty" />
                    <MenuButton to="/login" color={buttonColor} label="Login" />
                    <MenuButton to="/create-shipment" color={buttonColor} label="Nový Shipment" />
                </nav>
            </div>
        </div>
    );
}

function MenuButton({ to, label, color }: { to: string; label: string; color: string }) {
    return (
        <Link
            to={to}
            style={{
                padding: "16px 0",
                backgroundColor: color,
                color: "#222",
                textDecoration: "none",
                fontSize: "1.1rem",
                fontWeight: 500,
                borderRadius: "4px",
                display: "block",
                transition: "background-color 0.2s, transform 0.1s",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
            }}
            onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = "#4F82E0";
                (e.currentTarget as HTMLElement).style.color = "#fff";
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = color;
                (e.currentTarget as HTMLElement).style.color = "#222";
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            }}
        >
            {label}
        </Link>
    );
}
