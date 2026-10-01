"use client";

import { useEffect, useState } from "react";

export default function WelkomModal() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!sessionStorage.getItem("welkomGezien")) {
            setOpen(true);
        }
    }, []);

    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    function sluiten() {
        sessionStorage.setItem("welkomGezien", "true");
        setOpen(false);
    }
    
    if (!open) return null;

    return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welkom-titel"
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
        style={{
          background: "white",
          color: "#111",
          padding: "2rem",
          borderRadius: "12px",
          maxWidth: "420px",
          width: "90%",
          textAlign: "center",
        }}
      >
        <h2 id="welkom-titel">Hey, welkom op deze pagina! 👋</h2>
        <p>Hier staat wat extra info over de site. Klik op de knop om verder te gaan.</p>
        <button
          onClick={sluiten}
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
  );
}