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
    <main className="page-shell home-page">
      <header className="page-header">
        <p className="eyebrow">Veluws Verleden</p>
        <h1>Vensters Veluws Verleden</h1>
      </header>

      <section className="slots-grid" aria-label="Historische thema's">
        {slots.map((slot) => (
          <article key={slot.id} className="slot-card">
            <button
              type="button"
              onClick={() => setActiveSlot(slot)}
              aria-label={`Open ${slot.title}`}
              className="slot-button"
            >
              <span className="slot-image-label">Afbeelding {slot.id}</span>
            </button>

            <div className="slot-content">
              <h2>{slot.title}</h2>
              <p>{slot.text}</p>
            </div>
          </article>
        ))}
      </section>

      {activeSlot && (
        <div className="modal-backdrop" onClick={() => setActiveSlot(null)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="schoolplaat-popup-title"
            className="info-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveSlot(null)}
              aria-label="Popup sluiten"
              className="modal-close"
            >
              &times;
            </button>

            <h2 id="schoolplaat-popup-title">{activeSlot.title}</h2>
            <p>
              Je hebt een locatie geselecteerd op de schoolplaat. Klik hieronder om de interactieve
              kaart te laden en meer te ontdekken over dit deel van de Veluwse geschiedenis.
            </p>
            <button
              type="button"
              className="primary-button"
              onClick={() => {
                setActiveSlot(null);
                void router.push("/schoolplaat");
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