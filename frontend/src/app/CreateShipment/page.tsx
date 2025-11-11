import { useEffect, useState } from "react";
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

interface SelectedContainer {
    container: Container;
    count: number;
}

export default function CreateShipment() {
    const [boxes, setBoxes] = useState<Box[]>([]);
    const [containers, setContainers] = useState<Container[]>([]);
    const [selectedBoxes, setSelectedBoxes] = useState<number[]>([]);
    const [selectedContainers, setSelectedContainers] = useState<SelectedContainer[]>([]);
    const [newContainer, setNewContainer] = useState<Container>({
        name: "",
        length: 0,
        width: 0,
        height: 0,
        volume: 0,
        maxWeight: 0,
    });
    const [showAddContainer, setShowAddContainer] = useState(false);
    const [tempSelectedContainer, setTempSelectedContainer] = useState<SelectedContainer | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const handleApiError = (error: any) => {
        if (error.response?.status === 401) {
            alert("Nejste přihlášeni");
        } else if (error.response?.status === 403) {
            alert("Nemáte dostatečná oprávnění");
        } else {
            alert("Došlo k chybě: " + error.message);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [boxRes, containerRes] = await Promise.all([
                axiosInstance.get<Box[]>("/api/boxes"),
                axiosInstance.get<Container[]>("/api/containers"),
            ]);
            setBoxes(boxRes.data);
            setContainers(containerRes.data);
        } catch (err) {
            console.error(err);
            setError("Nepodařilo se načíst boxy nebo kontejnery.");
            handleApiError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddSelectedContainer = (container: Container, count: number) => {
        if (count <= 0) return alert("Počet musí být větší než 0");
        setSelectedContainers((prev) => [...prev, { container, count }]);
    };

    const handleAddNewContainer = async () => {
        if (!newContainer.name) return alert("Vyplňte název kontejneru.");
        try {
            const res = await axiosInstance.post("/api/containers", newContainer);
            setContainers([...containers, res.data]);
            setNewContainer({
                name: "",
                length: 0,
                width: 0,
                height: 0,
                volume: 0,
                maxWeight: 0,
            });
            setShowAddContainer(false);
            alert("Kontejner přidán a uložen!");
        } catch (err) {
            console.error(err);
            alert("Chyba při ukládání kontejneru.");
            handleApiError(err);
        }
    };

    const handleCreateShipment = async () => {
        if (selectedBoxes.length === 0 || selectedContainers.length === 0)
            return alert("Vyber alespoň 1 box a 1 kontejner.");

        const boxList = boxes.filter((b) => selectedBoxes.includes(b.id));
        const containerList: Container[] = selectedContainers.flatMap((sc) =>
            Array(sc.count).fill(sc.container)
        );

        try {
            await axiosInstance.post("/api/pack", {
                boxes: boxList,
                containers: containerList,
            });
            alert("Shipment úspěšně vytvořen!");
        } catch (err) {
            console.error(err);
            alert("Chyba při vytváření shipmentu.");
            handleApiError(err);
        }
    };

    const toggleBoxSelection = (id: number) => {
        setSelectedBoxes((prev) =>
            prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
        );
    };

    return (
        <div style={{ maxWidth: 1000, margin: "50px auto", fontFamily: "Arial, sans-serif" }}>
            <Link to="/" style={{ display: "inline-block", marginBottom: "20px", color: "#FF9800" }}>
                ⬅️ Zpět na menu
            </Link>

            <h1 style={{ textAlign: "center" }}>Vytvořit shipment</h1>

            {loading && <p>Načítám data...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {/* SEZNAM BOXŮ */}
            <h2>Vyber boxy</h2>
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20, textAlign: "center" }}>
                <thead>
                <tr style={{ background: "#f2f2f2" }}>
                    <th></th>
                    <th>Název</th>
                    <th>Rozměry (L×W×H)</th>
                    <th>Váha</th>
                    <th>Počet krabic</th>
                </tr>
                </thead>
                <tbody>
                {boxes.map((box) => (
                    <tr key={box.id}>
                        <td>
                            <input
                                type="checkbox"
                                checked={selectedBoxes.includes(box.id)}
                                onChange={() => toggleBoxSelection(box.id)}
                            />
                        </td>
                        <td>{box.name}</td>
                        <td>{box.length} × {box.width} × {box.height}</td>
                        <td>{box.weight}</td>
                        <td>{box.amount}</td>
                    </tr>
                ))}
                </tbody>
            </table>

            {/* PŘIDÁNÍ KONTEJNERŮ */}
            <h2>Vyber kontejnery</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: 10 }}>
                <select
                    style={{ padding: 5 }}
                    onChange={(e) => {
                        const selected = containers.find(c => c.id === Number(e.target.value));
                        if (selected) setTempSelectedContainer({ container: selected, count: 1 });
                    }}
                    value={tempSelectedContainer?.container.id || ""}
                >
                    <option value="">-- Vyber kontejner --</option>
                    {containers.map((container) => (
                        <option key={container.id} value={container.id}>
                            {container.name} ({container.length}×{container.width}×{container.height})
                        </option>
                    ))}
                </select>

                {tempSelectedContainer && (
                    <input
                        type="number"
                        min={1}
                        value={tempSelectedContainer.count}
                        onChange={(e) =>
                            setTempSelectedContainer({
                                ...tempSelectedContainer,
                                count: Number(e.target.value),
                            })
                        }
                        style={{ width: 60 }}
                    />
                )}

                <button
                    type="button"
                    onClick={() => {
                        if (!tempSelectedContainer) return;
                        handleAddSelectedContainer(tempSelectedContainer.container, tempSelectedContainer.count);
                        setTempSelectedContainer(null);
                    }}
                >
                    ➕ Přidat kontejner
                </button>

                <button type="button" onClick={() => setShowAddContainer(!showAddContainer)}>
                    ➕ Vlastní kontejner
                </button>
            </div>

            {showAddContainer && (
                <div style={{ marginTop: 20, border: "1px solid #ccc", padding: 15 }}>
                    <h3>Nový kontejner</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                        <input
                            placeholder="Název"
                            value={newContainer.name}
                            onChange={(e) => setNewContainer({ ...newContainer, name: e.target.value })}
                        />
                        <input
                            placeholder="Délka"
                            type="number"
                            value={newContainer.length || ""}
                            onChange={(e) => setNewContainer({ ...newContainer, length: Number(e.target.value) })}
                        />
                        <input
                            placeholder="Šířka"
                            type="number"
                            value={newContainer.width || ""}
                            onChange={(e) => setNewContainer({ ...newContainer, width: Number(e.target.value) })}
                        />
                        <input
                            placeholder="Výška"
                            type="number"
                            value={newContainer.height || ""}
                            onChange={(e) => setNewContainer({ ...newContainer, height: Number(e.target.value) })}
                        />
                        <input
                            placeholder="Objem"
                            type="number"
                            value={newContainer.volume || ""}
                            onChange={(e) => setNewContainer({ ...newContainer, volume: Number(e.target.value) })}
                        />
                        <input
                            placeholder="Max. váha"
                            type="number"
                            value={newContainer.maxWeight || ""}
                            onChange={(e) => setNewContainer({ ...newContainer, maxWeight: Number(e.target.value) })}
                        />
                    </div>
                    <button
                        type="button"
                        style={{ marginTop: 10 }}
                        onClick={handleAddNewContainer}
                    >
                        💾 Uložit nový kontejner
                    </button>
                </div>
            )}

            {selectedContainers.length > 0 && (
                <div style={{ marginTop: 20 }}>
                    <h3>Vybrané kontejnery</h3>
                    <ul>
                        {selectedContainers.map((sc, i) => (
                            <li key={i} style={{ marginBottom: 5 }}>
                                {sc.container.name} × {sc.count}{" "}
                                <button
                                    type="button"
                                    onClick={() => setSelectedContainers(prev => prev.filter((_, idx) => idx !== i))}
                                    style={{
                                        marginLeft: 10,
                                        background: "white",
                                        color: "white",
                                        border: "1px solid black",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                        padding: "2px 6px",
                                    }}
                                >
                                    ❌
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <button
                type="button"
                onClick={handleCreateShipment}
                style={{
                    background: "#4CAF50",
                    color: "white",
                    padding: "10px 20px",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                }}
            >
                Vytvořit shipment
            </button>
        </div>
    );
}
