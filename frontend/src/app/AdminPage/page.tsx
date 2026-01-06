import { useEffect, useState, useCallback, useMemo, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../axiosInstance";
import Navbar from "../../components/Navbar";
import PageLayout from "../../components/Pagelayout";
import { useAuthGuard } from "../../hooks/useAuthGuard";
import { Table } from "../../components/Table";

// ─── Inline InputField ─────────────────────────────────────────────────────────

function InputField({ label, placeholder, type = "text", value, onChange, required = false }: {
    label?: string; placeholder?: string; type?: "text" | "number" | "email" | "password";
    value: string | number; onChange: (value: string | number) => void; required?: boolean;
}) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {label && <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>{label}{required && <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span>}</label>}
            <input type={type} placeholder={placeholder} value={value}
                   onChange={(e) => onChange(type === "number" ? Number(e.target.value) : e.target.value)}
                   style={{ padding: "12px 14px", borderRadius: 8, border: "1.5px solid rgba(255,255,255,0.1)", fontSize: "0.9rem", outline: "none", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.9)", backdropFilter: "blur(10px)" }}
                   onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(59,130,246,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)"; }}
                   onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.boxShadow = "none"; }}
            />
        </div>
    );
}

// ─── Inline EditModal ──────────────────────────────────────────────────────────

