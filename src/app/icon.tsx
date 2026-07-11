import { ImageResponse } from "next/og";

/**
 * The stencilled "N" plate from the header, generated at runtime so no binary
 * icon asset needs committing. Serves the favicon and the manifest icons.
 */
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#EFF1E8",
        }}
      >
        <div
          style={{
            width: 384,
            height: 384,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "26px solid #155744",
            borderRadius: 30,
            color: "#155744",
            fontSize: 230,
            fontWeight: 700,
            boxShadow: "20px 20px 0 rgba(89,82,59,.35)",
            fontFamily: "Georgia, serif",
          }}
        >
          N
        </div>
      </div>
    ),
    { ...size },
  );
}
