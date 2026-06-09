import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const title = url.searchParams.get("title") ?? "KAINOVA";
  const sub = url.searchParams.get("sub") ?? "Isometric play-to-earn realm on Solana";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #060611 0%, #15152e 50%, #0c0c1f 100%)",
          fontFamily: "Georgia, serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Grid of emojis background */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexWrap: "wrap", opacity: 0.08, fontSize: "48px" }}>
          {"🌳🪨⬛💧🐺🐗👺🧟💀🥷🏹👾👹🧙😈🐉".repeat(20).split("").map((e, i) => (
            <span key={i} style={{ margin: "8px" }}>{e}</span>
          ))}
        </div>
        {/* Glow orbs */}
        <div style={{ position: "absolute", top: "-100px", right: "-100px", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(124,92,255,0.3) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "-100px", left: "-100px", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,138,214,0.2) 0%, transparent 70%)" }} />

        {/* Logo row */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
          <span style={{ fontSize: "64px" }}>🧙</span>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "72px", fontWeight: "bold", color: "#f4f1ff", letterSpacing: "-2px" }}>
              KAINOVA
            </span>
          </div>
        </div>

        {/* Main title */}
        <div style={{ fontSize: "36px", color: "#7c5cff", fontWeight: "bold", marginBottom: "16px", textAlign: "center", maxWidth: "900px" }}>
          {title}
        </div>

        {/* Sub */}
        <div style={{ fontSize: "22px", color: "#c3bce0", textAlign: "center", maxWidth: "800px", marginBottom: "48px" }}>
          {sub}
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: "48px" }}>
          {[
            { emoji: "🐉", label: "12 Monster Types" },
            { emoji: "🪙", label: "Real $KAINOVA Rewards" },
            { emoji: "🤖", label: "AI Agent Play" },
          ].map((s) => (
            <div key={s.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "36px" }}>{s.emoji}</span>
              <span style={{ fontSize: "16px", color: "#8a83b0" }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{ position: "absolute", bottom: "32px", display: "flex", alignItems: "center", gap: "12px", color: "#ffce4f", fontSize: "18px" }}>
          <span>kainovaagentgame.vercel.app</span>
          <span style={{ color: "#8a83b0" }}>·</span>
          <span style={{ color: "#8a83b0" }}>$KAINOVA on pump.fun</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
