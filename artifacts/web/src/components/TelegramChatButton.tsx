import { useState } from "react";

export default function TelegramChatButton() {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {hovered && (
        <div
          style={{
            marginBottom: "8px",
            background: "hsl(220 50% 10%)",
            color: "#fff",
            fontSize: "13px",
            fontFamily: "Inter, sans-serif",
            fontWeight: 500,
            padding: "5px 10px",
            borderRadius: "6px",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
          }}
        >
          Chat with Sunny
        </div>
      )}
      <a
        href="https://t.me/sunnykorea_bot"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Sunny on Telegram"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          background: "hsl(215 90% 35%)",
          boxShadow: hovered
            ? "0 8px 24px rgba(10, 60, 140, 0.45)"
            : "0 4px 12px rgba(10, 60, 140, 0.30)",
          transform: hovered ? "scale(1.1)" : "scale(1)",
          transition: "transform 0.18s ease, box-shadow 0.18s ease",
          cursor: "pointer",
          textDecoration: "none",
          border: "none",
          outline: "none",
        }}
      >
        {/* Telegram paper-plane icon */}
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M21.944 2.506a1 1 0 0 0-1.02-.234L2.285 9.368a1 1 0 0 0 .04 1.88l4.498 1.542 1.914 5.944a1 1 0 0 0 1.671.407l2.521-2.521 4.593 3.374a1 1 0 0 0 1.563-.621l3-16a1 1 0 0 0-.141-.867zM16.1 7.41l-6.332 5.826-3.49-1.197L16.1 7.41zm-5.244 7.898-.966-3.003 1.567 1.15-1.08 1.853zm5.698 2.225-4.29-3.15 7.028-6.468-2.738 9.618z"
            fill="#ffffff"
          />
        </svg>
      </a>
    </div>
  );
}
