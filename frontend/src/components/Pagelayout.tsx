import { ReactNode } from "react";

interface PageLayoutProps {
    children: ReactNode;
    maxWidth?: number | string;
}

export default function PageLayout({ children, maxWidth = 1200 }: PageLayoutProps) {
    return (
        <div
            style={{
                minHeight: "calc(100vh - 72px)",
                background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
                position: "relative",
                overflow: "hidden",
                fontFamily: "'Helvetica Neue', -apple-system, BlinkMacSystemFont, sans-serif",
            }}
        >
            {/* Ambient blobs */}
            <div style={{ position: "absolute", top: "10%", right: "15%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(59,130,246,0.12), transparent 70%)", borderRadius: "50%", filter: "blur(70px)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: "15%", left: "8%", width: "320px", height: "320px", background: "radial-gradient(circle, rgba(14,165,233,0.09), transparent 70%)", borderRadius: "50%", filter: "blur(70px)", pointerEvents: "none" }} />

            <style>{`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes scaleIn { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
                * { box-sizing: border-box; }
                input::placeholder { color: rgba(255,255,255,0.25); }
                select option { background: #1e293b; color: rgba(255,255,255,0.9); }
            `}</style>

            <div
                style={{
                    maxWidth,
                    margin: "0 auto",
                    padding: "40px 24px 80px",
                    position: "relative",
                    zIndex: 1,
                    animation: "fadeInUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards",
                }}
            >
                {children}
            </div>

            {/* Footer badge */}
            <div style={{ position: "absolute", bottom: "24px", left: "50%", transform: "translateX(-50%)", color: "rgba(255,255,255,0.2)", fontSize: "0.8rem", letterSpacing: "0.06em", zIndex: 1, whiteSpace: "nowrap" }}>
                Logistics Management System
            </div>
        </div>
    );
}