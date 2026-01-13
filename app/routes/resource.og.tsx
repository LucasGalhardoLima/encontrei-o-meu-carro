import { ImageResponse } from "@vercel/og";
import type { Route } from "./+types/resource.og";

// Load font (optional, using system font or fetching one if needed for consistent look)
// For simplicity we might skip complex font loading or use a standard URL.

export async function loader({ request }: Route.LoaderArgs) {
    const url = new URL(request.url);
    const brand = url.searchParams.get("brand") || "Carro";
    const model = url.searchParams.get("model") || "Desconhecido";
    const year = url.searchParams.get("year") || "2024";
    const badge = url.searchParams.get("badge");
    const price = url.searchParams.get("price");

    return new ImageResponse(
        (
            <div
                style={{
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(to bottom right, #1e293b, #0f172a)",
                    color: "white",
                    fontFamily: 'sans-serif',
                    position: 'relative',
                }}
            >
                {/* Background Pattern */}
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundImage: 'radial-gradient(circle at 25px 25px, rgba(255,255,255,0.1) 2%, transparent 0%)',
                    backgroundSize: '50px 50px',
                }} />

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    zIndex: 10,
                    padding: '40px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '20px',
                    background: 'rgba(0,0,0,0.3)',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                }}>
                    <div style={{
                        display: 'flex',
                        fontSize: 30,
                        textTransform: 'uppercase',
                        letterSpacing: '4px',
                        color: '#94a3b8',
                        marginBottom: 10
                    }}>
                        {brand}
                    </div>

                    <div style={{
                        display: 'flex',
                        fontSize: 80,
                        fontWeight: 900,
                        background: 'linear-gradient(to right, #60a5fa, #a855f7)',
                        backgroundClip: 'text',
                        color: 'transparent',
                        marginBottom: 10,
                        textAlign: 'center',
                        lineHeight: 1,
                    }}>
                        {model}
                    </div>

                    <div style={{ display: 'flex', fontSize: 30, color: '#e2e8f0', marginBottom: 30 }}>
                        {year}
                    </div>

                    {badge && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '10px 30px',
                            background: '#f59e0b',
                            color: 'white',
                            borderRadius: '50px',
                            fontSize: 30,
                            fontWeight: 'bold',
                            boxShadow: '0 4px 20px rgba(245, 158, 11, 0.4)',
                            marginBottom: 20,
                        }}>
                            🏆 {badge}
                        </div>
                    )}

                    {price && (
                        <div style={{ display: 'flex', fontSize: 24, color: '#94a3b8', marginTop: 10 }}>
                            Preço Médio: R$ {parseInt(price).toLocaleString('pt-BR')}
                        </div>
                    )}
                </div>

                <div style={{
                    position: 'absolute',
                    bottom: 30,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10
                }}>
                    <div style={{
                        width: 10, height: 10, background: '#3b82f6', borderRadius: '50%'
                    }} />
                    <span style={{ fontSize: 20, color: '#64748b' }}>encontreomeucarro.com.br</span>
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
        }
    );
}
