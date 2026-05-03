import { ImageResponse } from "next/og"

export const runtime = "edge"

export const alt = "Drag and Preach | Modern Sermon Planner & Outliner"
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: "linear-gradient(to bottom right, #f0f9ff, #e0f2fe)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 40,
            background: "rgba(186, 230, 253, 0.4)",
            border: "4px solid #bae6fd",
            borderRadius: 32,
            padding: 24,
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#0369a1"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m21 16-4 4-4-4" />
            <path d="M17 20V4" />
            <path d="m3 8 4-4 4 4" />
            <path d="M7 4v16" />
          </svg>
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: "bold",
            color: "#0f172a",
            textAlign: "center",
          }}
        >
          Drag and Preach
        </div>
        <div
          style={{
            fontSize: 32,
            color: "#64748b",
            marginTop: 20,
            textAlign: "center",
            maxWidth: "800px",
          }}
        >
          Effortlessly organize, structure, and export your sermons.
        </div>
      </div>
    ),
    {
      ...size,
    },
  )
}
