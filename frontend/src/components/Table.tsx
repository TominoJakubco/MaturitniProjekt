import { useState } from "react";

interface Column<T> {
    key: string;
    label: string;
    sortable?: boolean;
    render?: (item: T) => React.ReactNode;
    getValue?: (item: T) => string | number;
    width?: string;
    align?: "left" | "center" | "right";
}

interface Action<T> {
    label: string;
    icon?: React.ReactNode;
    onClick: (item: T) => void;
    variant?: "primary" | "secondary" | "danger" | "success";
    hidden?: (item: T) => boolean;
}

interface TableProps<T> {
    data: T[];
    columns: Column<T>[];
    actions?: Action<T>[];
    idKey?: keyof T;
    emptyMessage?: string;
    loading?: boolean;
}

function Table<T extends Record<string, any>>({
                                                  data,
                                                  columns,
                                                  actions = [],
                                                  idKey = "id" as keyof T,
                                                  emptyMessage = "Žádná data k zobrazení",
                                                  loading = false,
                                              }: TableProps<T>) {
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

    const handleSort = (columnKey: string) => {
        if (sortColumn === columnKey) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortColumn(columnKey);
            setSortDirection("asc");
        }
    };

    const sortedData = [...data].sort((a, b) => {
        if (!sortColumn) return 0;
        const column = columns.find((col) => col.key === sortColumn);
        if (!column) return 0;

        let valA: string | number = column.getValue ? column.getValue(a) : a[sortColumn];
        let valB: string | number = column.getValue ? column.getValue(b) : b[sortColumn];

        if (typeof valA === "number" && typeof valB === "number")
            return sortDirection === "asc" ? valA - valB : valB - valA;
        if (typeof valA === "string" && typeof valB === "string")
            return sortDirection === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
        return 0;
    });

    const getActionStyles = (variant?: string) => {
        const base = {
            padding: "8px 16px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "0.8125rem",
            fontWeight: 600,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            letterSpacing: "0.01em",
            fontFamily: "'Helvetica Neue', -apple-system, BlinkMacSystemFont, sans-serif",
            backdropFilter: "blur(10px)",
        };
        switch (variant) {
            case "danger":
                return { ...base, background: "linear-gradient(135deg, rgba(239,68,68,0.15), rgba(220,38,38,0.1))", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.3)", boxShadow: "0 2px 8px rgba(239,68,68,0.1)" };
            case "success":
                return { ...base, background: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.1))", color: "#6ee7b7", border: "1px solid rgba(16,185,129,0.3)", boxShadow: "0 2px 8px rgba(16,185,129,0.1)" };
            case "secondary":
                return { ...base, background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.08)" };
            default:
                return { ...base, background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(37,99,235,0.1))", color: "#93c5fd", border: "1px solid rgba(59,130,246,0.3)", boxShadow: "0 2px 8px rgba(59,130,246,0.1)" };
        }
    };

    const getActionHoverStyles = (variant?: string) => {
        switch (variant) {
            case "danger":
                return { background: "linear-gradient(135deg, rgba(239,68,68,0.25), rgba(220,38,38,0.2))", transform: "translateY(-2px)", boxShadow: "0 8px 20px rgba(239,68,68,0.2)", borderColor: "rgba(239,68,68,0.5)", color: "#fca5a5" };
            case "success":
                return { background: "linear-gradient(135deg, rgba(16,185,129,0.25), rgba(5,150,105,0.2))", transform: "translateY(-2px)", boxShadow: "0 8px 20px rgba(16,185,129,0.2)", borderColor: "rgba(16,185,129,0.5)", color: "#6ee7b7" };
            case "secondary":
                return { background: "rgba(255,255,255,0.08)", transform: "translateY(-2px)", boxShadow: "0 8px 20px rgba(0,0,0,0.2)", borderColor: "rgba(255,255,255,0.15)", color: "#ffffff" };
            default:
                return { background: "linear-gradient(135deg, rgba(59,130,246,0.25), rgba(37,99,235,0.2))", transform: "translateY(-2px)", boxShadow: "0 8px 20px rgba(59,130,246,0.2)", borderColor: "rgba(59,130,246,0.5)", color: "#93c5fd" };
        }
    };

    if (loading) {
        return (
            <div style={{ width: "100%", backgroundColor: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", boxShadow: "0 24px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)", padding: "80px 20px", textAlign: "center" }}>
                <div style={{ display: "inline-block", width: "48px", height: "48px", border: "4px solid rgba(255,255,255,0.1)", borderTop: "4px solid #3b82f6", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                <p style={{ marginTop: "20px", color: "rgba(255,255,255,0.6)", fontSize: "0.9375rem", fontWeight: 500 }}>Načítám data...</p>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ width: "100%", overflowX: "auto", backgroundColor: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", boxShadow: "0 24px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                <tr style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    {columns.map((column) => (
                        <th
                            key={column.key}
                            onClick={() => column.sortable !== false && handleSort(column.key)}
                            style={{ padding: "20px 24px", textAlign: column.align || "left", fontWeight: 600, fontSize: "0.8125rem", color: "rgba(255,255,255,0.5)", cursor: column.sortable !== false ? "pointer" : "default", userSelect: "none", whiteSpace: "nowrap", transition: "all 0.2s", width: column.width, letterSpacing: "0.05em", textTransform: "uppercase" }}
                            onMouseEnter={(e) => { if (column.sortable !== false) { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; } }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: column.align === "center" ? "center" : column.align === "right" ? "flex-end" : "flex-start" }}>
                                {column.label}
                                {column.sortable !== false && sortColumn === column.key && (
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: sortDirection === "desc" ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                                        <path d="M6 3L9 7H3L6 3Z" fill="#3b82f6" />
                                    </svg>
                                )}
                            </div>
                        </th>
                    ))}
                    {actions.length > 0 && (
                        <th style={{ padding: "20px 24px", textAlign: "right", fontWeight: 600, fontSize: "0.8125rem", color: "rgba(255,255,255,0.5)", whiteSpace: "nowrap", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                            Akce
                        </th>
                    )}
                </tr>
                </thead>
                <tbody>
                {sortedData.map((item, index) => (
                    <tr
                        key={item[idKey]}
                        style={{ borderBottom: index === sortedData.length - 1 ? "none" : "1px solid rgba(255,255,255,0.04)", transition: "all 0.2s" }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                    >
                        {columns.map((column) => (
                            <td key={column.key} style={{ padding: "20px 24px", fontSize: "0.9375rem", color: "rgba(255,255,255,0.9)", textAlign: column.align || "left", fontWeight: 500, letterSpacing: "0.01em" }}>
                                {column.render ? column.render(item) : item[column.key]?.toString() || "-"}
                            </td>
                        ))}
                        {actions.length > 0 && (
                            <td style={{ padding: "20px 24px", textAlign: "right" }}>
                                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                                    {actions.filter((action) => !action.hidden || !action.hidden(item)).map((action, actionIndex) => (
                                        <button
                                            key={actionIndex}
                                            onClick={() => action.onClick(item)}
                                            style={getActionStyles(action.variant)}
                                            onMouseEnter={(e) => { Object.assign(e.currentTarget.style, getActionHoverStyles(action.variant)); }}
                                            onMouseLeave={(e) => { Object.assign(e.currentTarget.style, getActionStyles(action.variant)); }}
                                            onMouseDown={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
                                            onMouseUp={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                                        >
                                            {action.icon && <span style={{ display: "flex", alignItems: "center" }}>{action.icon}</span>}
                                            {action.label}
                                        </button>
                                    ))}
                                </div>
                            </td>
                        )}
                    </tr>
                ))}
                </tbody>
            </table>
            {sortedData.length === 0 && (
                <div style={{ padding: "80px 20px", textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: "0.9375rem" }}>
                    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ margin: "0 auto 20px", opacity: 0.3, color: "rgba(255,255,255,0.2)", display: "block" }}>
                        <rect x="8" y="16" width="48" height="40" rx="4" stroke="currentColor" strokeWidth="2" />
                        <path d="M16 28h32M16 36h32M16 44h24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <p style={{ fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: "8px", fontSize: "1rem" }}>{emptyMessage}</p>
                    <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.4)", margin: 0 }}>Začněte přidáním nových záznamů</p>
                </div>
            )}
        </div>
    );
}

export { Table };