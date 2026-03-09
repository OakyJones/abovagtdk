import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "white",
          borderRadius: 40,
        }}
      >
        <svg
          width="140"
          height="140"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Body circle */}
          <circle cx="14" cy="18" r="12" fill="#1B7A6E" />
          {/* Head */}
          <circle cx="14" cy="10" r="7" fill="#FDDCB5" />
          {/* Cap */}
          <path d="M7 9 Q14 4 21 9" fill="#1B7A6E" />
          <rect x="6" y="8.5" width="16" height="2.5" rx="1.25" fill="#155F56" />
          {/* Cap badge */}
          <circle cx="14" cy="7" r="1.5" fill="#F5D84E" />
          {/* Eyes */}
          <circle cx="12" cy="10.5" r="1" fill="#2D3748" />
          <circle cx="16" cy="10.5" r="1" fill="#2D3748" />
          {/* Smile */}
          <path
            d="M11.5 13 Q14 15.5 16.5 13"
            stroke="#2D3748"
            strokeWidth="0.8"
            fill="none"
            strokeLinecap="round"
          />
          {/* Magnifying glass */}
          <circle cx="25" cy="8" r="4.5" stroke="#8B6E4E" strokeWidth="1.5" fill="none" />
          <circle cx="25" cy="8" r="3" fill="#E0F2F1" opacity="0.5" />
          <path d="M21.5 11.5 L19 14" stroke="#8B6E4E" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
