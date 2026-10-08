"use client";
import { useEffect, useState } from "react";

export default function WelkomModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Meer informatie
      </button>
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="welkom-titel"
            onClick={(event) => event.stopPropagation()}
            style={{
              position: "relative",
              background: "white",
              color: "#111",
              padding: "2rem",
              borderRadius: "12px",
              maxWidth: "420px",
              width: "90%",
              textAlign: "center",
            }}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Popup sluiten"
              style={{
                position: "absolute",
                top: "0.5rem",
                right: "0.75rem",
                border: "none",
                background: "transparent",
                color: "#111",
                fontSize: "1.5rem",
                cursor: "pointer",
              }}
            >
              &times;
            </button>
            <h2 id="welkom-titel">Hey, welkom op deze pagina!</h2>
            <p>Hier staat wat extra info over de site.</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                marginTop: "1rem",
                padding: "0.6rem 1.4rem",
                borderRadius: "8px",
                border: "none",
                background: "#2563eb",
                color: "white",
                cursor: "pointer",
              }}
            >
              Verder naar de site
            </button>
          </div>
        </div>
      )}
    </>
  );
}