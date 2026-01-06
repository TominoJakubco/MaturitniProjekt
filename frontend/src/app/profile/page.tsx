import { useEffect, useState } from "react";
import axiosInstance from "../axiosInstance";
import Navbar from "../../components/Navbar";
import { InputField, EditModal } from "../../components/FormComponents";

interface User {
    id?: number;
    email: string;
    name: string;
    surname: string;
    role: "USER" | "ADMIN";
}

interface PasswordDTO {
    password: string;
}

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editMode, setEditMode] = useState(false);
    const [passwordMode, setPasswordMode] = useState(false);
    const [passwordInput, setPasswordInput] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const fetchCurrentUser = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get<User>("/api/users/me");
            setUser(res.data);
            setError("");
        } catch (err: any) {
            setError("Nepodařilo se načíst uživatelské informace");
            handleApiError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCurrentUser();
    }, []);

    const handleApiError = (error: any) => {
        if (error.response?.status === 401) {
            alert('Nejste přihlášeni');
            window.location.href = "/login";
        } else if (error.response?.status === 403) {
            alert('Nemáte dostatečná oprávnění');
        } else {
            alert('Došlo k chybě: ' + error.message);
        }
    };

    const handleUpdateUser = async () => {
        if (!user?.id) return;

        if (!user.email || !user.name || !user.surname) {
            alert("Vyplňte všechny povinné údaje!");
            return;
        }

        try {
            await axiosInstance.put(`/api/users/${user.id}`, {
                email: user.email,
                name: user.name,
                surname: user.surname,
                role: user.role
            });
            alert("Uživatelské údaje byly aktualizovány!");
            setEditMode(false);
            fetchCurrentUser();
        } catch (err) {
            console.error(err);
            handleApiError(err);
        }
    };

    const handleChangePassword = async () => {
        if (!user?.id) return;

        setPasswordError("");

        if (!passwordInput.trim()) {
            setPasswordError("Zadejte nové heslo!");
            return;
        }

        if (passwordInput !== confirmPassword) {
            setPasswordError("Hesla se neshodují!");
            return;
        }

        if (passwordInput.length < 6) {
            setPasswordError("Heslo musí mít alespoň 6 znaků!");
            return;
        }

        try {
            await axiosInstance.put(`/api/users/pass/${user.id}`, {
                password: passwordInput,
            });
            alert("Heslo bylo úspěšně změněno!");
            setPasswordInput("");
            setConfirmPassword("");
            setPasswordMode(false);
            setPasswordError("");
        } catch (err) {
            console.error("Chyba při změně hesla:", err);
            handleApiError(err);
        }
    };

    if (loading) {
        return (
            <>
                <Navbar
                    breadcrumb={[
                        { label: "Home", path: "../" },
                        { label: "Můj profil" }
                    ]}
                />
                <div style={{
                    minHeight: "calc(100vh - 72px)",
                    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
                    padding: "80px 32px",
                    textAlign: "center",
                    position: "relative",
                }}>
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
                    <p style={{
                        marginTop: "20px",
                        color: "rgba(255, 255, 255, 0.6)",
                        fontSize: "0.9375rem",
                        fontWeight: 500,
                        letterSpacing: "0.01em",
                    }}>
                        Načítám uživatelské informace...
                    </p>
                    <style>{`
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}</style>
                </div>
            </>
        );
    }

    if (error || !user) {
        return (
            <>
                <Navbar
                    breadcrumb={[
                        { label: "Home", path: "../" },
                        { label: "Můj profil" }
                    ]}
                />
                <div style={{
                    minHeight: "calc(100vh - 72px)",
                    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "40px 32px",
                    textAlign: "center"
                }}>
                    <div style={{
                        backgroundColor: "rgba(255, 255, 255, 0.03)",
                        backdropFilter: "blur(20px)",
                        padding: "40px",
                        borderRadius: "16px",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        boxShadow: "0 24px 60px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                        maxWidth: "500px",
                        width: "100%"
                    }}>
                        <div style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.1))",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 20px",
                            border: "1px solid rgba(239, 68, 68, 0.3)"
                        }}>
                            <span style={{ fontSize: "1.5rem" }}>⚠️</span>
                        </div>
                        <p style={{
                            color: "rgba(255, 255, 255, 0.9)",
                            fontSize: "1.125rem",
                            fontWeight: 600,
                            marginBottom: "8px"
                        }}>
                            {error || "Uživatel nenalezen"}
                        </p>
                        <p style={{
                            color: "rgba(255, 255, 255, 0.6)",
                            fontSize: "0.9375rem",
                            marginBottom: "24px"
                        }}>
                            Zkuste to prosím znovu
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                padding: "12px 24px",
                                background: "linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.1))",
                                color: "#93c5fd",
                                border: "1px solid rgba(59, 130, 246, 0.3)",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontSize: "0.9375rem",
                                fontWeight: 600,
                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                backdropFilter: "blur(10px)",
                                width: "100%",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(37, 99, 235, 0.2))";
                                e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.5)";
                                e.currentTarget.style.transform = "translateY(-2px)";
                                e.currentTarget.style.boxShadow = "0 8px 20px rgba(59, 130, 246, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.1))";
                                e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.3)";
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "none";
                            }}
                        >
                            ⟳ Zkusit znovu
                        </button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar
                breadcrumb={[
                    { label: "Home", path: "../" },
                    { label: "Můj profil" }
                ]}
            />

            <div style={{
                minHeight: "calc(100vh - 72px)",
                background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
                padding: "40px 32px",
                position: "relative",
                overflow: "hidden",
            }}>
                {/* Animated background elements */}
                <div
                    style={{
                        position: "absolute",
                        top: "20%",
                        right: "10%",
                        width: "300px",
                        height: "300px",
                        background: "radial-gradient(circle, rgba(59, 130, 246, 0.1), transparent 70%)",
                        borderRadius: "50%",
                        filter: "blur(60px)",
                        animation: "float 8s ease-in-out infinite",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        bottom: "20%",
                        left: "10%",
                        width: "250px",
                        height: "250px",
                        background: "radial-gradient(circle, rgba(14, 165, 233, 0.08), transparent 70%)",
                        borderRadius: "50%",
                        filter: "blur(60px)",
                        animation: "float 10s ease-in-out infinite reverse",
                    }}
                />

                <style>{`
                    @keyframes float {
                        0%, 100% { transform: translateY(0px) translateX(0px); }
                        50% { transform: translateY(-20px) translateX(15px); }
                    }
                    
                    @keyframes fadeInUp {
                        from {
                            opacity: 0;
                            transform: translateY(20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                `}</style>

                <div style={{
                    maxWidth: "1200px",
                    margin: "0 auto",
                    position: "relative",
                    zIndex: 1,
                    animation: "fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                }}>
                    <h1 style={{
                        fontSize: "2.5rem",
                        fontWeight: 700,
                        marginBottom: "40px",
                        color: "rgba(255, 255, 255, 0.95)",
                        letterSpacing: "-0.02em",
                    }}>
                        Můj profil
                    </h1>

                    <div style={{
                        background: "rgba(255, 255, 255, 0.03)",
                        backdropFilter: "blur(20px)",
                        padding: "40px",
                        borderRadius: "20px",
                        boxShadow: "0 24px 60px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        marginBottom: "32px",
                    }}>
                        {/* Zobrazení informací */}
                        {!editMode && !passwordMode && (
                            <>
                                <div style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                                    gap: "28px",
                                    marginBottom: "40px"
                                }}>
                                    <div>
                                        <div style={{
                                            fontSize: "0.875rem",
                                            fontWeight: 600,
                                            color: "rgba(255, 255, 255, 0.5)",
                                            marginBottom: "8px",
                                            letterSpacing: "0.02em",
                                            textTransform: "uppercase"
                                        }}>
                                            Email
                                        </div>
                                        <div style={{
                                            fontSize: "1.125rem",
                                            fontWeight: 500,
                                            color: "rgba(255, 255, 255, 0.95)",
                                            padding: "12px 16px",
                                            background: "rgba(255, 255, 255, 0.04)",
                                            borderRadius: "8px",
                                            border: "1px solid rgba(255, 255, 255, 0.08)",
                                            backdropFilter: "blur(10px)",
                                        }}>
                                            {user.email}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{
                                            fontSize: "0.875rem",
                                            fontWeight: 600,
                                            color: "rgba(255, 255, 255, 0.5)",
                                            marginBottom: "8px",
                                            letterSpacing: "0.02em",
                                            textTransform: "uppercase"
                                        }}>
                                            Role
                                        </div>
                                        <div style={{
                                            fontSize: "1.125rem",
                                            fontWeight: 500,
                                            color: user.role === "ADMIN" ? "#93c5fd" : "rgba(255, 255, 255, 0.95)",
                                            padding: "12px 16px",
                                            background: user.role === "ADMIN"
                                                ? "linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.1))"
                                                : "rgba(255, 255, 255, 0.04)",
                                            borderRadius: "8px",
                                            border: user.role === "ADMIN"
                                                ? "1px solid rgba(59, 130, 246, 0.3)"
                                                : "1px solid rgba(255, 255, 255, 0.08)",
                                            backdropFilter: "blur(10px)",
                                            display: "inline-block",
                                            minWidth: "120px",
                                            textAlign: "center"
                                        }}>
                                            {user.role === "ADMIN" ? "Administrátor" : "Uživatel"}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{
                                            fontSize: "0.875rem",
                                            fontWeight: 600,
                                            color: "rgba(255, 255, 255, 0.5)",
                                            marginBottom: "8px",
                                            letterSpacing: "0.02em",
                                            textTransform: "uppercase"
                                        }}>
                                            Jméno
                                        </div>
                                        <div style={{
                                            fontSize: "1.125rem",
                                            fontWeight: 500,
                                            color: "rgba(255, 255, 255, 0.95)",
                                            padding: "12px 16px",
                                            background: "rgba(255, 255, 255, 0.04)",
                                            borderRadius: "8px",
                                            border: "1px solid rgba(255, 255, 255, 0.08)",
                                            backdropFilter: "blur(10px)",
                                        }}>
                                            {user.name}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{
                                            fontSize: "0.875rem",
                                            fontWeight: 600,
                                            color: "rgba(255, 255, 255, 0.5)",
                                            marginBottom: "8px",
                                            letterSpacing: "0.02em",
                                            textTransform: "uppercase"
                                        }}>
                                            Příjmení
                                        </div>
                                        <div style={{
                                            fontSize: "1.125rem",
                                            fontWeight: 500,
                                            color: "rgba(255, 255, 255, 0.95)",
                                            padding: "12px 16px",
                                            background: "rgba(255, 255, 255, 0.04)",
                                            borderRadius: "8px",
                                            border: "1px solid rgba(255, 255, 255, 0.08)",
                                            backdropFilter: "blur(10px)",
                                        }}>
                                            {user.surname}
                                        </div>
                                    </div>
                                </div>

                                <div style={{
                                    display: "flex",
                                    gap: "16px",
                                    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                                    paddingTop: "32px",
                                    flexWrap: "wrap"
                                }}>
                                    <button
                                        onClick={() => setEditMode(true)}
                                        style={{
                                            padding: "14px 28px",
                                            background: "linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.1))",
                                            color: "#93c5fd",
                                            border: "1px solid rgba(59, 130, 246, 0.3)",
                                            borderRadius: "8px",
                                            cursor: "pointer",
                                            fontSize: "0.9375rem",
                                            fontWeight: 600,
                                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px",
                                            backdropFilter: "blur(10px)",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = "linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(37, 99, 235, 0.2))";
                                            e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.5)";
                                            e.currentTarget.style.transform = "translateY(-2px)";
                                            e.currentTarget.style.boxShadow = "0 8px 20px rgba(59, 130, 246, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = "linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.1))";
                                            e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.3)";
                                            e.currentTarget.style.transform = "translateY(0)";
                                            e.currentTarget.style.boxShadow = "none";
                                        }}
                                    >
                                        <span style={{ fontSize: "1.1rem" }}>✏️</span>
                                        Upravit údaje
                                    </button>

                                    <button
                                        onClick={() => setPasswordMode(true)}
                                        style={{
                                            padding: "14px 28px",
                                            background: "rgba(255, 255, 255, 0.04)",
                                            color: "rgba(255, 255, 255, 0.8)",
                                            border: "1px solid rgba(255, 255, 255, 0.08)",
                                            borderRadius: "8px",
                                            cursor: "pointer",
                                            fontSize: "0.9375rem",
                                            fontWeight: 600,
                                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px",
                                            backdropFilter: "blur(10px)",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                                            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
                                            e.currentTarget.style.transform = "translateY(-2px)";
                                            e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1)";
                                            e.currentTarget.style.color = "#ffffff";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                                            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                                            e.currentTarget.style.transform = "translateY(0)";
                                            e.currentTarget.style.boxShadow = "none";
                                            e.currentTarget.style.color = "rgba(255, 255, 255, 0.8)";
                                        }}
                                    >
                                        <span style={{ fontSize: "1.1rem" }}>🔑</span>
                                        Změnit heslo
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Režim úpravy údajů */}
                        {editMode && (
                            <div style={{ marginBottom: "24px" }}>
                                <h3 style={{
                                    fontSize: "1.5rem",
                                    fontWeight: 600,
                                    marginBottom: "28px",
                                    color: "rgba(255, 255, 255, 0.95)",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px"
                                }}>
                                    <span style={{ fontSize: "1.3rem" }}>✏️</span>
                                    Upravit údaje
                                </h3>

                                <div style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                                    gap: "20px",
                                    marginBottom: "32px"
                                }}>
                                    <InputField
                                        label="Email"
                                        value={user.email}
                                        onChange={(v) => setUser({ ...user, email: v as string })}
                                        required
                                    />
                                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                        <label style={{
                                            fontSize: "0.875rem",
                                            fontWeight: 600,
                                            color: "rgba(255, 255, 255, 0.7)",
                                            letterSpacing: "-0.01em",
                                        }}>
                                            Role
                                        </label>
                                        <div style={{
                                            padding: "14px 16px",
                                            borderRadius: "8px",
                                            border: "1.5px solid rgba(255, 255, 255, 0.1)",
                                            fontSize: "0.9375rem",
                                            background: "rgba(255, 255, 255, 0.04)",
                                            color: "rgba(255, 255, 255, 0.6)",
                                            backdropFilter: "blur(10px)",
                                        }}>
                                            {user.role === "ADMIN" ? "Administrátor" : "Uživatel"}
                                        </div>
                                    </div>
                                    <InputField
                                        label="Jméno"
                                        value={user.name}
                                        onChange={(v) => setUser({ ...user, name: v as string })}
                                        required
                                    />
                                    <InputField
                                        label="Příjmení"
                                        value={user.surname}
                                        onChange={(v) => setUser({ ...user, surname: v as string })}
                                        required
                                    />
                                </div>

                                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                                    <button
                                        onClick={handleUpdateUser}
                                        style={{
                                            padding: "14px 28px",
                                            background: "linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.1))",
                                            color: "#6ee7b7",
                                            border: "1px solid rgba(16, 185, 129, 0.3)",
                                            borderRadius: "8px",
                                            cursor: "pointer",
                                            fontSize: "0.9375rem",
                                            fontWeight: 600,
                                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px",
                                            backdropFilter: "blur(10px)",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = "linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(5, 150, 105, 0.2))";
                                            e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.5)";
                                            e.currentTarget.style.transform = "translateY(-2px)";
                                            e.currentTarget.style.boxShadow = "0 8px 20px rgba(16, 185, 129, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = "linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.1))";
                                            e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.3)";
                                            e.currentTarget.style.transform = "translateY(0)";
                                            e.currentTarget.style.boxShadow = "none";
                                        }}
                                    >
                                        <span style={{ fontSize: "1.1rem" }}>💾</span>
                                        Uložit změny
                                    </button>

                                    <button
                                        onClick={() => setEditMode(false)}
                                        style={{
                                            padding: "14px 28px",
                                            background: "rgba(255, 255, 255, 0.04)",
                                            color: "rgba(255, 255, 255, 0.8)",
                                            border: "1px solid rgba(255, 255, 255, 0.08)",
                                            borderRadius: "8px",
                                            cursor: "pointer",
                                            fontSize: "0.9375rem",
                                            fontWeight: 600,
                                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px",
                                            backdropFilter: "blur(10px)",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                                            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
                                            e.currentTarget.style.transform = "translateY(-2px)";
                                            e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1)";
                                            e.currentTarget.style.color = "#ffffff";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                                            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                                            e.currentTarget.style.transform = "translateY(0)";
                                            e.currentTarget.style.boxShadow = "none";
                                            e.currentTarget.style.color = "rgba(255, 255, 255, 0.8)";
                                        }}
                                    >
                                        <span style={{ fontSize: "1.1rem" }}>❌</span>
                                        Zrušit
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Režim změny hesla */}
                        {passwordMode && (
                            <div style={{ marginBottom: "24px" }}>
                                <h3 style={{
                                    fontSize: "1.5rem",
                                    fontWeight: 600,
                                    marginBottom: "28px",
                                    color: "rgba(255, 255, 255, 0.95)",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px"
                                }}>
                                    <span style={{ fontSize: "1.3rem" }}>🔑</span>
                                    Změnit heslo
                                </h3>

                                <div style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                                    gap: "20px",
                                    marginBottom: "32px",
                                    maxWidth: "600px"
                                }}>
                                    <InputField
                                        label="Nové heslo"
                                        type="password"
                                        value={passwordInput}
                                        onChange={(v) => setPasswordInput(v as string)}
                                        required
                                    />
                                    <InputField
                                        label="Potvrďte heslo"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(v) => setConfirmPassword(v as string)}
                                        required
                                    />
                                </div>

                                {passwordError && (
                                    <div style={{
                                        color: "#fca5a5",
                                        fontSize: "0.875rem",
                                        marginBottom: "20px",
                                        padding: "12px 16px",
                                        background: "rgba(239, 68, 68, 0.1)",
                                        borderRadius: "8px",
                                        border: "1px solid rgba(239, 68, 68, 0.3)",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        backdropFilter: "blur(10px)",
                                    }}>
                                        <span style={{ fontSize: "1rem" }}>⚠️</span>
                                        {passwordError}
                                    </div>
                                )}

                                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                                    <button
                                        onClick={handleChangePassword}
                                        style={{
                                            padding: "14px 28px",
                                            background: "linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.1))",
                                            color: "#93c5fd",
                                            border: "1px solid rgba(59, 130, 246, 0.3)",
                                            borderRadius: "8px",
                                            cursor: "pointer",
                                            fontSize: "0.9375rem",
                                            fontWeight: 600,
                                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px",
                                            backdropFilter: "blur(10px)",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = "linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(37, 99, 235, 0.2))";
                                            e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.5)";
                                            e.currentTarget.style.transform = "translateY(-2px)";
                                            e.currentTarget.style.boxShadow = "0 8px 20px rgba(59, 130, 246, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = "linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.1))";
                                            e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.3)";
                                            e.currentTarget.style.transform = "translateY(0)";
                                            e.currentTarget.style.boxShadow = "none";
                                        }}
                                    >
                                        <span style={{ fontSize: "1.1rem" }}>💾</span>
                                        Uložit nové heslo
                                    </button>

                                    <button
                                        onClick={() => {
                                            setPasswordMode(false);
                                            setPasswordInput("");
                                            setConfirmPassword("");
                                            setPasswordError("");
                                        }}
                                        style={{
                                            padding: "14px 28px",
                                            background: "rgba(255, 255, 255, 0.04)",
                                            color: "rgba(255, 255, 255, 0.8)",
                                            border: "1px solid rgba(255, 255, 255, 0.08)",
                                            borderRadius: "8px",
                                            cursor: "pointer",
                                            fontSize: "0.9375rem",
                                            fontWeight: 600,
                                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px",
                                            backdropFilter: "blur(10px)",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                                            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
                                            e.currentTarget.style.transform = "translateY(-2px)";
                                            e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1)";
                                            e.currentTarget.style.color = "#ffffff";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                                            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                                            e.currentTarget.style.transform = "translateY(0)";
                                            e.currentTarget.style.boxShadow = "none";
                                            e.currentTarget.style.color = "rgba(255, 255, 255, 0.8)";
                                        }}
                                    >
                                        <span style={{ fontSize: "1.1rem" }}>❌</span>
                                        Zrušit
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Badge */}
                <div
                    style={{
                        position: "absolute",
                        bottom: "32px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        color: "rgba(255, 255, 255, 0.2)",
                        fontSize: "0.85rem",
                        letterSpacing: "0.05em",
                        zIndex: 1,
                    }}
                >
                    Profile Management System
                </div>
            </div>
        </>
    );
}