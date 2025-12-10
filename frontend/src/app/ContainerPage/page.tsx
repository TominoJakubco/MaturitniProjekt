import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../axiosInstance";

interface Container {
    id?: number;
    name: string;
    length: number;
    width: number;
    height: number;
    maxWeight: number;
}

export default function ContainerPage() {
    const [containers, setContainers] = useState<Container[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [newContainer, setNewContainer] = useState<Container>({
        name: "",
        length: 0,
        width: 0,
        height: 0,
        maxWeight: 0,
    });
    const [editContainer, setEditContainer] = useState<Container | null>(null);

    const handleApiError = (error: any) => {
        if (error.response?.status === 401) {
            alert('Nejste přihlášeni');
            // přesměrování na login může být tady
        } else if (error.response?.status === 403) {
            alert('Nemáte dostatečná oprávnění');
        } else {
            alert('Došlo k chybě: ' + error.message);
        }
    };

    const fetchContainers = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get<Container[]>("/api/containers");
            setContainers(res.data);
        } catch (err) {
            console.error("Chyba při načítání kontejnerů:", err);
            setError("Nepodařilo se načíst kontejnery.");
            handleApiError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContainers();
    }, []);

    const handleAddContainer = async () => {
        if (!newContainer.name) {
            alert("Vyplň všechny povinné údaje!");
            return;
        }
        try {
            await axiosInstance.post("/api/containers", newContainer);
            setNewContainer({ name: "", length: 0, width: 0, height: 0, maxWeight: 0 });
            await fetchContainers();
            alert("Kontejner přidán!");
        } catch (err) {
            console.error(err);
            alert("Chyba při přidávání kontejneru");
            handleApiError(err);
        }
    };

    const handleDeleteContainer = async (id: number) => {
        if (!window.confirm("Opravdu chceš smazat tento kontejner?")) return;
        try {
            await axiosInstance.delete(`/api/containers/${id}`);
            await fetchContainers();
            alert("Kontejner smazán!");
        } catch (err) {
            console.error(err);
            alert("Chyba při mazání kontejneru");
            handleApiError(err);
        }
    };

    const handleUpdateContainer = async () => {
        if (!editContainer?.id) return;
        try {
            await axiosInstance.put(`/api/containers/${editContainer.id}`, editContainer);
            setEditContainer(null);
            await fetchContainers();
            alert("Kontejner aktualizován!");
        } catch (err) {
            console.error(err);
            alert("Chyba při aktualizaci kontejneru");
            handleApiError(err);
        }
    };

    return (
        <div style={{ maxWidth: 1000, margin: "50px auto", fontFamily: "Arial, sans-serif" }}>
            <Link to="/" style={{ display: "inline-block", marginBottom: "20px", color: "#FF9800" }}>
                ⬅️ Zpět na menu
            </Link>

            <h1 style={{ textAlign: "center" }}>Správa kontejnerů</h1>

            {loading && <p>Načítám kontejnery...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            <h2>Přidat kontejner</h2>
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
                    placeholder="Max. váha"
                    type="number"
                    value={newContainer.maxWeight || ""}
                    onChange={(e) => setNewContainer({ ...newContainer, maxWeight: Number(e.target.value) })}
                />
            </div>
            <button type="button" style={{ marginTop: 10 }} onClick={handleAddContainer}>
                Přidat
            </button>

            <hr style={{ margin: "30px 0" }} />

            {!loading && !error && (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                    <tr style={{ background: "#f2f2f2" }}>
                        <th style={{ border: "1px solid #ddd", padding: "8px" }}>ID</th>
                        <th style={{ border: "1px solid #ddd", padding: "8px" }}>Název</th>
                        <th style={{ border: "1px solid #ddd", padding: "8px" }}>Délka</th>
                        <th style={{ border: "1px solid #ddd", padding: "8px" }}>Šířka</th>
                        <th style={{ border: "1px solid #ddd", padding: "8px" }}>Výška</th>
                        <th style={{ border: "1px solid #ddd", padding: "8px" }}>Max. váha</th>
                        <th style={{ border: "1px solid #ddd", padding: "8px" }}>Akce</th>
                    </tr>
                    </thead>
                    <tbody>
                    {containers.length === 0 && (
                        <tr>
                            <td
                                style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}
                                colSpan={8}
                            >
                                Žádné kontejnery
                            </td>
                        </tr>
                    )}
                    {containers.map((container) => (
                        <tr key={container.id}>
                            <td style={{ border: "1px solid #ddd", padding: "8px" }}>{container.id}</td>
                            <td style={{ border: "1px solid #ddd", padding: "8px" }}>{container.name}</td>
                            <td style={{ border: "1px solid #ddd", padding: "8px" }}>{container.length}</td>
                            <td style={{ border: "1px solid #ddd", padding: "8px" }}>{container.width}</td>
                            <td style={{ border: "1px solid #ddd", padding: "8px" }}>{container.height}</td>
                            <td style={{ border: "1px solid #ddd", padding: "8px" }}>{container.maxWeight}</td>
                            <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                                <button type="button" onClick={() => setEditContainer(container)}>
                                    ✏️ Upravit
                                </button>
                                <button
                                    type="button"
                                    style={{ marginLeft: 8, color: "red" }}
                                    onClick={() => handleDeleteContainer(container.id!)}
                                >
                                    🗑️ Smazat
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}

            {editContainer && (
                <div style={{ marginTop: 30, border: "1px solid #ccc", padding: 20 }}>
                    <h3>Upravit kontejner</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                        <input
                            placeholder="Název"
                            value={editContainer.name}
                            onChange={(e) => setEditContainer({ ...editContainer, name: e.target.value })}
                        />
                        <input
                            placeholder="Délka"
                            type="number"
                            value={editContainer.length}
                            onChange={(e) => setEditContainer({ ...editContainer, length: Number(e.target.value) })}
                        />
                        <input
                            placeholder="Šířka"
                            type="number"
                            value={editContainer.width}
                            onChange={(e) => setEditContainer({ ...editContainer, width: Number(e.target.value) })}
                        />
                        <input
                            placeholder="Výška"
                            type="number"
                            value={editContainer.height}
                            onChange={(e) => setEditContainer({ ...editContainer, height: Number(e.target.value) })}
                        />
                        <input
                            placeholder="Max. váha"
                            type="number"
                            value={editContainer.maxWeight}
                            onChange={(e) => setEditContainer({ ...editContainer, maxWeight: Number(e.target.value) })}
                        />
                    </div>
                    <div style={{ marginTop: 10 }}>
                        <button type="button" onClick={handleUpdateContainer}>
                            💾 Uložit změny
                        </button>
                        <button type="button" style={{ marginLeft: 10 }} onClick={() => setEditContainer(null)}>
                            ❌ Zrušit
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
