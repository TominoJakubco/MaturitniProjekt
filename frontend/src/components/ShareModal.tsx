import { useState, useEffect, useRef } from "react";
import axiosInstance from "../app/axiosInstance";

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    resourceId: number;
    resourceType: "shipments" | "containers" | "boxes"; // extend as needed
    resourceName?: string;
}

interface ShareFormState {
    email: string;
    canView: boolean;
    canEdit: boolean;
}

export default function ShareModal({
                                       isOpen,
                                       onClose,
                                       resourceId,
                                       resourceType,
                                       resourceName,
                                   }: ShareModalProps) {
    const [form, setForm] = useState<ShareFormState>({
        email: "",
        canView: true,
        canEdit: false,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
            setForm({ email: "", canView: true, canEdit: false });
            setError("");
            setSuccess("");
        }
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [isOpen, onClose]);

    // Prevent body scroll
    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === overlayRef.current) onClose();
    };

    const handleShare = async () => {
        setError("");
        setSuccess("");

        if (!form.email.trim()) {
            setError("Zadejte e-mail uživatele.");
            return;
        }
        if (!form.canView && !form.canEdit) {
            setError("Vyberte alespoň jedno oprávnění.");
            return;
        }

        setLoading(true);
        try {
            // First resolve email -> userId
            const userRes = await axiosInstance.get(`/api/users/by-email`, {
                params: { email: form.email.trim() },
            });
            const targetUserId: number = userRes.data.id;

            // Then share
            await axiosInstance.post(`/api/${resourceType}/${resourceId}/share`, null, {
                params: {
                    targetUserId,
                    canView: form.canView,
                    canEdit: form.canEdit,
                },
            });

            setSuccess(`Zásilka byla sdílena s ${form.email}.`);
            setForm({ email: "", canView: true, canEdit: false });
        } catch (err: any) {
            if (err.response?.status === 404) {
                setError("Uživatel s tímto e-mailem nebyl nalezen.");
            } else if (err.response?.status === 403) {
                setError("Nemáte oprávnění sdílet tento zdroj.");
            } else {
                setError("Sdílení se nezdařilo. Zkuste to znovu.");
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            ref={overlayRef}
            onClick={handleOverlayClick}
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 1000,
                background: "rgba(0, 0, 0, 0.65)",
                backdropFilter: "blur(6px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "16px",
                animation: "fadeIn 0.15s ease",
            }}
        >
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(16px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .share-modal-input:focus {
                    outline: none;
                    border-color: rgba(59,130,246,0.7) !important;
                    box-shadow: 0 0 0 3px rgba(59,130,246,0.15) !important;
                }
                .share-modal-input::placeholder {
                    color: rgba(148,163,184,0.5);
                }
                .share-perm-btn {
                    cursor: pointer;
                    transition: all 0.15s ease;
                    user-select: none;
                }
                .share-perm-btn:hover {
                    border-color: rgba(59,130,246,0.5) !important;
                }
                .share-submit-btn:hover:not(:disabled) {
                    background: rgba(59,130,246,0.25) !important;
                    border-color: rgba(59,130,246,0.6) !important;
                }
                .share-submit-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .share-cancel-btn:hover {
                    background: rgba(255,255,255,0.05) !important;
                }
                .share-close-btn:hover {
                    background: rgba(255,255,255,0.08) !important;
                    color: #ffffff !important;
                }
            `}</style>

            <div
                style={{
                    background: "linear-gradient(145deg, #0f172a 0%, #0c1425 100%)",
                    border: "1px solid rgba(59,130,246,0.2)",
                    borderRadius: "16px",
                    width: "100%",
                    maxWidth: "440px",
                    boxShadow: "0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.05)",
                    animation: "slideUp 0.2s ease",
                    overflow: "hidden",
                }}
            >
                {/* Header */}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "20px 24px 0",
                }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "2px" }}>
                            <div style={{
                                width: "32px", height: "32px",
                                background: "rgba(59,130,246,0.12)",
                                border: "1px solid rgba(59,130,246,0.25)",
                                borderRadius: "8px",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "15px",
                            }}>
                                🔗
                            </div>
                            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#f1f5f9", margin: 0, letterSpacing: "-0.02em" }}>
                                Sdílet zásilku
                            </h2>
                        </div>
                        {resourceName && (
                            <p style={{ fontSize: "0.78rem", color: "rgba(148,163,184,0.6)", margin: "6px 0 0 42px" }}>
                                {resourceName}
                            </p>
                        )}
                    </div>

                    <button
                        className="share-close-btn"
                        onClick={onClose}
                        style={{
                            background: "transparent",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: "8px",
                            width: "32px", height: "32px",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer",
                            color: "rgba(148,163,184,0.7)",
                            fontSize: "14px",
                            transition: "all 0.15s ease",
                            flexShrink: 0,
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Divider */}
                <div style={{ height: "1px", background: "rgba(255,255,255,0.05)", margin: "18px 0" }} />

                {/* Body */}
                <div style={{ padding: "0 24px 24px" }}>

                    {/* Email input */}
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "rgba(148,163,184,0.8)", marginBottom: "8px", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                        E-mail uživatele
                    </label>
                    <input
                        ref={inputRef}
                        className="share-modal-input"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                        onKeyDown={(e) => e.key === "Enter" && handleShare()}
                        placeholder="uzivatel@example.com"
                        style={{
                            width: "100%",
                            padding: "11px 14px",
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "10px",
                            color: "#e2e8f0",
                            fontSize: "0.9rem",
                            transition: "all 0.15s ease",
                            boxSizing: "border-box",
                        }}
                        disabled={loading}
                    />

                    {/* Permissions */}
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "rgba(148,163,184,0.8)", margin: "18px 0 10px", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                        Oprávnění
                    </label>
                    <div style={{ display: "flex", gap: "10px" }}>
                        {[
                            { key: "canView", label: "Zobrazit", icon: "👁️", desc: "Může prohlížet obsah" },
                            { key: "canEdit", label: "Upravovat", icon: "✏️", desc: "Může měnit obsah" },
                        ].map(({ key, label, icon, desc }) => {
                            const active = form[key as keyof ShareFormState] as boolean;
                            return (
                                <div
                                    key={key}
                                    className="share-perm-btn"
                                    onClick={() => !loading && setForm(f => ({ ...f, [key]: !active }))}
                                    style={{
                                        flex: 1,
                                        padding: "12px 14px",
                                        background: active ? "rgba(59,130,246,0.12)" : "rgba(255,255,255,0.03)",
                                        border: `1px solid ${active ? "rgba(59,130,246,0.4)" : "rgba(255,255,255,0.08)"}`,
                                        borderRadius: "10px",
                                        cursor: loading ? "not-allowed" : "pointer",
                                        opacity: loading ? 0.6 : 1,
                                    }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "4px" }}>
                                        <span style={{ fontSize: "13px" }}>{icon}</span>
                                        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: active ? "#93c5fd" : "#94a3b8" }}>{label}</span>
                                        <div style={{
                                            marginLeft: "auto",
                                            width: "16px", height: "16px",
                                            borderRadius: "4px",
                                            border: `1px solid ${active ? "rgba(59,130,246,0.5)" : "rgba(255,255,255,0.15)"}`,
                                            background: active ? "rgba(59,130,246,0.3)" : "transparent",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: "10px",
                                            color: active ? "#93c5fd" : "transparent",
                                            transition: "all 0.15s ease",
                                        }}>
                                            ✓
                                        </div>
                                    </div>
                                    <p style={{ fontSize: "0.72rem", color: "rgba(148,163,184,0.5)", margin: 0 }}>{desc}</p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Feedback messages */}
                    {error && (
                        <div style={{
                            marginTop: "14px",
                            padding: "10px 14px",
                            background: "rgba(239,68,68,0.08)",
                            border: "1px solid rgba(239,68,68,0.25)",
                            borderRadius: "8px",
                            color: "#fca5a5",
                            fontSize: "0.83rem",
                            display: "flex", alignItems: "center", gap: "8px",
                        }}>
                            <span>⚠️</span> {error}
                        </div>
                    )}
                    {success && (
                        <div style={{
                            marginTop: "14px",
                            padding: "10px 14px",
                            background: "rgba(34,197,94,0.08)",
                            border: "1px solid rgba(34,197,94,0.25)",
                            borderRadius: "8px",
                            color: "#86efac",
                            fontSize: "0.83rem",
                            display: "flex", alignItems: "center", gap: "8px",
                        }}>
                            <span>✅</span> {success}
                        </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                        <button
                            className="share-cancel-btn"
                            onClick={onClose}
                            style={{
                                flex: 1,
                                padding: "11px",
                                background: "rgba(255,255,255,0.03)",
                                border: "1px solid rgba(255,255,255,0.08)",
                                borderRadius: "10px",
                                color: "#94a3b8",
                                fontSize: "0.88rem",
                                fontWeight: 500,
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                            }}
                        >
                            Zrušit
                        </button>
                        <button
                            className="share-submit-btn"
                            onClick={handleShare}
                            disabled={loading}
                            style={{
                                flex: 2,
                                padding: "11px",
                                background: "rgba(59,130,246,0.15)",
                                border: "1px solid rgba(59,130,246,0.4)",
                                borderRadius: "10px",
                                color: "#93c5fd",
                                fontSize: "0.88rem",
                                fontWeight: 600,
                                cursor: loading ? "not-allowed" : "pointer",
                                transition: "all 0.15s ease",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                            }}
                        >
                            {loading ? (
                                <>
                                    <span style={{ width: "14px", height: "14px", border: "2px solid rgba(147,197,253,0.3)", borderTopColor: "#93c5fd", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
                                    Sdílím…
                                </>
                            ) : (
                                <>🔗 Sdílet</>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}