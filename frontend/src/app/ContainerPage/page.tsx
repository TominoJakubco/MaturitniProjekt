import { useEffect, useState } from "react";
import axiosInstance from "../axiosInstance";
import Navbar from "../../components/Navbar";
import { InputField, CreateForm, EditModal } from "../../components/FormComponents";
import { Table } from "../../components/Table";
import PageLayout from "../../components/Pagelayout";
import ShareModal from "../../components/ShareModal";

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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);
    const [shareTarget, setShareTarget] = useState<Container | null>(null);

    const emptyContainer: Container = { name: "", length: 0, width: 0, height: 0, maxWeight: 0 };
    const [newContainer, setNewContainer] = useState<Container>(emptyContainer);
    const [editContainer, setEditContainer] = useState<Container | null>(null);

    const handleApiError = (err: any) => {
        if (err.response?.status === 401) alert("Nejste přihlášeni");
        else if (err.response?.status === 403) alert("Nemáte dostatečná oprávnění");
        else alert("Došlo k chybě");
    };

    const fetchContainers = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get<Container[]>("/api/containers");
            setContainers(res.data);
            setError("");
        } catch (err: any) {
            setError("Nepodařilo se načíst kontejnery");
            handleApiError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchContainers(); }, []);

    const handleAddContainer = async () => {
        if (!newContainer.name) return;
        try {
            await axiosInstance.post("/api/containers", newContainer);
            setNewContainer(emptyContainer);
            await fetchContainers();
        } catch (err: any) { handleApiError(err); }
    };

    const handleUpdateContainer = async () => {
        if (!editContainer?.id) return;
        try {
            await axiosInstance.put(`/api/containers/${editContainer.id}`, editContainer);
            setEditContainer(null);
            await fetchContainers();
        } catch (err: any) { handleApiError(err); }
    };

    const handleDeleteContainer = async () => {
        if (!deleteConfirm?.id) return;
        try {
            await axiosInstance.delete(`/api/containers/${deleteConfirm.id}`);
            setDeleteConfirm(null);
            await fetchContainers();
        } catch (err: any) { handleApiError(err); }
    };

    const columns = [
        { key: "id", label: "ID", width: "70px", align: "center" as const },
        { key: "name", label: "Název" },
        { key: "length", label: "Délka", align: "right" as const },
        { key: "width", label: "Šířka", align: "right" as const },
        { key: "height", label: "Výška", align: "right" as const },
        { key: "maxWeight", label: "Max. váha", align: "right" as const },
    ];

    const actions = [
        { label: "Upravit", icon: "✏️", onClick: (c: Container) => setEditContainer(c), variant: "secondary" as const },
        { label: "Sdílet", icon: "🔗", onClick: (c: Container) => setShareTarget(c), variant: "secondary" as const },
        { label: "Smazat", icon: "🗑️", onClick: (c: Container) => setDeleteConfirm({ id: c.id!, name: c.name }), variant: "danger" as const },
    ];

    return (
        <>
            <Navbar breadcrumb={[{ label: "Home", path: "../" }, { label: "Kontejnery" }]} />
            <PageLayout>
                <h1 style={{ fontSize: "2.5rem", fontWeight: 700, color: "#ffffff", marginBottom: "40px", letterSpacing: "-0.03em" }}>
                    Správa kontejnerů
                </h1>

                {error && (
                    <div style={{ padding: "14px 18px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", color: "#fca5a5", marginBottom: "24px", fontSize: "0.9rem" }}>
                        ⚠️ {error}
                    </div>
                )}

                <CreateForm title="Přidat kontejner" description="Zadejte parametry nového kontejneru" onSubmit={handleAddContainer} submitLabel="Přidat">
                    <InputField label="Název" value={newContainer.name} onChange={(v) => setNewContainer({ ...newContainer, name: v as string })} required />
                    <InputField label="Délka" type="number" value={newContainer.length} onChange={(v) => setNewContainer({ ...newContainer, length: v as number })} />
                    <InputField label="Šířka" type="number" value={newContainer.width} onChange={(v) => setNewContainer({ ...newContainer, width: v as number })} />
                    <InputField label="Výška" type="number" value={newContainer.height} onChange={(v) => setNewContainer({ ...newContainer, height: v as number })} />
                    <InputField label="Maximální váha" type="number" value={newContainer.maxWeight} onChange={(v) => setNewContainer({ ...newContainer, maxWeight: v as number })} />
                </CreateForm>

                <Table data={containers} columns={columns} actions={actions} idKey="id" loading={loading} emptyMessage="Žádné kontejnery" />

                <EditModal title="Upravit kontejner" description="Změň parametry vybraného kontejneru" isOpen={!!editContainer} onClose={() => setEditContainer(null)} onSave={handleUpdateContainer}>
                    {editContainer && (
                        <>
                            <InputField label="Název" value={editContainer.name} onChange={(v) => setEditContainer({ ...editContainer, name: v as string })} required />
                            <InputField label="Délka" type="number" value={editContainer.length} onChange={(v) => setEditContainer({ ...editContainer, length: v as number })} />
                            <InputField label="Šířka" type="number" value={editContainer.width} onChange={(v) => setEditContainer({ ...editContainer, width: v as number })} />
                            <InputField label="Výška" type="number" value={editContainer.height} onChange={(v) => setEditContainer({ ...editContainer, height: v as number })} />
                            <InputField label="Maximální váha" type="number" value={editContainer.maxWeight} onChange={(v) => setEditContainer({ ...editContainer, maxWeight: v as number })} />
                        </>
                    )}
                </EditModal>

                {/* Delete Confirmation Modal */}
                {deleteConfirm && (
                    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px", animation: "fadeInUp 0.2s ease-out" }}>
                        <div style={{ background: "rgba(15,23,42,0.98)", backdropFilter: "blur(40px)", borderRadius: "20px", padding: "40px", maxWidth: "420px", width: "100%", boxShadow: "0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.08)" }}>
                            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", marginBottom: "20px" }}>
                                🗑️
                            </div>
                            <h3 style={{ fontSize: "1.375rem", fontWeight: 700, color: "#ffffff", marginBottom: "12px", letterSpacing: "-0.02em" }}>
                                Smazat kontejner
                            </h3>
                            <p style={{ fontSize: "0.9375rem", color: "rgba(255,255,255,0.6)", marginBottom: "32px", lineHeight: 1.6 }}>
                                Opravdu chcete smazat kontejner <strong style={{ color: "rgba(255,255,255,0.9)" }}>{deleteConfirm.name}</strong>? Tato akce je nevratná.
                            </p>
                            <div style={{ display: "flex", gap: "12px" }}>
                                <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: "12px", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", cursor: "pointer", fontSize: "0.9rem", fontWeight: 600, transition: "all 0.2s" }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#fff"; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}>
                                    Zrušit
                                </button>
                                <button onClick={handleDeleteContainer} style={{ flex: 1, padding: "12px", background: "linear-gradient(135deg, rgba(239,68,68,0.2), rgba(220,38,38,0.15))", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.4)", borderRadius: "8px", cursor: "pointer", fontSize: "0.9rem", fontWeight: 600, transition: "all 0.2s" }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = "linear-gradient(135deg, rgba(239,68,68,0.35), rgba(220,38,38,0.28))"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.6)"; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = "linear-gradient(135deg, rgba(239,68,68,0.2), rgba(220,38,38,0.15))"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)"; }}>
                                    Smazat
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </PageLayout>

            <ShareModal
                isOpen={shareTarget !== null}
                onClose={() => setShareTarget(null)}
                resourceId={shareTarget?.id!}
                resourceType="containers"
                resourceName={shareTarget?.name}
            />
        </>
    );
}