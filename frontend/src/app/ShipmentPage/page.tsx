import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../axiosInstance";
import Navbar from "../../components/Navbar";
import { Table } from "../../components/Table";
import PageLayout from "../../components/Pagelayout";
import ShareModal from "../../components/ShareModal";


interface Shipment {
    id?: number;
    name: string;
    description?: string;
    containers: any[];
}

export default function ShipmentPage() {
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [shareTarget, setShareTarget] = useState<Shipment | null>(null);
    const navigate = useNavigate();

    const fetchShipments = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get<Shipment[]>("/api/shipments");
            setShipments(res.data);
            setError("");
        } catch (err: any) {
            setError("Nepodařilo se načíst zásilky.");
            if (err.response?.status === 401) alert("Nejste přihlášeni");
            else if (err.response?.status === 403) alert("Nemáte dostatečná oprávnění");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteShipment = async (id: number) => {
        if (!window.confirm("Opravdu chceš smazat tuto zásilku?")) return;
        try {
            await axiosInstance.delete(`/api/shipments/${id}`);
            await fetchShipments();
        } catch (err: any) {
            alert("Chyba při mazání zásilky");
        }
    };

    const handleShareShipment = async (id: number) => {

    }

    useEffect(() => { fetchShipments(); }, []);

    const columns = [
        { key: "id", label: "ID", width: "70px", align: "center" as const },
        { key: "name", label: "Název" },
        { key: "description", label: "Popis", render: (s: Shipment) => s.description || "-" },
        {
            key: "containers",
            label: "Kontejnery",
            align: "center" as const,
            render: (s: Shipment) => (
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: "28px", height: "28px", background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)", borderRadius: "8px", color: "#93c5fd", fontWeight: 700, fontSize: "0.875rem", padding: "0 8px" }}>
                    {s.containers.length}
                </span>
            ),
        },
    ];

    const actions = [
        { label: "Detail", icon: "🔍", variant: "secondary" as const, onClick: (s: Shipment) => navigate(`/shipments/${s.id}`) },
        { label: "Sdílet", icon: "🔗", variant: "secondary" as const, onClick: (s: Shipment) => setShareTarget(s) },
        { label: "Smazat", icon: "🗑️", variant: "danger" as const, onClick: (s: Shipment) => handleDeleteShipment(s.id!) },
    ];

    return (
        <>
            <Navbar breadcrumb={[{ label: "Home", path: "../" }, { label: "Shipmenty" }]} />
            <PageLayout>
                <h1 style={{ fontSize: "2.5rem", fontWeight: 700, color: "#ffffff", marginBottom: "40px", letterSpacing: "-0.03em" }}>
                    Správa zásilek
                </h1>

                {error && (
                    <div style={{ padding: "14px 18px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", color: "#fca5a5", marginBottom: "24px", fontSize: "0.9rem" }}>
                        ⚠️ {error}
                    </div>
                )}

                <Table data={shipments} columns={columns} actions={actions} idKey="id" loading={loading} emptyMessage="Žádné zásilky" />
            </PageLayout>

            <ShareModal
                isOpen={shareTarget !== null}
                onClose={() => setShareTarget(null)}
                resourceId={shareTarget?.id!}
                resourceType="shipments"
                resourceName={shareTarget?.name}
            />
        </>
    );
}