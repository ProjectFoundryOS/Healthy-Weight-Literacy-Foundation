import { ImageResponse } from "next/og"
export const alt = "WeightLiteracy. Clear answers for weight health."
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: "70px 80px",
          background: "#F5F1E8",
          color: "#173E39",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="68" height="68" viewBox="0 0 44 44">
            <path
              d="M4 11C11 9 16 12 22 17V37C16 32 11 30 4 32V11Z"
              fill="#21645E"
            />
            <path
              d="M22 17C28 11 34 9 40 11V32C33 30 28 32 22 37V17Z"
              fill="#4B8B7E"
            />
            <circle cx="34" cy="5" r="4" fill="#DC987C" />
          </svg>
          <span style={{ fontSize: 44, fontWeight: 700, letterSpacing: -2 }}>
            WeightLiteracy.
          </span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 80,
            fontWeight: 700,
            letterSpacing: -3,
            lineHeight: 1.08,
          }}
        >
          <span>Clear answers</span>
          <span>for weight health.</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 22,
          }}
        >
          <span>Healthy Weight Literacy Foundation</span>
          <span>weightliteracy.org</span>
        </div>
      </div>
    ),
    size,
  )
}
