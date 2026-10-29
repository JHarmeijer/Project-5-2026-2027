import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/router";
import schoolplaatImage from "../../assets/Schoolplaat.jpg";
import useAccessibleDialog from "../../hooks/useAccessibleDialog";

const slots = [
  { id: 1, title: "Vorming van het landschap en de jagers/verzamelaars", place: "Nunspeet", text: "Ontdek hoe het landschap vorm kreeg en hoe jagers-verzamelaars erin leefden.", beschikbaar: false },
  { id: 2, title: "De eerste boeren en hun grafheuvelritueel", place: "Barneveld", text: "Maak kennis met de eerste boeren en hun rituelen rond grafheuvels.", beschikbaar: false },
  { id: 3, title: "Oog in oog met de Romeinen", place: "Ermelo", text: "Ontdek de Romeinse aanwezigheid en het leven op de Veluwe.", beschikbaar: true },
  { id: 4, title: "De ijzersterke middeleeuwen", place: "Apeldoorn", text: "Verken de middeleeuwen en de rol van ijzer in deze periode.", beschikbaar: false },
  { id: 5, title: "Hoe de mens in het landschap ingreep en het Veluws natuurgebied ontstond", place: "Putten", text: "Bekijk hoe menselijk ingrijpen het landschap en het natuurgebied vormde.", beschikbaar: false },
  { id: 6, title: "Beken, sprengen, watermolens in het Veluws landschap", place: "Epe", text: "Volg het water door beken en sprengen naar de watermolens.", beschikbaar: false },
  { id: 7, title: "Het agrarisch landschap van de Veluwe", place: "Staverden", text: "Ontdek hoe landbouw het Veluwse landschap heeft gevormd.", beschikbaar: false },
  { id: 8, title: "Oorlog, vrede en veiligheid op de Veluwe", place: "", text: "Verken de geschiedenis van oorlog, vrede en veiligheid op de Veluwe.", beschikbaar: false },
];

export default function HomePage() {
  const router = useRouter();
  const [activeSlot, setActiveSlot] = useState<(typeof slots)[number] | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeDialog = useCallback(() => setActiveSlot(null), []);
  useAccessibleDialog(Boolean(activeSlot), closeDialog, dialogRef);

  const romeinseCijfers = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

  return (
    <main className="page-shell home-page">
      <header className="page-header">
        <p className="eyebrow">Verhalen uit de Veluwe</p>
        <h1>Veluws Verleden</h1>
        <p className="home-page-intro">
          Ontdek de mensen, plaatsen en gebeurtenissen die het Veluwse landschap hebben gevormd.
        </p>
      </header>

      <section className="home-collection" aria-labelledby="vensters-title">
        <div className="home-collection-heading">
          <h2 id="vensters-title">Ontdek de vensters</h2>
          <p>Kies een thema om het verhaal te bekijken.</p>
        </div>

        <div className="slots-grid">
          {slots.map((slot) => (
            <article key={slot.id} className="slot-card">
              <button
                type="button"
                onClick={() => setActiveSlot(slot)}
                aria-label={`Open ${slot.title}`}
                aria-haspopup="dialog"
                className="slot-button"
              >
                <span
                  className={`slot-art${slot.id === 3 ? " slot-art-schoolplaat" : ""}`}
                  aria-hidden="true"
                >
                  {slot.id === 3 && (
                    <>
                      <Image
                        className="slot-art-background"
                        src={schoolplaatImage}
                        alt=""
                        fill
                        sizes="(max-width: 720px) calc(100vw - 2rem), (max-width: 1200px) 50vw, 600px"
                        quality={75}
                        placeholder="blur"
                      />
                      <span className="slot-art-overlay" />
                    </>
                  )}
                  <span className="slot-art-column" />
                  <span className="slot-image-label">{romeinseCijfers[slot.id - 1]}</span>
                  <span className="slot-art-place">{slot.place || "Veluwe"}</span>
                </span>
              </button>

              <div className="slot-content">
                {slot.beschikbaar && (
                  <span className="slot-status">Interactieve schoolplaat</span>
                )}
                <h3>{slot.title}{slot.place && ` (${slot.place})`}</h3>
                <p>{slot.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {activeSlot && (
        <div className="modal-backdrop" onClick={closeDialog}>
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="schoolplaat-popup-title"
            className="info-modal"
            tabIndex={-1}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeDialog}
              aria-label="Popup sluiten"
              className="modal-close"
            >
              &times;
            </button>

            <h2 id="schoolplaat-popup-title">
              {activeSlot.title}{activeSlot.place && ` (${activeSlot.place})`}
            </h2>
            {activeSlot.beschikbaar ? (
              <>
                <p>Open de interactieve schoolplaat over het Romeinse marskamp in Ermelo.</p>
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => {
                    closeDialog();
                    void router.push("/schoolplaat");
                  }}
                >
                  Open de schoolplaat
                </button>
              </>
            ) : (
              <p>
                Deze interactieve schoolplaat is nog niet beschikbaar. De schoolplaat over
                de Romeinen in Ermelo is wel beschikbaar.
              </p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}