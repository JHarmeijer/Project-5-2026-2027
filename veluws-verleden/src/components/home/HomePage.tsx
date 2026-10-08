import { useState } from "react";
import { useRouter } from "next/router";

const slots = [
  { id: 1, title: "Romeins kamp", text: "Het begin van de Romeinse aanwezigheid in de Veluwe." },
  { id: 2, title: "Heerweg", text: "Een strategische route voor handel en beweging." },
  { id: 3, title: "Tempel", text: "Een plek van geloof, rituelen en sociale samenkomst." },
  { id: 4, title: "Boerderij", text: "Het dagelijks leven van inwoners en boeren." },
  { id: 5, title: "Waterbron", text: "Een essentiële bron voor de gemeenschap en hun dieren." },
  { id: 6, title: "Wegkruising", text: "Een druk knooppunt tussen verschillende dorpen en routes." },
  { id: 7, title: "Wachttoren", text: "Een plek voor toezicht en bescherming van de omgeving." },
  { id: 8, title: "Bosrand", text: "De natuurlijke grens tussen nederzetting en landschap." },
];

export default function HomePage() {
  const router = useRouter();
  const [activeSlot, setActiveSlot] = useState<(typeof slots)[number] | null>(null);

  return (
    <main style={{ padding: "2rem", maxWidth: 1200, margin: "0 auto" }}>
      <h1 style={{ marginBottom: "2rem", textAlign: "center" }}>Vensters Veluws Verleden</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {slots.map((slot) => (
          <article
            key={slot.id}
            style={{
              border: "1px solid #dfe7f3",
              borderRadius: 18,
              background: "#fff",
              overflow: "hidden",
              boxShadow: "0 8px 20px rgba(15, 23, 42, 0.06)",
            }}
          >
            <button
              type="button"
              onClick={() => setActiveSlot(slot)}
              aria-label={`Open ${slot.title}`}
              style={{
                width: "100%",
                border: "none",
                background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                padding: 0,
                cursor: "pointer",
                display: "block",
              }}
            >
              <div
                style={{
                  height: 180,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#1e3a8a",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  letterSpacing: "0.04em",
                }}
              >
                Afbeelding {slot.id}
              </div>
            </button>

            <div style={{ padding: "1rem 1rem 1.25rem" }}>
              <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.1rem" }}>{slot.title}</h2>
              <p style={{ margin: 0, color: "#374151", lineHeight: 1.5 }}>{slot.text}</p>
            </div>
          </article>
        ))}
      </div>

      {activeSlot && (
        <div
          onClick={() => setActiveSlot(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="schoolplaat-popup-title"
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "min(420px, 100%)",
              background: "#fff",
              borderRadius: 18,
              padding: "2rem 1.5rem 1.5rem",
              boxShadow: "0 25px 60px rgba(15, 23, 42, 0.2)",
              textAlign: "center",
            }}
          >
            <button
              type="button"
              onClick={() => setActiveSlot(null)}
              aria-label="Popup sluiten"
              style={{
                position: "absolute",
                top: 10,
                right: 12,
                border: "none",
                background: "transparent",
                fontSize: "1.5rem",
                cursor: "pointer",
                color: "#1f2937",
              }}
            >
              &times;
            </button>

            <h2 id="schoolplaat-popup-title" style={{ margin: "0 0 0.75rem" }}>
              {activeSlot.title}
            </h2>
            <p style={{ margin: "0 0 1.25rem", color: "#374151", lineHeight: 1.6 }}>
              Je hebt een locatie geselecteerd op de schoolplaat. Klik hieronder om de interactieve
              kaart te laden en meer te ontdekken over dit deel van de Veluwse geschiedenis.
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveSlot(null);
                void router.push("/schoolplaat");
              }}
              style={{
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "0.8rem 1.5rem",
                fontSize: "1rem",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Laad de plaat in
            </button>
          </div>
        </div>
      )}
    </main>
  );
}