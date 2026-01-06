import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../axiosInstance";
import ShipmentViewer from "../../components/ShipmentViewer";
import Navbar from "../../components/Navbar";

export default function ShipmentDetail() {
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [shipmentName, setShipmentName] = useState("");

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        setError("");
        axiosInstance.get(`/api/shipments/${id}`)
            .then(res => setShipmentName(res.data.name || `Shipment ${id}`))
            .catch((err: any) => {
                setError(err.message || "Nepodařilo se načíst shipment");
                if (err.response?.status === 401) alert("Nejste přihlášeni");
                else if (err.response?.status === 403) alert("Nemáte dostatečná oprávnění");
            })
            .finally(() => setLoading(false));
    }, [id]);

    return (
        <>
            <Navbar breadcrumb={[
                { label: "Home", path: "../" },
                { label: "Shipmenty", path: "../shipments" },
                { label: shipmentName || "Detail" },
            ]} />

            <div style={{
                minHeight: "calc(100vh - 72px)",
                background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
                display: "flex",
                flexDirection: "column",
                fontFamily: "'Helvetica Neue', -apple-system, BlinkMacSystemFont, sans-serif",
                position: "relative",
                overflow: "hidden",
            }}>
                {/* Ambient blobs */}
                <div style={{ position: "absolute", top: "5%", right: "10%", width: "350px", height: "350px", background: "radial-gradient(circle, rgba(59,130,246,0.1), transparent 70%)", borderRadius: "50%", filter: "blur(70px)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", bottom: "10%", left: "5%", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(14,165,233,0.08), transparent 70%)", borderRadius: "50%", filter: "blur(70px)", pointerEvents: "none" }} />

                <style>{`
                    @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                `}</style>

                <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "32px 24px", maxWidth: "1600px", width: "100%", margin: "0 auto", position: "relative", zIndex: 1, animation: "fadeInUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards" }}>

                    {/* Header */}
                    <div style={{ marginBottom: "24px" }}>
                        {loading ? (
                            <div style={{ height: "40px", width: "280px", background: "rgba(255,255,255,0.05)", borderRadius: "8px", animation: "pulse 1.5s ease-in-out infinite" }} />
                        ) : (
                            <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.03em", margin: 0 }}>
                                {shipmentName}
                            </h1>
                        )}
                    </div>

                    {loading && (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
                            <div style={{ textAlign: "center" }}>
                                <div style={{ display: "inline-block", width: "48px", height: "48px", border: "4px solid rgba(255,255,255,0.1)", borderTop: "4px solid #3b82f6", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                                <p style={{ marginTop: "16px", color: "rgba(255,255,255,0.5)", fontSize: "0.9375rem" }}>Načítám shipment...</p>
                            </div>
                        </div>
                    )}

                    {error && !loading && (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
                            <div style={{ textAlign: "center", background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "48px", maxWidth: "400px", width: "100%" }}>
                                <div style={{ fontSize: "2.5rem", marginBottom: "16px" }}>⚠️</div>
                                <p style={{ color: "#fca5a5", fontSize: "1rem", fontWeight: 600, marginBottom: "8px" }}>Chyba při načítání</p>
                                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.875rem" }}>{error}</p>
                                <button onClick={() => window.location.reload()} style={{ marginTop: "24px", padding: "10px 24px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)", borderRadius: "8px", cursor: "pointer", fontSize: "0.875rem", fontWeight: 600 }}>
                                    Zkusit znovu
                                </button>
                            </div>
                        </div>
                    )}

                    {!id && (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
                            <p style={{ color: "#fca5a5" }}>ID shipmentu nebylo poskytnuto.</p>
                        </div>
                    )}

                    {!loading && !error && id && (
                        <div style={{ flex: 1, minHeight: "600px" }}>
                            <ShipmentViewer shipmentId={id} height={700} width="100%" />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}