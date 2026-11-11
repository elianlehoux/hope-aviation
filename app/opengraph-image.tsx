import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Hope Aviation: formación gratuita para la aviación misionera";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Share card for links to the site (WhatsApp, social networks, chats). Brand: navy band, amber accent. */
export default async function OpenGraphImage() {
  // The logo's paths have no fill (black by default); paint them white for the navy card.
  const svg = (await readFile(join(process.cwd(), "public/logos/hope-logo.svg"), "utf8")).replace("<svg ", '<svg fill="#ffffff" ');
  const logo = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#00263e",
          color: "#ffffff",
        }}
      >
        {/* viewBox is 1680 × 516 */}
        <img src={logo} width={260} height={80} alt="" />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", width: 72, height: 6, borderRadius: 3, background: "#ffaa00", marginBottom: 32 }} />
          <div style={{ display: "flex", fontSize: 72, fontWeight: 600, lineHeight: 1.05, letterSpacing: "-0.03em" }}>
            No enseñamos a volar.
          </div>
          <div style={{ display: "flex", fontSize: 72, fontWeight: 600, lineHeight: 1.05, letterSpacing: "-0.03em", color: "#ffaa00" }}>
            Te preparamos para servir.
          </div>
          <div style={{ display: "flex", marginTop: 28, fontSize: 30, lineHeight: 1.35, color: "rgba(255,255,255,0.8)", maxWidth: 900 }}>
            Campus virtual gratuito de formación complementaria para la aviación misionera.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
