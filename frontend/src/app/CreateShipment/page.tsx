import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../axiosInstance";
import Navbar from "../../components/Navbar";
import { InputField, Button, CreateForm } from "../../components/FormComponents";
import { Table } from "../../components/Table";
import PageLayout from "../../components/Pagelayout";

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

type PackingMethod = "skjolber" | "xflp" | "realistic";

export default function CreateShipment() {
    const [shipmentName, setShipmentName] = useState("");
    const [boxes, setBoxes] = useState<Box[]>([]);
    const [containers, setContainers] = useState<Container[]>([]);
    const [selectedBoxes, setSelectedBoxes] = useState<number[]>([]);
    const [selectedContainer, setSelectedContainer] = useState<Container | null>(null);
    const [packingMethod] = useState<PackingMethod>("xflp");
    const [createdShipmentId, setCreatedShipmentId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const handleApiError = useCallback((error: any) => {
        if (error.response?.status === 401) alert("Nejste přihlášeni");
        else if (error.response?.status === 403) alert("Nemáte dostatečná oprávnění");
        else alert(error.response?.data?.message || "Došlo k chybě");
    }, []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [boxRes, containerRes] = await Promise.all([
                axiosInstance.get<Box[]>("/api/boxes"),
                axiosInstance.get<Container[]>("/api/containers"),
            ]);
            setBoxes(boxRes.data);
            setContainers(containerRes.data);
            setError("");
        } catch (err: any) {
            setError("Nepodařilo se načíst data");
            handleApiError(err);
        } finally {
            setLoading(false);
        }
    }, [handleApiError]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const toggleBox = (id: number) => {
        setSelectedBoxes((prev) => prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]);
    };

    const handleCreateShipment = async () => {
        if (!shipmentName.trim() || !selectedContainer) return;
        try {
            const res = await axiosInstance.post(`/api/shipments/${packingMethod}`, {
                shipmentName,
                boxes: selectedBoxes,
                containerTypeId: selectedContainer.id,
            });
            const id = res.data?.id ?? res.data?.shipmentId ?? res.data?.shipment?.id ?? (typeof res.data === "number" ? res.data : null);
            if (id) setCreatedShipmentId(id);
        } catch (err: any) { handleApiError(err); }
    };

    const boxColumns = [
        { key: "name", label: "Název" },
        { key: "dimensions", label: "Rozměry", render: (b: Box) => `${b.length}×${b.width}×${b.height}` },
        { key: "weight", label: "Váha", align: "right" as const },
        { key: "amount", label: "Ks", align: "right" as const },
    ];

    const boxActions = [
        { label: "Vybrat", onClick: (b: Box) => toggleBox(b.id), variant: "primary" as const, hidden: (b: Box) => selectedBoxes.includes(b.id) },
        { label: "Odebrat", onClick: (b: Box) => toggleBox(b.id), variant: "danger" as const, hidden: (b: Box) => !selectedBoxes.includes(b.id) },
    ];

    return (
        <>
            <Navbar breadcrumb={[{ label: "Home", path: "../" }, { label: "Nový shipment" }]} />
            <PageLayout>
                {createdShipmentId ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
                        <div style={{ textAlign: "center", background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", padding: "60px 48px", boxShadow: "0 24px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)", maxWidth: "480px", width: "100%", animation: "scaleIn 0.4s cubic-bezier(0.16,1,0.3,1)" }}>
                            <div style={{ fontSize: "3rem", marginBottom: "20px" }}>✅</div>
                            <h2 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#ffffff", marginBottom: "8px", letterSpacing: "-0.02em" }}>
                                Shipment vytvořen!
                            </h2>
                            <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: "36px", fontSize: "0.9375rem" }}>
                                ID: <span style={{ color: "#93c5fd", fontWeight: 700 }}>#{createdShipmentId}</span>
                            </p>
                            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                                <Link to={`/shipments/${createdShipmentId}`} style={{ textDecoration: "none" }}>
                                    <Button onClick={() => {}}>🔍 Detail shipmentu</Button>
                                </Link>
                                <Button variant="secondary" onClick={() => setCreatedShipmentId(null)}>
                                    ➕ Vytvořit další
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <h1 style={{ fontSize: "2.5rem", fontWeight: 700, color: "#ffffff", marginBottom: "40px", letterSpacing: "-0.03em" }}>
                            Vytvořit shipment
                        </h1>

                        {error && (
                            <div style={{ padding: "14px 18px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", color: "#fca5a5", marginBottom: "24px", fontSize: "0.9rem" }}>
                                ⚠️ {error}
                            </div>
                        )}

                        <CreateForm title="Základní informace" onSubmit={handleCreateShipment} submitLabel="Vytvořit shipment" submitIcon="🚚">
                            <InputField label="Název shipmentu" value={shipmentName} onChange={(v) => setShipmentName(v as string)} required />

                            {/* Container select – dark styled */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "rgba(255,255,255,0.7)", letterSpacing: "-0.01em" }}>
                                    Kontejner <span style={{ color: "#ef4444" }}>*</span>
                                </label>
                                <select
                                    required
                                    value={selectedContainer?.id ?? ""}
                                    onChange={(e) => {
                                        const id = Number(e.target.value);
                                        setSelectedContainer(containers.find((c) => c.id === id) || null);
                                    }}
                                    style={{
                                        padding: "14px 16px",
                                        borderRadius: "8px",
                                        border: "1.5px solid rgba(255,255,255,0.1)",
                                        fontSize: "0.9375rem",
                                        outline: "none",
                                        background: "rgba(255,255,255,0.05)",
                                        color: selectedContainer ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.3)",
                                        backdropFilter: "blur(10px)",
                                        cursor: "pointer",
                                        fontFamily: "'Helvetica Neue', -apple-system, sans-serif",
                                        transition: "all 0.2s",
                                    }}
                                    onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(59,130,246,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)"; }}
                                    onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.boxShadow = "none"; }}
                                >
                                    <option value="" disabled>-- vyberte kontejner --</option>
                                    {containers.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name} ({c.length}×{c.width}×{c.height}, max {c.maxWeight} kg)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "rgba(255,255,255,0.7)", letterSpacing: "-0.01em" }}>
                                    Metoda balení
                                </label>
                                <div style={{ padding: "14px 16px", borderRadius: "8px", border: "1.5px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", color: "rgba(255,255,255,0.4)", fontSize: "0.9375rem", backdropFilter: "blur(10px)" }}>
                                    {packingMethod}
                                </div>
                            </div>
                        </CreateForm>

                        {/* Box selection */}
                        <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "rgba(255,255,255,0.95)", letterSpacing: "-0.02em", margin: 0 }}>
                                Výběr boxů
                            </h2>
                            {selectedBoxes.length > 0 && (
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: "20px" }}>
                                    <span style={{ color: "#93c5fd", fontWeight: 700, fontSize: "0.9rem" }}>
                                        ✓ {selectedBoxes.length} {selectedBoxes.length === 1 ? "box vybrán" : "boxy vybrány"}
                                    </span>
                                </div>
                            )}
                        </div>

                        <Table data={boxes} columns={boxColumns} actions={boxActions} idKey="id" loading={loading} emptyMessage="Žádné boxy" />
                    </>
                )}
            </PageLayout>
        </>
    );
}