function EditModal({ title, description, children, isOpen, onClose, onSave, saveLabel = "Uložit změny" }: {
    title: string; description?: string; children: ReactNode;
    isOpen: boolean; onClose: () => void; onSave: () => void; saveLabel?: string;
}) {
    if (!isOpen) return null;
    return (
        <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: "linear-gradient(145deg,#0f172a,#0c1425)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 40, maxWidth: 700, width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 32px 64px rgba(0,0,0,0.4)" }}>
                <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fff", marginBottom: description ? 10 : 28, letterSpacing: "-0.02em" }}>{title}</h3>
                {description && <p style={{ fontSize: "0.9rem", color: "rgba(148,163,184,0.7)", marginBottom: 28 }}>{description}</p>}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
                    {children}
                </div>
                <div style={{ display: "flex", gap: 12, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                    <button onClick={onSave} style={{ flex: 1, padding: "12px 24px", borderRadius: 10, border: "1px solid rgba(16,185,129,0.4)", background: "rgba(16,185,129,0.12)", color: "#6ee7b7", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer" }}>{saveLabel}</button>
                    <button onClick={onClose} style={{ flex: 1, padding: "12px 24px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.6)", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer" }}>Zrušit</button>
                </div>
            </div>
        </div>
    );
}


// ─── Types ────────────────────────────────────────────────────────────────────

interface User {
    id: number;
    name: string;
    surname: string;
    email: string;
    role: string;
    verified: boolean;
}

interface Box {
    id: number;
    name: string;
    amount: number;
    length: number;
    width: number;
    height: number;
    weight: number;
    owner?: { email: string };
}

interface Container {
    id: number;
    name: string;
    length: number;
    width: number;
    height: number;
    maxWeight: number;
    owner?: { email: string };
}

interface Shipment {
    id: number;
    name: string;
    description?: string;
    containers: any[];
    owner?: { email: string };
}

type Tab = "users" | "boxes" | "containers" | "shipments";

// ─── Confirm modal ─────────────────────────────────────────────────────────────

function ConfirmModal({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: 16 }}>
            <div style={{ background: "linear-gradient(145deg,#0f172a,#0c1425)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 16, padding: "32px 28px", maxWidth: 380, width: "100%", boxShadow: "0 24px 60px rgba(0,0,0,0.6)" }}>
                <div style={{ fontSize: 32, marginBottom: 16, textAlign: "center" }}>⚠️</div>
                <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.95rem", textAlign: "center", marginBottom: 28, lineHeight: 1.6 }}>{message}</p>
                <div style={{ display: "flex", gap: 12 }}>
                    <button onClick={onCancel} style={{ flex: 1, padding: "11px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#94a3b8", fontSize: "0.88rem", fontWeight: 600, cursor: "pointer" }}>Zrušit</button>
                    <button onClick={onConfirm} style={{ flex: 1, padding: "11px", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: 10, color: "#fca5a5", fontSize: "0.88rem", fontWeight: 600, cursor: "pointer" }}>Smazat</button>
                </div>
            </div>
        </div>
    );
}

// ─── Scope badge ───────────────────────────────────────────────────────────────

function ScopePicker({ value, onChange }: { value: "self" | "all"; onChange: (v: "self" | "all") => void }) {
    return (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: "0.78rem", color: "rgba(148,163,184,0.7)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Viditelnost:</span>
            {(["self", "all"] as const).map((opt) => (
                <button key={opt} onClick={() => onChange(opt)} style={{ padding: "5px 14px", borderRadius: 20, border: `1px solid ${value === opt ? "rgba(59,130,246,0.5)" : "rgba(255,255,255,0.1)"}`, background: value === opt ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.03)", color: value === opt ? "#93c5fd" : "#94a3b8", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}>
                    {opt === "self" ? "🔒 Jen já" : "🌐 Všichni"}
                </button>
            ))}
        </div>
    );
}

// ─── Search bar ────────────────────────────────────────────────────────────────

function SearchBar({ value, onChange, total, filtered }: {
    value: string;
    onChange: (v: string) => void;
    total: number;
    filtered: number;
}) {
    const isActive = value.trim().length > 0;
    return (
        <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ position: "relative", flex: 1 }}>
                {/* search icon */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(148,163,184,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                     style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Hledat podle názvu…"
                    style={{
                        width: "100%",
                        padding: "11px 14px 11px 42px",
                        background: "rgba(255,255,255,0.04)",
                        border: `1px solid ${isActive ? "rgba(59,130,246,0.45)" : "rgba(255,255,255,0.09)"}`,
                        borderRadius: 10,
                        color: "#e2e8f0",
                        fontSize: "0.9rem",
                        outline: "none",
                        boxSizing: "border-box",
                        transition: "border-color 0.15s, box-shadow 0.15s",
                        boxShadow: isActive ? "0 0 0 3px rgba(59,130,246,0.1)" : "none",
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(59,130,246,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)"; }}
                    onBlur={(e) => { if (!isActive) { e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)"; e.currentTarget.style.boxShadow = "none"; } }}
                />
                {/* clear button */}
                {isActive && (
                    <button onClick={() => onChange("")}
                            style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 6, width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#94a3b8", fontSize: 12 }}>
                        ✕
                    </button>
                )}
            </div>

            {/* result count badge */}
            <div style={{ whiteSpace: "nowrap", fontSize: "0.8rem", color: isActive ? "#93c5fd" : "rgba(148,163,184,0.4)", background: isActive ? "rgba(59,130,246,0.1)" : "rgba(255,255,255,0.03)", border: `1px solid ${isActive ? "rgba(59,130,246,0.25)" : "rgba(255,255,255,0.06)"}`, borderRadius: 8, padding: "6px 12px", fontWeight: 600, transition: "all 0.2s" }}>
                {isActive ? `${filtered} / ${total}` : `${total} záznamů`}
            </div>
        </div>
    );
}

// ─── Highlight matching text ───────────────────────────────────────────────────

function Highlight({ text, query }: { text: string; query: string }) {
    if (!query.trim()) return <>{text}</>;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return <>{text}</>;
    return (
        <>
            {text.slice(0, idx)}
            <mark style={{ background: "rgba(59,130,246,0.3)", color: "#93c5fd", borderRadius: 3, padding: "0 1px" }}>
                {text.slice(idx, idx + query.length)}
            </mark>
            {text.slice(idx + query.length)}
        </>
    );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function AdminPage() {
    useAuthGuard();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<Tab>("users");
    const [users, setUsers] = useState<User[]>([]);
    const [boxes, setBoxes] = useState<Box[]>([]);
    const [containers, setContainers] = useState<Container[]>([]);
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [confirmDelete, setConfirmDelete] = useState<{ message: string; onConfirm: () => void } | null>(null);
    const [scope, setScope] = useState<"self" | "all">("self");

    // ── Edit modals ─────────────────────────────────────────────────────────
    const [editBox, setEditBox] = useState<Box | null>(null);
    const [editBoxForm, setEditBoxForm] = useState({ name: "", amount: 0, length: 0, width: 0, height: 0, weight: 0 });

    const [editContainer, setEditContainer] = useState<Container | null>(null);
    const [editContainerForm, setEditContainerForm] = useState({ name: "", length: 0, width: 0, height: 0, maxWeight: 0 });

    const [editShipment, setEditShipment] = useState<Shipment | null>(null);
    const [editShipmentName, setEditShipmentName] = useState("");

    const openEditBox = (b: Box) => { setEditBox(b); setEditBoxForm({ name: b.name, amount: b.amount, length: b.length, width: b.width, height: b.height, weight: b.weight }); };
    const openEditContainer = (c: Container) => { setEditContainer(c); setEditContainerForm({ name: c.name, length: c.length, width: c.width, height: c.height, maxWeight: c.maxWeight }); };
    const openEditShipment = (s: Shipment) => { setEditShipment(s); setEditShipmentName(s.name); };

    const saveBox = async () => {
        if (!editBox) return;
        await axiosInstance.put(`/api/boxes/${editBox.id}`, editBoxForm);
        setEditBox(null);
        refreshTab("boxes");
    };

    const saveContainer = async () => {
        if (!editContainer) return;
        await axiosInstance.put(`/api/containers/${editContainer.id}`, editContainerForm);
        setEditContainer(null);
        refreshTab("containers");
    };

    const saveShipment = async () => {
        if (!editShipment) return;
        await axiosInstance.put(`/api/shipments/${editShipment.id}`, { ...editShipment, name: editShipmentName });
        setEditShipment(null);
        refreshTab("shipments");
    };

    // Clear search when switching tabs
    const switchTab = (tab: Tab) => { setActiveTab(tab); setSearch(""); };

    // ── Load ALL data in parallel on mount ──────────────────────────────────

    const loadAll = useCallback(async () => {
        setLoading(true);
        try {
            const [usersRes, boxesRes, containersRes, shipmentsRes] = await Promise.all([
                axiosInstance.get<User[]>("/api/users"),
                axiosInstance.get<Box[]>("/api/boxes/all"),
                axiosInstance.get<Container[]>("/api/containers/all"),
                axiosInstance.get<Shipment[]>("/api/shipments/all"),
            ]);
            setUsers(usersRes.data);
            setBoxes(boxesRes.data);
            setContainers(containersRes.data);
            setShipments(shipmentsRes.data);
        } catch (e: any) {
            if (e.response?.status === 403) { alert("Přístup odepřen"); navigate("/"); }
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    const refreshTab = useCallback(async (tab: Tab) => {
        try {
            if (tab === "users")      { const r = await axiosInstance.get<User[]>("/api/users");             setUsers(r.data); }
            else if (tab === "boxes") { const r = await axiosInstance.get<Box[]>("/api/boxes/all");          setBoxes(r.data); }
            else if (tab === "containers") { const r = await axiosInstance.get<Container[]>("/api/containers/all"); setContainers(r.data); }
            else if (tab === "shipments")  { const r = await axiosInstance.get<Shipment[]>("/api/shipments/all");   setShipments(r.data); }
        } catch (e) { console.error("Refresh failed", e); }
    }, []);

    useEffect(() => { loadAll(); }, [loadAll]);

    // ── Filtered data (client-side, instant) ────────────────────────────────

    const q = search.trim().toLowerCase();

    const filteredUsers = useMemo(() =>
            q ? users.filter(u => `${u.name} ${u.surname}`.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) : users,
        [users, q]);

    const filteredBoxes = useMemo(() =>
            q ? boxes.filter(b => b.name.toLowerCase().includes(q)) : boxes,
        [boxes, q]);

    const filteredContainers = useMemo(() =>
            q ? containers.filter(c => c.name.toLowerCase().includes(q)) : containers,
        [containers, q]);

    const filteredShipments = useMemo(() =>
            q ? shipments.filter(s => s.name.toLowerCase().includes(q)) : shipments,
        [shipments, q]);

    // current total / filtered counts for the active tab
    const [total, filtered] = {
        users:      [users.length,      filteredUsers.length],
        boxes:      [boxes.length,      filteredBoxes.length],
        containers: [containers.length, filteredContainers.length],
        shipments:  [shipments.length,  filteredShipments.length],
    }[activeTab];

    // ── Delete helpers ──────────────────────────────────────────────────────

    const askDelete = (message: string, onConfirm: () => void) => setConfirmDelete({ message, onConfirm });

    const deleteUser      = (u: User)      => askDelete(`Opravdu smazat uživatele ${u.name} ${u.surname}?`, async () => { await axiosInstance.delete(`/api/users/${u.id}`);      setConfirmDelete(null); refreshTab("users"); });
    const deleteBox       = (b: Box)       => askDelete(`Opravdu smazat box "${b.name}"?`,                  async () => { await axiosInstance.delete(`/api/boxes/${b.id}`);      setConfirmDelete(null); refreshTab("boxes"); });
    const deleteContainer = (c: Container) => askDelete(`Opravdu smazat kontejner "${c.name}"?`,            async () => { await axiosInstance.delete(`/api/containers/${c.id}`); setConfirmDelete(null); refreshTab("containers"); });
    const deleteShipment  = (s: Shipment)  => askDelete(`Opravdu smazat shipment "${s.name}"?`,             async () => { await axiosInstance.delete(`/api/shipments/${s.id}`);  setConfirmDelete(null); refreshTab("shipments"); });

    const toggleVerified = async (u: User) => {
        await axiosInstance.patch(`/api/users/${u.id}/verified`, { verified: !u.verified });
        refreshTab("users");
    };

    // ── Stats ───────────────────────────────────────────────────────────────

    const stats = [
        { id: "users"      as Tab, label: "Uživatelé",  value: users.length,      icon: "👥", color: "#3b82f6" },
        { id: "boxes"      as Tab, label: "Boxy",        value: boxes.length,      icon: "📦", color: "#10b981" },
        { id: "containers" as Tab, label: "Kontejnery",  value: containers.length, icon: "🚛", color: "#f59e0b" },
        { id: "shipments"  as Tab, label: "Shipmenty",   value: shipments.length,  icon: "🌍", color: "#8b5cf6" },
    ];

    const tabs: { id: Tab; label: string; icon: string }[] = [
        { id: "users",      label: "Uživatelé",  icon: "👥" },
        { id: "boxes",      label: "Boxy",        icon: "📦" },
        { id: "containers", label: "Kontejnery",  icon: "🚛" },
        { id: "shipments",  label: "Shipmenty",   icon: "🌍" },
    ];

    return (
        <>
            <style>{`
                @keyframes fadeSlide { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes spin { to { transform: rotate(360deg); } }
                .admin-tab-btn { transition: all 0.18s ease; }
                .admin-tab-btn:hover { background: rgba(255,255,255,0.06) !important; }
                .stat-card { transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, border-color 0.2s ease; }
                .stat-card:hover { transform: translateY(-3px); box-shadow: 0 16px 40px rgba(0,0,0,0.4) !important; }
                .verified-toggle { transition: all 0.15s ease; cursor: pointer; }
                .verified-toggle:hover { opacity: 0.8; }
                input[type="text"]::placeholder { color: rgba(148,163,184,0.35); }
            `}</style>

            <Navbar breadcrumb={[{ label: "Home", path: "/" }, { label: "Admin panel" }]} />

            <PageLayout maxWidth={1300}>
                {/* Header */}
                <div style={{ marginBottom: 40, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.08))", border: "1px solid rgba(239,68,68,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🛡️</div>
                            <h1 style={{ fontSize: "2.25rem", fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.04em" }}>Admin Panel</h1>
                        </div>
                        <p style={{ color: "rgba(148,163,184,0.6)", fontSize: "0.9rem", margin: 0 }}>Plná správa systému — uživatelé, boxy, kontejnery, shipmenty</p>
                    </div>
                    <ScopePicker value={scope} onChange={setScope} />
                </div>

                {/* Stats row */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 16, marginBottom: 36 }}>
                    {stats.map((s) => (
                        <div key={s.id} className="stat-card" onClick={() => switchTab(s.id)}
                             style={{ background: activeTab === s.id ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.03)", border: `1px solid ${activeTab === s.id ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.07)"}`, borderRadius: 14, padding: "20px 22px", cursor: "pointer", boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}>
                            <div style={{ fontSize: 26, marginBottom: 10 }}>{s.icon}</div>
                            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: loading ? "rgba(148,163,184,0.25)" : s.color, letterSpacing: "-0.03em", lineHeight: 1, transition: "color 0.3s" }}>
                                {loading ? "—" : s.value}
                            </div>
                            <div style={{ fontSize: "0.8rem", color: "rgba(148,163,184,0.6)", marginTop: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Tab bar */}
                <div style={{ display: "flex", gap: 6, marginBottom: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 6 }}>
                    {tabs.map((t) => (
                        <button key={t.id} className="admin-tab-btn" onClick={() => switchTab(t.id)}
                                style={{ flex: 1, padding: "10px 16px", borderRadius: 8, border: "none", background: activeTab === t.id ? "rgba(255,255,255,0.08)" : "transparent", color: activeTab === t.id ? "#fff" : "rgba(148,163,184,0.6)", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: activeTab === t.id ? "0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)" : "none", transition: "all 0.18s" }}>
                            <span>{t.icon}</span> {t.label}
                            {activeTab === t.id && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#3b82f6", marginLeft: 4 }} />}
                        </button>
                    ))}
                </div>

                {/* Scope notice */}
                <div style={{ marginBottom: 20, padding: "10px 16px", background: scope === "all" ? "rgba(59,130,246,0.07)" : "rgba(255,255,255,0.03)", border: `1px solid ${scope === "all" ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.06)"}`, borderRadius: 10, fontSize: "0.82rem", color: scope === "all" ? "#93c5fd" : "rgba(148,163,184,0.5)", display: "flex", alignItems: "center", gap: 8 }}>
                    {scope === "all" ? "🌐" : "🔒"}
                    {scope === "all" ? "Akce budou viditelné pro všechny uživatele systému." : "Akce budou viditelné pouze pro vás (admin účet)."}
                </div>

                {/* Content */}
                {loading ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0", gap: 16 }}>
                        <div style={{ width: 36, height: 36, border: "3px solid rgba(255,255,255,0.08)", borderTop: "3px solid #3b82f6", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                        <span style={{ color: "rgba(148,163,184,0.5)", fontSize: "0.9rem" }}>Načítám data...</span>
                    </div>
                ) : (
                    <div style={{ animation: "fadeSlide 0.25s ease" }}>

                        {/* Search bar — shared across all tabs */}
                        <SearchBar value={search} onChange={setSearch} total={total} filtered={filtered} />

                        {activeTab === "users" && (
                            <Table
                                data={filteredUsers}
                                columns={[
                                    { key: "id", label: "ID", sortable: true, getValue: (u) => u.id,
                                        render: (u) => <span style={{ color: "rgba(148,163,184,0.5)", fontFamily: "monospace" }}>#{u.id}</span> },
                                    { key: "name", label: "Jméno", sortable: true, getValue: (u) => `${u.name} ${u.surname}`,
                                        render: (u) => (
                                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#3b82f6,#2563eb)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                                                    {u.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <span><Highlight text={`${u.name} ${u.surname}`} query={search} /></span>
                                            </div>
                                        )},
                                    { key: "email", label: "E-mail", sortable: true, getValue: (u) => u.email,
                                        render: (u) => <span style={{ color: "#93c5fd" }}><Highlight text={u.email} query={search} /></span> },
                                    { key: "role", label: "Role", sortable: false,
                                        render: (u) => (
                                            <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 700, background: u.role === "ROLE_ADMIN" ? "rgba(239,68,68,0.12)" : "rgba(59,130,246,0.1)", color: u.role === "ROLE_ADMIN" ? "#fca5a5" : "#93c5fd", border: `1px solid ${u.role === "ROLE_ADMIN" ? "rgba(239,68,68,0.25)" : "rgba(59,130,246,0.2)"}` }}>
                                                {u.role === "ROLE_ADMIN" ? "🛡️ Admin" : "👤 User"}
                                            </span>
                                        )},
                                    { key: "verified", label: "Schválení", sortable: false,
                                        render: (u) => (
                                            <div className="verified-toggle" onClick={() => toggleVerified(u)}
                                                 style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 20, background: u.verified ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.08)", border: `1px solid ${u.verified ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.2)"}`, color: u.verified ? "#6ee7b7" : "#fca5a5", fontSize: "0.78rem", fontWeight: 700 }}>
                                                <div style={{ width: 8, height: 8, borderRadius: "50%", background: u.verified ? "#10b981" : "#ef4444", boxShadow: `0 0 6px ${u.verified ? "#10b981" : "#ef4444"}` }} />
                                                {u.verified ? "Schválen" : "Neschválen"}
                                            </div>
                                        )},
                                ]}
                                actions={[
                                    { label: "Smazat", variant: "danger", onClick: deleteUser },
                                ]}
                            />
                        )}

                        {activeTab === "boxes" && (
                            <Table
                                data={filteredBoxes}
                                columns={[
                                    { key: "id", label: "ID", sortable: true, getValue: (b) => b.id,
                                        render: (b) => <span style={{ color: "rgba(148,163,184,0.5)", fontFamily: "monospace" }}>#{b.id}</span> },
                                    { key: "name", label: "Název", sortable: true, getValue: (b) => b.name,
                                        render: (b) => <Highlight text={b.name} query={search} /> },
                                    { key: "amount", label: "Množství", sortable: true, getValue: (b) => b.amount },
                                    { key: "length", label: "D×Š×V", sortable: false,
                                        render: (b) => <span style={{ color: "rgba(148,163,184,0.7)", fontFamily: "monospace", fontSize: "0.8rem" }}>{b.length}×{b.width}×{b.height}</span> },
                                    { key: "weight", label: "Váha", sortable: true, getValue: (b) => b.weight,
                                        render: (b) => `${b.weight} kg` },
                                    /*{ key: "owner", label: "Vlastník", sortable: false,
                                        render: (b) => <span style={{ color: "#93c5fd", fontSize: "0.82rem" }}>{b.owner?.email ?? "—"}</span> },*/
                                ]}
                                actions={[
                                    { label: "✏️ Upravit", variant: "secondary", onClick: openEditBox },
                                    { label: "Smazat", variant: "danger", onClick: deleteBox },
                                ]}
                            />
                        )}

                        {activeTab === "containers" && (
                            <Table
                                data={filteredContainers}
                                columns={[
                                    { key: "id", label: "ID", sortable: true, getValue: (c) => c.id,
                                        render: (c) => <span style={{ color: "rgba(148,163,184,0.5)", fontFamily: "monospace" }}>#{c.id}</span> },
                                    { key: "name", label: "Název", sortable: true, getValue: (c) => c.name,
                                        render: (c) => <Highlight text={c.name} query={search} /> },
                                    { key: "length", label: "D×Š×V", sortable: false,
                                        render: (c) => <span style={{ color: "rgba(148,163,184,0.7)", fontFamily: "monospace", fontSize: "0.8rem" }}>{c.length}×{c.width}×{c.height}</span> },
                                    { key: "maxWeight", label: "Max. váha", sortable: true, getValue: (c) => c.maxWeight,
                                        render: (c) => `${c.maxWeight} kg` },
                                    /*{ key: "owner", label: "Vlastník", sortable: false,
                                        render: (c) => <span style={{ color: "#93c5fd", fontSize: "0.82rem" }}>{c.owner?.email ?? "—"}</span> },*/
                                ]}
                                actions={[
                                    { label: "✏️ Upravit", variant: "secondary", onClick: openEditContainer },
                                    { label: "Smazat", variant: "danger", onClick: deleteContainer },
                                ]}
                            />
                        )}

                        {activeTab === "shipments" && (
                            <Table
                                data={filteredShipments}
                                columns={[
                                    { key: "id", label: "ID", sortable: true, getValue: (s) => s.id,
                                        render: (s) => <span style={{ color: "rgba(148,163,184,0.5)", fontFamily: "monospace" }}>#{s.id}</span> },
                                    { key: "name", label: "Název", sortable: true, getValue: (s) => s.name,
                                        render: (s) => <Highlight text={s.name} query={search} /> },
                                    { key: "description", label: "Popis", sortable: false,
                                        render: (s) => s.description || "—" },
                                    { key: "containers", label: "Kontejnery", sortable: false,
                                        render: (s) => (
                                            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 28, height: 28, background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)", borderRadius: 8, color: "#93c5fd", fontWeight: 700, fontSize: "0.875rem", padding: "0 8px" }}>
                                                {s.containers?.length ?? 0}
                                            </span>
                                        )},
                                    /*{ key: "owner", label: "Vlastník", sortable: false,
                                        render: (s) => <span style={{ color: "#93c5fd", fontSize: "0.82rem" }}>{s.owner?.email ?? "—"}</span> },*/
                                ]}
                                actions={[
                                    { label: "✏️ Upravit", variant: "secondary", onClick: openEditShipment },
                                    { label: "🔍 Detail", variant: "primary", onClick: (s) => navigate(`/shipments/${s.id}`) },
                                    { label: "Smazat", variant: "danger", onClick: deleteShipment },
                                ]}
                            />
                        )}
                    </div>
                )}
            </PageLayout>

            {confirmDelete && (
                <ConfirmModal
                    message={confirmDelete.message}
                    onConfirm={confirmDelete.onConfirm}
                    onCancel={() => setConfirmDelete(null)}
                />
            )}

            {/* ── Edit Box Modal ─────────────────────────────────────────────── */}
            <EditModal
                isOpen={!!editBox}
                onClose={() => setEditBox(null)}
                onSave={saveBox}
                title={`Upravit box: ${editBox?.name ?? ""}`}
                saveLabel="Uložit změny"
            >
                <InputField label="Název" value={editBoxForm.name} onChange={(v: string | number) => setEditBoxForm(f => ({ ...f, name: String(v) }))} />
                <InputField label="Množství" type="number" value={editBoxForm.amount} onChange={(v: string | number) => setEditBoxForm(f => ({ ...f, amount: Number(v) }))} />
                <InputField label="Délka (cm)" type="number" value={editBoxForm.length} onChange={(v: string | number) => setEditBoxForm(f => ({ ...f, length: Number(v) }))} />
                <InputField label="Šířka (cm)" type="number" value={editBoxForm.width} onChange={(v: string | number) => setEditBoxForm(f => ({ ...f, width: Number(v) }))} />
                <InputField label="Výška (cm)" type="number" value={editBoxForm.height} onChange={(v: string | number) => setEditBoxForm(f => ({ ...f, height: Number(v) }))} />
                <InputField label="Váha (kg)" type="number" value={editBoxForm.weight} onChange={(v: string | number) => setEditBoxForm(f => ({ ...f, weight: Number(v) }))} />
            </EditModal>

            {/* ── Edit Container Modal ───────────────────────────────────────── */}
            <EditModal
                isOpen={!!editContainer}
                onClose={() => setEditContainer(null)}
                onSave={saveContainer}
                title={`Upravit kontejner: ${editContainer?.name ?? ""}`}
                saveLabel="Uložit změny"
            >
                <InputField label="Název" value={editContainerForm.name} onChange={(v: string | number) => setEditContainerForm(f => ({ ...f, name: String(v) }))} />
                <InputField label="Délka (cm)" type="number" value={editContainerForm.length} onChange={(v: string | number) => setEditContainerForm(f => ({ ...f, length: Number(v) }))} />
                <InputField label="Šířka (cm)" type="number" value={editContainerForm.width} onChange={(v: string | number) => setEditContainerForm(f => ({ ...f, width: Number(v) }))} />
                <InputField label="Výška (cm)" type="number" value={editContainerForm.height} onChange={(v: string | number) => setEditContainerForm(f => ({ ...f, height: Number(v) }))} />
                <InputField label="Max. váha (kg)" type="number" value={editContainerForm.maxWeight} onChange={(v: string | number) => setEditContainerForm(f => ({ ...f, maxWeight: Number(v) }))} />
            </EditModal>

            {/* ── Edit Shipment Name Modal ───────────────────────────────────── */}
            <EditModal
                isOpen={!!editShipment}
                onClose={() => setEditShipment(null)}
                onSave={saveShipment}
                title={`Přejmenovat shipment`}
                description="Upravit lze pouze název. Pro ostatní změny použijte stránku detailu."
                saveLabel="Uložit název"
            >
                <InputField label="Název" value={editShipmentName} onChange={(v: string | number) => setEditShipmentName(String(v))} />
            </EditModal>
        </>
    );
}