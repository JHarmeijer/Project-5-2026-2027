"use client";
import { useCallback, useRef, useState } from "react";
import useAccessibleDialog from "../../hooks/useAccessibleDialog";

export default function WelkomModal() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeDialog = useCallback(() => setOpen(false), []);
  useAccessibleDialog(open, closeDialog, dialogRef);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Meer informatie
      </button>
      {open && (
        <div
          onClick={closeDialog}
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
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="welkom-titel"
            tabIndex={-1}
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
              onClick={closeDialog}
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
              onClick={closeDialog}
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