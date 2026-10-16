import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Tipsly – Upptäck din stad";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Default social preview for pages that don't define their own. */
export default async function OpengraphImage() {
  const fonts = join(process.cwd(), "src/assets/fonts");
  const [regular, semibold] = await Promise.all([
    readFile(join(fonts, "Geist-Regular.ttf")),
    readFile(join(fonts, "Geist-SemiBold.ttf")),
  ]);
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
          background: "#f5f4ef",
          color: "#1b1b1d",
          fontFamily: "Geist",
        }}
      >
        <div style={{ display: "flex", fontSize: 44, fontWeight: 600, letterSpacing: "-0.045em" }}>
          Tipsly<span style={{ color: "#1f5bff" }}>.</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 96, fontWeight: 600, letterSpacing: "-0.05em", lineHeight: 1 }}>
            Upptäck din stad med Tipsly.
          </div>
          <div style={{ fontSize: 32, color: "#55565b" }}>Lokala företag i 25 svenska städer, samlade på ett ställe.</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Geist", data: regular, weight: 400, style: "normal" },
        { name: "Geist", data: semibold, weight: 600, style: "normal" },
      ],
    },
  );
}
