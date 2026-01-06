import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Call this hook in any page/layout component.
 * It checks the JWT exp claim on mount and every 60 s,
 * and navigates to /login the moment the token expires.
 */
export function useAuthGuard() {
    const navigate = useNavigate();

    useEffect(() => {
        const check = () => {
            const token = localStorage.getItem("token");
            if (!token) { navigate("/login"); return; }

            try {
                const payload = JSON.parse(atob(token.split(".")[1]));
                const expMs = payload.exp * 1000;
                if (Date.now() >= expMs) {
                    localStorage.removeItem("token");
                    navigate("/login");
                }
            } catch {
                localStorage.removeItem("token");
                navigate("/login");
            }
        };

        check(); // immediate check on mount
        const interval = setInterval(check, 60_000); // re-check every minute
        return () => clearInterval(interval);
    }, [navigate]);
}