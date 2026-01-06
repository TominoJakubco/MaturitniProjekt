import { useEffect, useState } from "react";
import axiosInstance from "../axiosInstance";
import Navbar from "../../components/Navbar";
import { Table } from "../../components/Table";
import { InputField, Button, CreateForm, EditModal } from "../../components/FormComponents";
import PageLayout from "../../components/Pagelayout";
import ShareModal from "../../components/ShareModal";

interface Box {
    id?: number;
    name: string;
    amount: number;
    length: number;
    width: number;
    height: number;
    weight: number;
    volume?: number;
    volume_total?: number;
    weight_total?: number;
}

export default function BoxPage() {
    const [boxes, setBoxes] = useState<Box[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [newBox, setNewBox] = useState<Box>({ name: "", amount: 0, length: 0, width: 0, height: 0, weight: 0 });
    const [editBox, setEditBox] = useState<Box | null>(null);
    const [shareTarget, setShareTarget] = useState<Box | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const handleApiError = (error: any) => {
        if (error.response?.status === 401) alert("Nejste přihlášeni");
        else if (error.response?.status === 403) alert("Nemáte dostatečná oprávnění");
        else alert("Došlo k chybě: " + error.message);
    };

    const fetchBoxes = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get<Box[]>("/api/boxes");
            setBoxes(res.data);
        } catch (err: any) {
            setError("Nepodařilo se načíst boxy.");
            handleApiError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBoxes(); }, []);

    const handleAddBox = async () => {
        if (!newBox.name || !newBox.amount) { alert("Vyplň všechny povinné údaje!"); return; }
        try {
            await axiosInstance.post("/api/boxes", newBox);
            setNewBox({ name: "", amount: 0, length: 0, width: 0, height: 0, weight: 0 });
            await fetchBoxes();
        } catch (err: any) {
            alert("Chyba při vytváření boxu: " + (err.response?.data?.message || err.message));
            handleApiError(err);
        }
    };

    const handleDeleteBox = async (id: number) => {
        if (!window.confirm("Opravdu chceš smazat tento box?")) return;
        try {
            await axiosInstance.delete(`/api/boxes/${id}`);
            await fetchBoxes();
        } catch (err: any) {
            alert("Chyba při mazání boxu");
            handleApiError(err);
        }
    };

    const handleUpdateBox = async () => {
        if (!editBox?.id) return;
        try {
            const { volume, volume_total, weight_total, ...boxData } = editBox;
            await axiosInstance.put(`/api/boxes/${editBox.id}`, boxData);
            setEditBox(null);
            await fetchBoxes();
        } catch (err: any) {
            if (err.response?.status === 403) alert("Nemáte oprávnění k úpravě tohoto boxu");
            else alert("Chyba při aktualizaci boxu: " + (err.response?.data?.message || err.message));
            handleApiError(err);
        }
    };

    const handleUploadFile = async () => {
        if (!selectedFile) return;
        setUploading(true);
        const formData = new FormData();
        formData.append("file", selectedFile);
        try {
            await axiosInstance.post("/api/boxes/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
            setSelectedFile(null);
            await fetchBoxes();
        } catch (err) {
            alert("Chyba při importu Excelu");
        } finally {
            setUploading(false);
        }
    };

    const columns = [
        { key: "id", label: "ID", width: "70px", align: "center" as const },
        { key: "name", label: "Název" },
        { key: "amount", label: "Množství", align: "right" as const },
        { key: "length", label: "Délka", align: "right" as const },
        { key: "width", label: "Šířka", align: "right" as const },
        { key: "height", label: "Výška", align: "right" as const },
        { key: "weight", label: "Váha", align: "right" as const },
        { key: "volume", label: "Objem", align: "right" as const },
    ];

    const actions = [
        { label: "Upravit", icon: "✏️", onClick: (box: Box) => setEditBox(box), variant: "secondary" as const },
        { label: "Sdílet", icon: "🔗", onClick: (box: Box) => setShareTarget(box), variant: "secondary" as const },
        { label: "Smazat", icon: "🗑️", onClick: (box: Box) => handleDeleteBox(box.id!), variant: "danger" as const },
    ];

    return (
        <>
            <Navbar breadcrumb={[{ label: "Home", path: "../" }, { label: "Boxy" }]} />
            <PageLayout>
                <h1 style={{ fontSize: "2.5rem", fontWeight: 700, color: "#ffffff", marginBottom: "40px", letterSpacing: "-0.03em" }}>
                    Správa boxů
                </h1>

                {error && (
                    <div style={{ padding: "14px 18px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", color: "#fca5a5", marginBottom: "24px", fontSize: "0.9rem" }}>
                        ⚠️ {error}
                    </div>
                )}

                <CreateForm title="Přidat box" onSubmit={handleAddBox} submitLabel="Přidat box" submitIcon="➕">
                    <InputField label="Název" placeholder="Název boxu" value={newBox.name} onChange={(v) => setNewBox({ ...newBox, name: v as string })} required />
                    <InputField label="Množství" placeholder="0" type="number" value={newBox.amount} onChange={(v) => setNewBox({ ...newBox, amount: v as number })} required />
                    <InputField label="Délka" placeholder="0" type="number" value={newBox.length} onChange={(v) => setNewBox({ ...newBox, length: v as number })} />
                    <InputField label="Šířka" placeholder="0" type="number" value={newBox.width} onChange={(v) => setNewBox({ ...newBox, width: v as number })} />
                    <InputField label="Výška" placeholder="0" type="number" value={newBox.height} onChange={(v) => setNewBox({ ...newBox, height: v as number })} />
                    <InputField label="Váha" placeholder="0" type="number" value={newBox.weight} onChange={(v) => setNewBox({ ...newBox, weight: v as number })} />
                </CreateForm>

                {/* Excel upload */}
                <div style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)", padding: "28px 32px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 24px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)", marginBottom: "32px" }}>
                    <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "rgba(255,255,255,0.95)", marginBottom: "20px", letterSpacing: "-0.01em" }}>
                        📊 Nahrát boxy z Excelu
                    </h2>

                    {!selectedFile ? (
                        <label style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "12px 20px", background: "rgba(255,255,255,0.04)", border: "1.5px dashed rgba(255,255,255,0.15)", borderRadius: "10px", cursor: "pointer", color: "rgba(255,255,255,0.6)", fontSize: "0.9rem", fontWeight: 500, transition: "all 0.2s" }}
                               onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(59,130,246,0.4)"; e.currentTarget.style.color = "#93c5fd"; }}
                               onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}>
                            <span>📁</span> Vybrat soubor (.xlsx, .xls)
                            <input type="file" accept=".xlsx,.xls" onChange={(e) => { const f = e.target.files?.[0]; if (f) setSelectedFile(f); }} style={{ display: "none" }} />
                        </label>
                    ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", flex: 1, minWidth: "200px" }}>
                                <span style={{ fontSize: "1.2rem" }}>📄</span>
                                <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selectedFile.name}</span>
                            </div>
                            <Button onClick={() => setSelectedFile(null)} variant="secondary" size="sm">Odebrat</Button>
                            <Button onClick={handleUploadFile} disabled={uploading} variant="success" icon={uploading ? "⏳" : "📤"} size="sm">
                                {uploading ? "Importuji..." : "Importovat"}
                            </Button>
                        </div>
                    )}
                </div>

                <Table data={boxes} columns={columns} actions={actions} idKey="id" loading={loading} />

                <EditModal title="Upravit box" isOpen={!!editBox} onClose={() => setEditBox(null)} onSave={handleUpdateBox}>
                    {editBox && (
                        <>
                            <InputField label="Název" value={editBox.name} onChange={(v) => setEditBox({ ...editBox, name: v as string })} required />
                            <InputField label="Množství" type="number" value={editBox.amount} onChange={(v) => setEditBox({ ...editBox, amount: v as number })} required />
                            <InputField label="Délka" type="number" value={editBox.length} onChange={(v) => setEditBox({ ...editBox, length: v as number })} />
                            <InputField label="Šířka" type="number" value={editBox.width} onChange={(v) => setEditBox({ ...editBox, width: v as number })} />
                            <InputField label="Výška" type="number" value={editBox.height} onChange={(v) => setEditBox({ ...editBox, height: v as number })} />
                            <InputField label="Váha" type="number" value={editBox.weight} onChange={(v) => setEditBox({ ...editBox, weight: v as number })} />
                        </>
                    )}
                </EditModal>
            </PageLayout>

            <ShareModal
                isOpen={shareTarget !== null}
                onClose={() => setShareTarget(null)}
                resourceId={shareTarget?.id!}
                resourceType="boxes"
                resourceName={shareTarget?.name}
            />
        </>
    );
}