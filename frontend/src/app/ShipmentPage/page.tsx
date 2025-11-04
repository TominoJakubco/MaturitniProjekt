import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface Shipment {
    id?: number;
    name: string;
    containerId: number;
    weightTotal: number;
    unusedSpace: number;
}

export default function ShipmentPage() {
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [newShipment, setNewShipment] = useState<Shipment>({
        name: "",
        containerId: 0,
        weightTotal: 0,
        unusedSpace: 0,
    });
    const [editShipment, setEditShipment] = useState<Shipment | null>(null);

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

    const handleAddShipment = async () => {
        if (!newShipment.name || !newShipment.containerId) {
            alert("Vyplň všechny povinné údaje!");
            return;
        }
        try {
            const res = await fetch("/api/shipments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newShipment),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setNewShipment({ name: "", containerId: 0, weightTotal: 0, unusedSpace: 0 });
            await fetchShipments();
            alert("Zásilka přidána!");
        } catch (err) {
            console.error(err);
            alert("Chyba při přidávání zásilky");
        }
    };

    const handleDeleteShipment = async (id: number) => {
        if (!window.confirm("Opravdu chceš smazat tuto zásilku?")) return;
        try {
            const res = await fetch(`/api/shipments/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            await fetchShipments();
            alert("Zásilka smazána!");
        } catch (err) {
            console.error(err);
            alert("Chyba při mazání zásilky");
        }
    };

    const handleUpdateShipment = async () => {
        if (!editShipment?.id) return;
        try {
            const res = await fetch(`/api/shipments/${editShipment.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editShipment),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setEditShipment(null);
            await fetchShipments();
            alert("Zásilka aktualizována!");
        } catch (err) {
            console.error(err);
            alert("Chyba při aktualizaci zásilky");
        }
    };

    return (
        <div style={{ maxWidth: 1000, margin: "50px auto", fontFamily: "Arial, sans-serif" }}>
            <Link to="/" style={{ display: "inline-block", marginBottom: "20px", color: "#FF9800" }}>
                ⬅️ Zpět na menu
            </Link>

            <h1 style={{ textAlign: "center" }}>Správa zásilek</h1>

            {loading && <p>Načítám zásilky...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            <h2>Přidat zásilku</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
                <input
                    placeholder="Název"
                    value={newShipment.name}
                    onChange={(e) => setNewShipment({ ...newShipment, name: e.target.value })}
                />
                <input
                    placeholder="ID kontejneru"
                    type="number"
                    value={newShipment.containerId || ""}
                    onChange={(e) => setNewShipment({ ...newShipment, containerId: Number(e.target.value) })}
                />
                <input
                    placeholder="Celková váha"
                    type="number"
                    value={newShipment.weightTotal || ""}
                    onChange={(e) => setNewShipment({ ...newShipment, weightTotal: Number(e.target.value) })}
                />
                <input
                    placeholder="Nepoužité místo"
                    type="number"
                    value={newShipment.unusedSpace || ""}
                    onChange={(e) => setNewShipment({ ...newShipment, unusedSpace: Number(e.target.value) })}
                />
            </div>
            <button type="button" style={{ marginTop: 10 }} onClick={handleAddShipment}>
                Přidat
            </button>

            <hr style={{ margin: "30px 0" }} />

            {!loading && !error && (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                    <tr style={{ background: "#f2f2f2" }}>
                        <th style={{ border: "1px solid #ddd", padding: "8px" }}>ID</th>
                        <th style={{ border: "1px solid #ddd", padding: "8px" }}>Název</th>
                        <th style={{ border: "1px solid #ddd", padding: "8px" }}>ID kontejneru</th>
                        <th style={{ border: "1px solid #ddd", padding: "8px" }}>Celková váha</th>
                        <th style={{ border: "1px solid #ddd", padding: "8px" }}>Nepoužité místo</th>
                        <th style={{ border: "1px solid #ddd", padding: "8px" }}>Akce</th>
                    </tr>
                    </thead>
                    <tbody>
                    {shipments.map((shipment) => (
                        <tr key={shipment.id}>
                            <td style={{ border: "1px solid #ddd", padding: "8px" }}>{shipment.id}</td>
                            <td style={{ border: "1px solid #ddd", padding: "8px" }}>{shipment.name}</td>
                            <td style={{ border: "1px solid #ddd", padding: "8px" }}>{shipment.containerId}</td>
                            <td style={{ border: "1px solid #ddd", padding: "8px" }}>{shipment.weightTotal}</td>
                            <td style={{ border: "1px solid #ddd", padding: "8px" }}>{shipment.unusedSpace}</td>
                            <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                                <button type="button" onClick={() => setEditShipment(shipment)}>
                                    ✏️ Upravit
                                </button>
                                <button
                                    type="button"
                                    style={{ marginLeft: 8, color: "red" }}
                                    onClick={() => handleDeleteShipment(shipment.id!)}
                                >
                                    🗑️ Smazat
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}

            {editShipment && (
                <div style={{ marginTop: 30, border: "1px solid #ccc", padding: 20 }}>
                    <h3>Upravit zásilku</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
                        <input
                            placeholder="Název"
                            value={editShipment.name}
                            onChange={(e) => setEditShipment({ ...editShipment, name: e.target.value })}
                        />
                        <input
                            placeholder="ID kontejneru"
                            type="number"
                            value={editShipment.containerId}
                            onChange={(e) => setEditShipment({ ...editShipment, containerId: Number(e.target.value) })}
                        />
                        <input
                            placeholder="Celková váha"
                            type="number"
                            value={editShipment.weightTotal}
                            onChange={(e) => setEditShipment({ ...editShipment, weightTotal: Number(e.target.value) })}
                        />
                        <input
                            placeholder="Nepoužité místo"
                            type="number"
                            value={editShipment.unusedSpace}
                            onChange={(e) => setEditShipment({ ...editShipment, unusedSpace: Number(e.target.value) })}
                        />
                    </div>
                    <div style={{ marginTop: 10 }}>
                        <button type="button" onClick={handleUpdateShipment}>
                            💾 Uložit změny
                        </button>
                        <button type="button" style={{ marginLeft: 10 }} onClick={() => setEditShipment(null)}>
                            ❌ Zrušit
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
