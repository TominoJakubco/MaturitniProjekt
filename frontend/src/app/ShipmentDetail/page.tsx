import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ShipmentViewer from "../../components/ShipmentViewer";

export default function ShipmentDetail() {
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [shipmentName, setShipmentName] = useState("");

    useEffect(() => {
        if (!id) return;

        setLoading(true);
        setError("");

        fetch(`/api/shipments/${id}`)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then((data: any) => {
                setShipmentName(data.name || `Shipment ${id}`);
            })
            .catch(err => {
                console.error(err);
                setError(err.message || "Nepodařilo se načíst shipment");
            })
            .finally(() => setLoading(false));
    }, [id]);

    if (!id) return <p>ID shipmentu nebylo poskytnuto.</p>;

    return (
        <div style={{ maxWidth: 1200, margin: "50px auto", fontFamily: "Arial, sans-serif", padding: "0 20px" }}>
            <Link to="/" style={{ display: "inline-block", marginBottom: "20px", color: "#FF9800", textDecoration: "none" }}>
                ⬅️ Zpět na menu
            </Link>
            <h1 style={{ textAlign: "center" }}>{shipmentName}</h1>
            {loading && <p style={{ textAlign: "center" }}>Načítám shipment...</p>}
            {error && <p style={{ textAlign: "center", color: "red" }}>{error}</p>}
            {!loading && !error && <ShipmentViewer shipmentId={id} height={700} width="100%" />}
        </div>
    );
}
