import { useState } from "react";
import { ReactNode } from "react";

// ----------------------
// Table Component (Updated)
// ----------------------
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

        let valA: string | number;
        let valB: string | number;

        if (column.getValue) {
            valA = column.getValue(a);
            valB = column.getValue(b);
        } else {
            valA = a[sortColumn];
            valB = b[sortColumn];
        }

        if (typeof valA === "number" && typeof valB === "number") {
            return sortDirection === "asc" ? valA - valB : valB - valA;
        }

        if (typeof valA === "string" && typeof valB === "string") {
            return sortDirection === "asc"
                ? valA.localeCompare(valB)
                : valB.localeCompare(valA);
        }

        return 0;
    });

    const getActionStyles = (variant?: string) => {
        const baseStyles = {
            padding: "8px 16px",
            borderRadius: "8px",
            border: "none",
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
                return {
                    ...baseStyles,
                    background: "linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.1))",
                    color: "#fca5a5",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    boxShadow: "0 2px 8px rgba(239, 68, 68, 0.1)",
                };
            case "success":
                return {
                    ...baseStyles,
                    background: "linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.1))",
                    color: "#6ee7b7",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    boxShadow: "0 2px 8px rgba(16, 185, 129, 0.1)",
                };
            case "secondary":
                return {
                    ...baseStyles,
                    background: "rgba(255, 255, 255, 0.04)",
                    color: "rgba(255, 255, 255, 0.7)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                };
            default:
                return {
                    ...baseStyles,
                    background: "linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.1))",
                    color: "#93c5fd",
                    border: "1px solid rgba(59, 130, 246, 0.3)",
                    boxShadow: "0 2px 8px rgba(59, 130, 246, 0.1)",
                };
        }
    };

    const getActionHoverStyles = (variant?: string) => {
        switch (variant) {
            case "danger":
                return {
                    background: "linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(220, 38, 38, 0.2))",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 20px rgba(239, 68, 68, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1)",
                    borderColor: "rgba(239, 68, 68, 0.5)",
                    color: "#fca5a5",
                };
            case "success":
                return {
                    background: "linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(5, 150, 105, 0.2))",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 20px rgba(16, 185, 129, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1)",
                    borderColor: "rgba(16, 185, 129, 0.5)",
                    color: "#6ee7b7",
                };
            case "secondary":
                return {
                    background: "rgba(255, 255, 255, 0.08)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1)",
                    borderColor: "rgba(255, 255, 255, 0.15)",
                    color: "#ffffff",
                };
            default:
                return {
                    background: "linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(37, 99, 235, 0.2))",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 20px rgba(59, 130, 246, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1)",
                    borderColor: "rgba(59, 130, 246, 0.5)",
                    color: "#93c5fd",
                };
        }
    };

    if (loading) {
        return (
            <div
                style={{
                    width: "100%",
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "12px",
                    boxShadow: "0 24px 60px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                    padding: "80px 20px",
                    textAlign: "center",
                }}
            >
                <div
                    style={{
                        display: "inline-block",
                        width: "48px",
                        height: "48px",
                        border: "4px solid rgba(255, 255, 255, 0.1)",
                        borderTop: "4px solid #3b82f6",
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                    }}
                />
                <p
                    style={{
                        marginTop: "20px",
                        color: "rgba(255, 255, 255, 0.6)",
                        fontSize: "0.9375rem",
                        fontWeight: 500,
                        letterSpacing: "0.01em",
                    }}
                >
                    Načítám data...
                </p>
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div
            style={{
                width: "100%",
                overflowX: "auto",
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "12px",
                boxShadow: "0 24px 60px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
            }}
        >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                <tr
                    style={{
                        background: "rgba(255, 255, 255, 0.04)",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                    }}
                >
                    {columns.map((column) => (
                        <th
                            key={column.key}
                            onClick={() =>
                                column.sortable !== false && handleSort(column.key)
                            }
                            style={{
                                padding: "20px 24px",
                                textAlign: column.align || "left",
                                fontWeight: 600,
                                fontSize: "0.8125rem",
                                color: "rgba(255, 255, 255, 0.5)",
                                cursor: column.sortable !== false ? "pointer" : "default",
                                userSelect: "none",
                                whiteSpace: "nowrap",
                                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                                width: column.width,
                                letterSpacing: "0.05em",
                                textTransform: "uppercase",
                            }}
                            onMouseEnter={(e) => {
                                if (column.sortable !== false) {
                                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                                    e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)";
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "transparent";
                                e.currentTarget.style.color = "rgba(255, 255, 255, 0.5)";
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    justifyContent:
                                        column.align === "center"
                                            ? "center"
                                            : column.align === "right"
                                                ? "flex-end"
                                                : "flex-start",
                                }}
                            >
                                {column.label}
                                {column.sortable !== false &&
                                    sortColumn === column.key && (
                                        <svg
                                            width="12"
                                            height="12"
                                            viewBox="0 0 12 12"
                                            fill="none"
                                            style={{
                                                transform:
                                                    sortDirection === "desc"
                                                        ? "rotate(180deg)"
                                                        : "none",
                                                transition: "transform 0.2s",
                                            }}
                                        >
                                            <path d="M6 3L9 7H3L6 3Z" fill="#3b82f6" />
                                        </svg>
                                    )}
                            </div>
                        </th>
                    ))}
                    {actions.length > 0 && (
                        <th
                            style={{
                                padding: "20px 24px",
                                textAlign: "right",
                                fontWeight: 600,
                                fontSize: "0.8125rem",
                                color: "rgba(255, 255, 255, 0.5)",
                                whiteSpace: "nowrap",
                                letterSpacing: "0.05em",
                                textTransform: "uppercase",
                            }}
                        >
                            Akce
                        </th>
                    )}
                </tr>
                </thead>
                <tbody>
                {sortedData.map((item, index) => (
                    <tr
                        key={item[idKey]}
                        style={{
                            borderBottom:
                                index === sortedData.length - 1
                                    ? "none"
                                    : "1px solid rgba(255, 255, 255, 0.04)",
                            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.03)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                        }}
                    >
                        {columns.map((column) => (
                            <td
                                key={column.key}
                                style={{
                                    padding: "20px 24px",
                                    fontSize: "0.9375rem",
                                    color: "rgba(255, 255, 255, 0.9)",
                                    textAlign: column.align || "left",
                                    fontWeight: 500,
                                    letterSpacing: "0.01em",
                                }}
                            >
                                {column.render
                                    ? column.render(item)
                                    : item[column.key]?.toString() || "-"}
                            </td>
                        ))}
                        {actions.length > 0 && (
                            <td style={{ padding: "20px 24px", textAlign: "right" }}>
                                <div
                                    style={{
                                        display: "flex",
                                        gap: "8px",
                                        flexWrap: "wrap",
                                        justifyContent: "flex-end",
                                    }}
                                >
                                    {actions
                                        .filter(
                                            (action) =>
                                                !action.hidden || !action.hidden(item)
                                        )
                                        .map((action, actionIndex) => (
                                            <button
                                                key={actionIndex}
                                                onClick={() => action.onClick(item)}
                                                style={getActionStyles(action.variant)}
                                                onMouseEnter={(e) => {
                                                    Object.assign(
                                                        e.currentTarget.style,
                                                        getActionHoverStyles(action.variant)
                                                    );
                                                }}
                                                onMouseLeave={(e) => {
                                                    Object.assign(
                                                        e.currentTarget.style,
                                                        getActionStyles(action.variant)
                                                    );
                                                }}
                                                onMouseDown={(e) => {
                                                    e.currentTarget.style.transform =
                                                        "translateY(0)";
                                                }}
                                                onMouseUp={(e) => {
                                                    e.currentTarget.style.transform =
                                                        "translateY(-2px)";
                                                }}
                                            >
                                                {action.icon && (
                                                    <span
                                                        style={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                        }}
                                                    >
                                                        {action.icon}
                                                    </span>
                                                )}
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
                <div
                    style={{
                        padding: "80px 20px",
                        textAlign: "center",
                        color: "rgba(255, 255, 255, 0.4)",
                        fontSize: "0.9375rem",
                    }}
                >
                    <svg
                        width="64"
                        height="64"
                        viewBox="0 0 64 64"
                        fill="none"
                        style={{
                            margin: "0 auto 20px",
                            opacity: 0.3,
                            color: "rgba(255, 255, 255, 0.2)",
                        }}
                    >
                        <rect
                            x="8"
                            y="16"
                            width="48"
                            height="40"
                            rx="4"
                            stroke="currentColor"
                            strokeWidth="2"
                        />
                        <path
                            d="M16 28h32M16 36h32M16 44h24"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                    </svg>
                    <p
                        style={{
                            fontWeight: 600,
                            color: "rgba(255, 255, 255, 0.6)",
                            marginBottom: "8px",
                            fontSize: "1rem",
                            letterSpacing: "0.01em",
                        }}
                    >
                        {emptyMessage}
                    </p>
                    <p
                        style={{
                            fontSize: "0.875rem",
                            color: "rgba(255, 255, 255, 0.4)",
                            margin: 0,
                            letterSpacing: "0.01em",
                        }}
                    >
                        Začněte přidáním nových záznamů
                    </p>
                </div>
            )}
        </div>
    );
}

// ----------------------
// Input Field Component (Updated)
// ----------------------
interface InputFieldProps {
    label?: string;
    placeholder?: string;
    type?: "text" | "number" | "email" | "password";
    value: string | number;
    onChange: (value: string | number) => void;
    required?: boolean;
    disabled?: boolean;
    error?: string;
}

function InputField({
                        label,
                        placeholder,
                        type = "text",
                        value,
                        onChange,
                        required = false,
                        disabled = false,
                        error,
                    }: InputFieldProps) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {label && (
                <label
                    style={{
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: "rgba(255, 255, 255, 0.7)",
                        letterSpacing: "-0.01em",
                    }}
                >
                    {label}
                    {required && <span style={{ color: "#ef4444", marginLeft: "2px" }}>*</span>}
                </label>
            )}
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                disabled={disabled}
                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
                    const value = type === "number" ? Number(e.target.value) : e.target.value;
                    onChange(value);
                }}
                style={{
                    padding: "14px 16px",
                    borderRadius: "8px",
                    border: error
                        ? "1.5px solid rgba(239, 68, 68, 0.5)"
                        : "1.5px solid rgba(255, 255, 255, 0.1)",
                    fontSize: "0.9375rem",
                    outline: "none",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    fontFamily: "'Helvetica Neue', -apple-system, BlinkMacSystemFont, sans-serif",
                    background: disabled
                        ? "rgba(255, 255, 255, 0.02)"
                        : "rgba(255, 255, 255, 0.05)",
                    color: disabled ? "rgba(255, 255, 255, 0.3)" : "rgba(255, 255, 255, 0.9)",
                    cursor: disabled ? "not-allowed" : "text",
                    backdropFilter: "blur(10px)",
                    boxShadow: "0 1px 0 rgba(0, 0, 0, 0.1)",
                }}
                onFocus={(e) => {
                    if (!disabled && !error) {
                        e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.5)";
                        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)";
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                    }
                }}
                onBlur={(e) => {
                    e.currentTarget.style.borderColor = error
                        ? "rgba(239, 68, 68, 0.5)"
                        : "rgba(255, 255, 255, 0.1)";
                    e.currentTarget.style.boxShadow = "0 1px 0 rgba(0, 0, 0, 0.1)";
                    e.currentTarget.style.background = disabled
                        ? "rgba(255, 255, 255, 0.02)"
                        : "rgba(255, 255, 255, 0.05)";
                }}
            />
            {error && (
                <span style={{
                    fontSize: "0.8125rem",
                    color: "#fca5a5",
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                        <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2"/>
                        <line x1="12" y1="16" x2="12" y2="16" strokeWidth="2"/>
                    </svg>
                    {error}
                </span>
            )}
        </div>
    );
}

// ----------------------
// Button Component (Updated)
// ----------------------
interface ButtonProps {
    children: ReactNode;
    onClick: () => void;
    variant?: "primary" | "secondary" | "success" | "danger" | "outline";
    disabled?: boolean;
    icon?: ReactNode;
    fullWidth?: boolean;
    size?: "sm" | "md" | "lg";
}

function Button({
                    children,
                    onClick,
                    variant = "primary",
                    disabled = false,
                    icon,
                    fullWidth = false,
                    size = "md",
                }: ButtonProps) {
    const getButtonStyles = () => {
        const sizeStyles = {
            sm: { padding: "10px 18px", fontSize: "0.875rem" },
            md: { padding: "12px 24px", fontSize: "0.9375rem" },
            lg: { padding: "16px 32px", fontSize: "1rem" },
        };

        const baseStyles = {
            ...sizeStyles[size],
            border: "none",
            borderRadius: "8px",
            cursor: disabled ? "not-allowed" : "pointer",
            fontWeight: 600,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            width: fullWidth ? "100%" : "auto",
            opacity: disabled ? 0.5 : 1,
            fontFamily: "'Helvetica Neue', -apple-system, BlinkMacSystemFont, sans-serif",
            letterSpacing: "-0.01em",
            backdropFilter: "blur(10px)",
            boxShadow: disabled ? "none" : "0 1px 2px rgba(0, 0, 0, 0.1)",
        };

        switch (variant) {
            case "success":
                return {
                    ...baseStyles,
                    background: "linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.1))",
                    color: "#6ee7b7",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                };
            case "danger":
                return {
                    ...baseStyles,
                    background: "linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.1))",
                    color: "#fca5a5",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                };
            case "secondary":
                return {
                    ...baseStyles,
                    background: "rgba(255, 255, 255, 0.04)",
                    color: "rgba(255, 255, 255, 0.7)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                };
            case "outline":
                return {
                    ...baseStyles,
                    background: "transparent",
                    color: "#3b82f6",
                    border: "1.5px solid rgba(59, 130, 246, 0.5)",
                };
            default:
                return {
                    ...baseStyles,
                    background: "linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.1))",
                    color: "#93c5fd",
                    border: "1px solid rgba(59, 130, 246, 0.3)",
                };
        }
    };

    const getHoverStyles = () => {
        if (disabled) return {};
        switch (variant) {
            case "success":
                return {
                    background: "linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(5, 150, 105, 0.2))",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 20px rgba(16, 185, 129, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1)",
                    borderColor: "rgba(16, 185, 129, 0.5)",
                    color: "#6ee7b7",
                };
            case "danger":
                return {
                    background: "linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(220, 38, 38, 0.2))",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 20px rgba(239, 68, 68, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1)",
                    borderColor: "rgba(239, 68, 68, 0.5)",
                    color: "#fca5a5",
                };
            case "secondary":
                return {
                    background: "rgba(255, 255, 255, 0.08)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1)",
                    borderColor: "rgba(255, 255, 255, 0.15)",
                    color: "#ffffff",
                };
            case "outline":
                return {
                    background: "rgba(59, 130, 246, 0.1)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 20px rgba(59, 130, 246, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1)",
                    borderColor: "rgba(59, 130, 246, 0.7)",
                    color: "#60a5fa",
                };
            default:
                return {
                    background: "linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(37, 99, 235, 0.2))",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 20px rgba(59, 130, 246, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1)",
                    borderColor: "rgba(59, 130, 246, 0.5)",
                    color: "#93c5fd",
                };
        }
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            style={getButtonStyles()}
            onMouseEnter={(e) => {
                if (!disabled) Object.assign(e.currentTarget.style, getHoverStyles());
            }}
            onMouseLeave={(e) => {
                if (!disabled) Object.assign(e.currentTarget.style, getButtonStyles());
            }}
            onMouseDown={(e) => {
                if (!disabled) e.currentTarget.style.transform = "translateY(0)";
            }}
            onMouseUp={(e) => {
                if (!disabled) e.currentTarget.style.transform = "translateY(-2px)";
            }}
        >
            {icon && <span style={{ display: "flex", alignItems: "center" }}>{icon}</span>}
            {children}
        </button>
    );
}

// ----------------------
// Create Form Component (Updated)
// ----------------------
interface CreateFormProps {
    title: string;
    description?: string;
    children: ReactNode;
    onSubmit: () => void;
    submitLabel?: string;
    submitIcon?: ReactNode;
    cancelLabel?: string;
    onCancel?: () => void;
}

function CreateForm({
                        title,
                        description,
                        children,
                        onSubmit,
                        submitLabel = "Přidat",
                        submitIcon,
                        cancelLabel = "Zrušit",
                        onCancel,
                    }: CreateFormProps) {
    return (
        <div
            style={{
                background: "rgba(255, 255, 255, 0.03)",
                backdropFilter: "blur(20px)",
                padding: "32px",
                borderRadius: "16px",
                boxShadow: "0 24px 60px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                marginBottom: "32px",
                animation: "scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            }}
        >
            <style>{`
                @keyframes scaleIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
            `}</style>
            <div style={{ marginBottom: "28px" }}>
                <h2
                    style={{
                        fontSize: "1.5rem",
                        fontWeight: 700,
                        color: "rgba(255, 255, 255, 0.95)",
                        marginBottom: description ? "8px" : "0",
                        letterSpacing: "-0.02em",
                    }}
                >
                    {title}
                </h2>
                {description && (
                    <p style={{
                        fontSize: "0.9375rem",
                        color: "rgba(255, 255, 255, 0.6)",
                        margin: 0,
                        lineHeight: "1.5"
                    }}>
                        {description}
                    </p>
                )}
            </div>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: "20px",
                    marginBottom: "28px",
                }}
            >
                {children}
            </div>
            <div style={{
                display: "flex",
                gap: "12px",
                paddingTop: "12px",
                borderTop: "1px solid rgba(255, 255, 255, 0.08)"
            }}>
                <Button onClick={onSubmit} variant="primary" icon={submitIcon} size="md">
                    {submitLabel}
                </Button>
                {onCancel && (
                    <Button onClick={onCancel} variant="secondary" size="md">
                        {cancelLabel}
                    </Button>
                )}
            </div>
        </div>
    );
}

// ----------------------
// Edit Modal Component (Updated)
// ----------------------
interface EditModalProps {
    title: string;
    description?: string;
    children: ReactNode;
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    saveLabel?: string;
    saveIcon?: ReactNode;
    cancelLabel?: string;
    cancelIcon?: ReactNode;
}

function EditModal({
                       title,
                       description,
                       children,
                       isOpen,
                       onClose,
                       onSave,
                       saveLabel = "Uložit změny",
                       saveIcon,
                       cancelLabel = "Zrušit",
                       cancelIcon,
                   }: EditModalProps) {
    if (!isOpen) return null;

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                backdropFilter: "blur(4px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
                padding: "20px",
                animation: "fadeIn 0.2s ease-out",
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    backdropFilter: "blur(40px)",
                    borderRadius: "20px",
                    padding: "40px",
                    maxWidth: "800px",
                    width: "100%",
                    maxHeight: "90vh",
                    overflowY: "auto",
                    boxShadow: "0 32px 64px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ marginBottom: "32px" }}>
                    <h3
                        style={{
                            fontSize: "1.75rem",
                            fontWeight: 700,
                            color: "rgba(255, 255, 255, 0.95)",
                            marginBottom: description ? "12px" : "0",
                            letterSpacing: "-0.02em",
                            lineHeight: "1.2",
                        }}
                    >
                        {title}
                    </h3>
                    {description && (
                        <p style={{
                            fontSize: "1rem",
                            color: "rgba(255, 255, 255, 0.6)",
                            margin: 0,
                            lineHeight: "1.5"
                        }}>
                            {description}
                        </p>
                    )}
                </div>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                        gap: "20px",
                        marginBottom: "40px",
                    }}
                >
                    {children}
                </div>
                <div style={{
                    display: "flex",
                    gap: "16px",
                    paddingTop: "24px",
                    borderTop: "1px solid rgba(255, 255, 255, 0.08)"
                }}>
                    <Button onClick={onSave} variant="success" icon={saveIcon} size="md" fullWidth>
                        {saveLabel}
                    </Button>
                    <Button onClick={onClose} variant="secondary" icon={cancelIcon} size="md" fullWidth>
                        {cancelLabel}
                    </Button>
                </div>
            </div>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { 
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to { 
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}

export { InputField, Button, CreateForm, EditModal, Table };