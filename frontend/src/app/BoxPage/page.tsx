import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../axiosInstance";

interface Box {
    id?: number;
    name: string;
    amount: number;
    length: number;
    width: number;
    height: number;
    volume: number;
    volumeTotal: number;
    weight: number;
    weightTotal: number;
}

export default function BoxPage() {
    const [boxes, setBoxes] = useState<Box[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [newBox, setNewBox] = useState<Box>({
        name: "",
        amount: 0,
        length: 0,
        width: 0,
        height: 0,
        volume: 0,
        volumeTotal: 0,
        weight: 0,
        weightTotal: 0,
    });
    const [editBox, setEditBox] = useState<Box | null>(null);

    // 🧠 jednotné ošetření chyb
    const handleApiError = (error: any) => {
        if (error.response?.status === 401) {
            alert("Nejste přihlášeni");
        } else if (error.response?.status === 403) {
            alert("Nemáte dostatečná oprávnění");
        } else {
            alert("Došlo k chybě: " + error.message);
        }
    };

    const fetchBoxes = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get<Box[]>("/api/boxes");
            setBoxes(res.data);
        } catch (err: any) {
            console.error("Chyba při načítání boxů:", err);
            setError("Nepodařilo se načíst boxy.");
            handleApiError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBoxes();
    }, []);

    const handleAddBox = async () => {
        if (!newBox.name || !newBox.amount) {
            alert("Vyplň všechny povinné údaje!");
            return;
        }
        try {
            await axiosInstance.post("/api/boxes", newBox);
            setNewBox({
                name: "",
                amount: 0,
                length: 0,
                width: 0,
                height: 0,
                volume: 0,
                volumeTotal: 0,
                weight: 0,
                weightTotal: 0,
            });
            await fetchBoxes();
            alert("Box přidán!");
        } catch (err) {
            console.error(err);
            alert("Chyba při přidávání boxu");
            handleApiError(err);
        }
    };

    const handleDeleteBox = async (id: number) => {
        if (!window.confirm("Opravdu chceš smazat tento box?")) return;
        try {
            await axiosInstance.delete(`/api/boxes/${id}`);
            await fetchBoxes();
            alert("Box smazán!");
        } catch (err) {
            console.error(err);
            alert("Chyba při mazání boxu");
            handleApiError(err);
        }
    };

    const handleUpdateBox = async () => {
        if (!editBox?.id) return;
        try {
            await axiosInstance.put(`/api/boxes/${editBox.id}`, editBox);
            setEditBox(null);
            await fetchBoxes();
            alert("Box aktualizován!");
        } catch (err) {
            console.error(err);
            alert("Chyba při aktualizaci boxu");
            handleApiError(err);
        }
    };

    return (
        <div style={{ maxWidth: 1200, margin: "50px auto", fontFamily: "Arial, sans-serif" }}>
            <Link to="/" style={{ display: "inline-block", marginBottom: "20px", color: "#2196F3" }}>
                ⬅️ Zpět na menu
            </Link>

            <h1 style={{ textAlign: "center" }}>Správa boxů</h1>

            {loading && <p>Načítám boxy...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            <h2>Přidat box</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                <input placeholder="Název" value={newBox.name} onChange={(e) => setNewBox({ ...newBox, name: e.target.value })} />
                <input placeholder="Množství" type="number" value={newBox.amount || ""} onChange={(e) => setNewBox({ ...newBox, amount: Number(e.target.value) })} />
                <input placeholder="Délka" type="number" value={newBox.length || ""} onChange={(e) => setNewBox({ ...newBox, length: Number(e.target.value) })} />
                <input placeholder="Šířka" type="number" value={newBox.width || ""} onChange={(e) => setNewBox({ ...newBox, width: Number(e.target.value) })} />
                <input placeholder="Výška" type="number" value={newBox.height || ""} onChange={(e) => setNewBox({ ...newBox, height: Number(e.target.value) })} />
                <input placeholder="Objem" type="number" value={newBox.volume || ""} onChange={(e) => setNewBox({ ...newBox, volume: Number(e.target.value) })} />
                <input placeholder="Celkový objem" type="number" value={newBox.volumeTotal || ""} onChange={(e) => setNewBox({ ...newBox, volumeTotal: Number(e.target.value) })} />
                <input placeholder="Váha" type="number" value={newBox.weight || ""} onChange={(e) => setNewBox({ ...newBox, weight: Number(e.target.value) })} />
                <input placeholder="Celková váha" type="number" value={newBox.weightTotal || ""} onChange={(e) => setNewBox({ ...newBox, weightTotal: Number(e.target.value) })} />
            </div>
            <button type="button" style={{ marginTop: 10 }} onClick={handleAddBox}>
                Přidat
            </button>

            <hr style={{ margin: "30px 0" }} />

            {!loading && !error && (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                    <thead>
                    <tr style={{ background: "#f2f2f2" }}>
                        <th style={{ border: "1px solid #ddd", padding: "8px" }}>ID</th>
                        <th style={{ border: "1px solid #ddd", padding: "8px" }}>Název</th>
                        <th style={{ border: "1px solid #ddd", padding: "8px" }}>Množství</th>
                        <th style={{ border: "1px solid #ddd", padding: "8px" }}>Délka</th>
                        <th style={{ border: "1px solid #ddd", padding: "8px" }}>Šířka</th>
                        <th style={{ border: "1px solid #ddd", padding: "8px" }}>Výška</th>
                        <th style={{ border: "1px solid #ddd", padding: "8px" }}>Objem</th>
                        <th style={{ border: "1px solid #ddd", padding: "8px" }}>Celk. objem</th>
                        <th style={{ border: "1px solid #ddd", padding: "8px" }}>Váha</th>
                        <th style={{ border: "1px solid #ddd", padding: "8px" }}>Celk. váha</th>
                        <th style={{ border: "1px solid #ddd", padding: "8px" }}>Akce</th>
                    </tr>
                    </thead>
                    <tbody>
                    {boxes.map((box) => (
                        <tr key={box.id}>
                            <td style={{ border: "1px solid #ddd", padding: "8px" }}>{box.id}</td>
                            <td style={{ border: "1px solid #ddd", padding: "8px" }}>{box.name}</td>
                            <td style={{ border: "1px solid #ddd", padding: "8px" }}>{box.amount}</td>
                            <td style={{ border: "1px solid #ddd", padding: "8px" }}>{box.length}</td>
                            <td style={{ border: "1px solid #ddd", padding: "8px" }}>{box.width}</td>
                            <td style={{ border: "1px solid #ddd", padding: "8px" }}>{box.height}</td>
                            <td style={{ border: "1px solid #ddd", padding: "8px" }}>{box.volume}</td>
                            <td style={{ border: "1px solid #ddd", padding: "8px" }}>{box.volumeTotal}</td>
                            <td style={{ border: "1px solid #ddd", padding: "8px" }}>{box.weight}</td>
                            <td style={{ border: "1px solid #ddd", padding: "8px" }}>{box.weightTotal}</td>
                            <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                                <button type="button" onClick={() => setEditBox(box)}>
                                    ✏️ Upravit
                                </button>
                                <button type="button" style={{ marginLeft: 8, color: "red" }} onClick={() => handleDeleteBox(box.id!)}>
                                    🗑️ Smazat
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}

            {editBox && (
                <div style={{ marginTop: 30, border: "1px solid #ccc", padding: 20 }}>
                    <h3>Upravit box</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                        <input placeholder="Název" value={editBox.name} onChange={(e) => setEditBox({ ...editBox, name: e.target.value })} />
                        <input placeholder="Množství" type="number" value={editBox.amount} onChange={(e) => setEditBox({ ...editBox, amount: Number(e.target.value) })} />
                        <input placeholder="Délka" type="number" value={editBox.length} onChange={(e) => setEditBox({ ...editBox, length: Number(e.target.value) })} />
                        <input placeholder="Šířka" type="number" value={editBox.width} onChange={(e) => setEditBox({ ...editBox, width: Number(e.target.value) })} />
                        <input placeholder="Výška" type="number" value={editBox.height} onChange={(e) => setEditBox({ ...editBox, height: Number(e.target.value) })} />
                        <input placeholder="Objem" type="number" value={editBox.volume} onChange={(e) => setEditBox({ ...editBox, volume: Number(e.target.value) })} />
                        <input placeholder="Celkový objem" type="number" value={editBox.volumeTotal} onChange={(e) => setEditBox({ ...editBox, volumeTotal: Number(e.target.value) })} />
                        <input placeholder="Váha" type="number" value={editBox.weight} onChange={(e) => setEditBox({ ...editBox, weight: Number(e.target.value) })} />
                        <input placeholder="Celková váha" type="number" value={editBox.weightTotal} onChange={(e) => setEditBox({ ...editBox, weightTotal: Number(e.target.value) })} />
                    </div>
                    <div style={{ marginTop: 10 }}>
                        <button type="button" onClick={handleUpdateBox}>💾 Uložit změny</button>
                        <button type="button" style={{ marginLeft: 10 }} onClick={() => setEditBox(null)}>❌ Zrušit</button>
                    </div>
                </div>
            )}
        </div>
    );
}
