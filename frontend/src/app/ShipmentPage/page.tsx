import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

interface Shipment {
    id?: number;
    name: string;
    description?: string;
    containers: any[]; // budeme jen počítat délku
}

export default function ShipmentPage() {
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const fetchShipments = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/shipments");
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();
            setShipments(data);
        } catch (err) {
            console.error("Chyba při načítání zásilek:", err);
            setError("Nepodařilo se načíst zásilky.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShipments();
    }, []);

    return (
        <div style={{ maxWidth: 1000, margin: "50px auto", fontFamily: "Arial, sans-serif" }}>
            <Link to="/" style={{ display: "inline-block", marginBottom: "20px", color: "#FF9800" }}>
                ⬅️ Zpět na menu
            </Link>

            <h1 style={{ textAlign: "center" }}>Správa zásilek</h1>
            {loading && <p>Načítám zásilky...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {!loading && !error && (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                    <tr style={{ background: "#f2f2f2" }}>
                        <th style={{ border: "1px solid #ddd", padding: "8px" }}>ID</th>
                        <th style={{ border: "1px solid #ddd", padding: "8px" }}>Název</th>
                        <th style={{ border: "1px solid #ddd", padding: "8px" }}>Popis</th>
                        <th style={{ border: "1px solid #ddd", padding: "8px" }}>Počet kontejnerů</th>
                        <th style={{ border: "1px solid #ddd", padding: "8px" }}>Akce</th>
                    </tr>
                    </thead>
                    <tbody>
                    {shipments.map((shipment) => (
                        <tr key={shipment.id}>
                            <td style={{ border: "1px solid #ddd", padding: "8px" }}>{shipment.id}</td>
                            <td style={{ border: "1px solid #ddd", padding: "8px" }}>{shipment.name}</td>
                            <td style={{ border: "1px solid #ddd", padding: "8px" }}>{shipment.description || "-"}</td>
                            <td style={{ border: "1px solid #ddd", padding: "8px" }}>{shipment.containers.length}</td>
                            <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                                <button
                                    type="button"
                                    style={{ marginRight: 8 }}
                                    onClick={() => navigate(`/shipments/${shipment.id}`)}
                                >
                                    🔍 Detail
                                </button>
                                <button
                                    type="button"
                                    style={{ marginLeft: 8, color: "red" }}
                                    onClick={() => alert("Smazání zatím neimplementováno")}
                                >
                                    🗑️ Smazat
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
