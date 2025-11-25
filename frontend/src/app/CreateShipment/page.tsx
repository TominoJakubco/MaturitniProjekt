import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../axiosInstance";

interface Box {
    id: number;
    name: string;
    length: number;
    width: number;
    height: number;
    weight: number;
    amount: number;
}

interface Container {
    id?: number;
    name: string;
    length: number;
    width: number;
    height: number;
    volume: number;
    maxWeight: number;
}

export default function CreateShipment() {
    const [shipmentName, setShipmentName] = useState("");
    const [boxes, setBoxes] = useState<Box[]>([]);
    const [containers, setContainers] = useState<Container[]>([]);
    const [selectedBoxes, setSelectedBoxes] = useState<number[]>([]);
    const [selectedContainer, setSelectedContainer] = useState<Container | null>(null);

    const [createdShipmentId, setCreatedShipmentId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const handleApiError = useCallback((error: any) => {
        if (error.response?.status === 401) {
            alert("Nejste přihlášeni");
        } else if (error.response?.status === 403) {
            alert("Nemáte dostatečná oprávnění");
        } else {
            const message = error.response?.data?.message || error.message || "Neznámá chyba";
            alert("Došlo k chybě: " + message);
        }
    }, []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const [boxRes, containerRes] = await Promise.all([
                axiosInstance.get<Box[]>("/api/boxes"),
                axiosInstance.get<Container[]>("/api/containers"),
            ]);
            setBoxes(boxRes.data);
            setContainers(containerRes.data);
        } catch (err: any) {
            console.error("Fetch error:", err);
            setError("Nepodařilo se načíst boxy nebo kontejnery.");
            handleApiError(err);
        } finally {
            setLoading(false);
        }
    }, [handleApiError]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const toggleBoxSelection = (id: number) => {
        setSelectedBoxes((prev) =>
            prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
        );
    };

    const handleCreateShipment = async () => {
        if (!shipmentName.trim()) {
            alert("Zadejte název shipmentu.");
            return;
        }
        if (selectedBoxes.length === 0) {
            alert("Vyber alespoň 1 box.");
            return;
        }
        if (!selectedContainer || !selectedContainer.id) {
            alert("Vyber kontejner.");
            return;
        }

        try {
            const res = await axiosInstance.post("/api/shipments", {
                shipmentName,
                boxes: selectedBoxes,
                containerTypeId: selectedContainer.id,
            });

            let shipmentId: number | null = null;
            if (res.data?.id) shipmentId = res.data.id;
            else if (res.data?.shipmentId) shipmentId = res.data.shipmentId;
            else if (res.data?.shipment?.id) shipmentId = res.data.shipment.id;
            else if (typeof res.data === "number") shipmentId = res.data;
            else if (res.data?.data?.id) shipmentId = res.data.data.id;

            if (shipmentId) {
                setCreatedShipmentId(shipmentId);
            } else {
                console.error("Could not find ID in response:", res.data);
                alert("Shipment pravděpodobně vytvořen, ale nemůžu najít ID. Zkontroluj konzoli.");
            }
        } catch (err: any) {
            console.error("Create shipment error:", err);
            handleApiError(err);
        }
    };

    const handleResetForm = () => {
        setCreatedShipmentId(null);
        setShipmentName("");
        setSelectedBoxes([]);
        setSelectedContainer(null);
    };

    return (
        <div style={{ maxWidth: 1200, margin: "50px auto", fontFamily: "Arial, sans-serif", padding: "0 20px" }}>
            <Link to="/" style={{ display: "inline-block", marginBottom: "20px", color: "#FF9800", textDecoration: "none" }}>
                ⬅️ Zpět na menu
            </Link>

            <h1 style={{ textAlign: "center" }}>Vytvořit shipment</h1>

            {loading && <p style={{ textAlign: "center" }}>Načítám data...</p>}
            {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

            {createdShipmentId ? (
                <div style={{ textAlign: "center", marginTop: 30 }}>
                    <h2>Shipment úspěšně vytvořen! ID: {createdShipmentId}</h2>
                    <div style={{ marginTop: 20 }}>
                        <Link
                            to={`/shipments/${createdShipmentId}`}
                            style={{
                                display: "inline-block",
                                background: "#4CAF50",
                                color: "white",
                                padding: "12px 30px",
                                borderRadius: "6px",
                                textDecoration: "none",
                                fontWeight: "bold",
                                marginRight: 10
                            }}
                        >
                            Zobrazit shipment
                        </Link>
                        <button
                            onClick={handleResetForm}
                            style={{
                                background: "#2196F3",
                                color: "white",
                                padding: "12px 30px",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontWeight: "bold"
                            }}
                        >
                            Vytvořit další
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {/* FORM */}
                    <div style={{ marginBottom: 30 }}>
                        <label style={{ display: "block", marginBottom: 10, fontSize: "16px", fontWeight: "bold" }}>
                            Název shipmentu:
                        </label>
                        <input
                            type="text"
                            value={shipmentName}
                            onChange={(e) => setShipmentName(e.target.value)}
                            placeholder="Např. Zásilka do Prahy"
                            style={{
                                padding: "10px",
                                width: "100%",
                                maxWidth: "400px",
                                border: "1px solid #ddd",
                                borderRadius: "4px",
                                fontSize: "14px"
                            }}
                        />
                    </div>

                    {/* BOX SELECTION */}
                    <h2>Vyber boxy</h2>
                    {boxes.length === 0 && !loading ? (
                        <p style={{ color: "#666" }}>Žádné boxy k dispozici.</p>
                    ) : (
                        <div style={{ overflowX: "auto", marginBottom: 30 }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #ddd" }}>
                                <thead>
                                <tr style={{ background: "#f5f5f5" }}>
                                    <th style={{ padding: 12, borderBottom: "2px solid #ddd" }}>Vybrat</th>
                                    <th style={{ padding: 12, borderBottom: "2px solid #ddd" }}>Název</th>
                                    <th style={{ padding: 12, borderBottom: "2px solid #ddd" }}>Rozměry (L×W×H)</th>
                                    <th style={{ padding: 12, borderBottom: "2px solid #ddd" }}>Váha (kg)</th>
                                    <th style={{ padding: 12, borderBottom: "2px solid #ddd" }}>Počet ks</th>
                                </tr>
                                </thead>
                                <tbody>
                                {boxes.map((box) => (
                                    <tr
                                        key={box.id}
                                        style={{
                                            background: selectedBoxes.includes(box.id) ? "#e3f2fd" : "white",
                                            cursor: "pointer"
                                        }}
                                        onClick={() => toggleBoxSelection(box.id)}
                                    >
                                        <td style={{ padding: 12, textAlign: "center", borderBottom: "1px solid #eee" }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedBoxes.includes(box.id)}
                                                onChange={() => toggleBoxSelection(box.id)}
                                                onClick={(e) => e.stopPropagation()}
                                                style={{ cursor: "pointer" }}
                                            />
                                        </td>
                                        <td style={{ padding: 12, borderBottom: "1px solid #eee" }}>{box.name}</td>
                                        <td style={{ padding: 12, textAlign: "center", borderBottom: "1px solid #eee" }}>
                                            {box.length}×{box.width}×{box.height}
                                        </td>
                                        <td style={{ padding: 12, textAlign: "center", borderBottom: "1px solid #eee" }}>{box.weight}</td>
                                        <td style={{ padding: 12, textAlign: "center", borderBottom: "1px solid #eee" }}>{box.amount}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* CONTAINER SELECTION */}
                    <h2>Vyber kontejner</h2>
                    {containers.length === 0 && !loading ? (
                        <p style={{ color: "#666" }}>Žádné kontejnery k dispozici.</p>
                    ) : (
                        <select
                            style={{
                                padding: "10px",
                                marginBottom: 30,
                                width: "100%",
                                maxWidth: "400px",
                                border: "1px solid #ddd",
                                borderRadius: "4px",
                                fontSize: "14px",
                                cursor: "pointer"
                            }}
                            value={selectedContainer?.id || ""}
                            onChange={(e) => {
                                const sel = containers.find(c => c.id === Number(e.target.value));
                                setSelectedContainer(sel || null);
                            }}
                        >
                            <option value="">-- Vyber kontejner --</option>
                            {containers.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.name} ({c.length}×{c.width}×{c.height}) - max {c.maxWeight}kg
                                </option>
                            ))}
                        </select>
                    )}

                    <div style={{ marginTop: 30 }}>
                        <button
                            onClick={handleCreateShipment}
                            disabled={loading || !shipmentName.trim() || selectedBoxes.length === 0 || !selectedContainer}
                            style={{
                                background: (!shipmentName.trim() || selectedBoxes.length === 0 || !selectedContainer)
                                    ? "#cccccc"
                                    : "#4CAF50",
                                color: "white",
                                padding: "12px 30px",
                                border: "none",
                                borderRadius: "6px",
                                cursor: (!shipmentName.trim() || selectedBoxes.length === 0 || !selectedContainer)
                                    ? "not-allowed"
                                    : "pointer",
                                fontSize: "16px",
                                fontWeight: "bold"
                            }}
                        >
                            Vytvořit shipment
                        </button>
                    </div>

                    {selectedBoxes.length > 0 && (
                        <div style={{ marginTop: 20, padding: 15, background: "#f9f9f9", borderRadius: 4, border: "1px solid #e0e0e0" }}>
                            <strong>Vybrané boxy:</strong> {selectedBoxes.length} ks
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
