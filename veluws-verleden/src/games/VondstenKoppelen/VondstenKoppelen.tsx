import { useRef, useState } from "react";
import useAccessibleDialog from "../../hooks/useAccessibleDialog";

const voorwerpen = [
  { id: "kraal", naam: "Meloenkraal", afbeelding: "/images/game-items/meloenkraal.svg" },
  { id: "schild", naam: "Schild", afbeelding: "/images/game-items/schild.svg" },
  { id: "graan", naam: "Graan", afbeelding: "/images/game-items/graan.svg" },
  { id: "kamp", naam: "Legertent", afbeelding: "/images/game-items/legertent.svg" },
];

const omschrijvingen = [
  { id: "kamp", tekst: "Hier konden soldaten slapen en schuilen." },
  { id: "kraal", tekst: "Deze geribbelde versiering lijkt op een meloen." },
  { id: "graan", tekst: "Dit gewas hoorde bij het boerenleven op de Veluwe." },
  { id: "schild", tekst: "Een soldaat kon dit gebruiken om zich te beschermen." },
];

export default function VondstenKoppelen({ onClose }: { onClose: () => void }) {
  const [gekoppeld, setGekoppeld] = useState<Record<string, string>>({});
  const [gekozen, setGekozen] = useState<string | null>(null);
  const [melding, setMelding] = useState("Kies een afbeelding en tik op de passende omschrijving, of sleep de afbeelding ernaartoe.");
  const dialogRef = useRef<HTMLElement>(null);
  useAccessibleDialog(true, onClose, dialogRef);

  function koppel(omschrijvingId: string, voorwerpId: string | null = gekozen) {
    if (!voorwerpId || gekoppeld[omschrijvingId]) return;
    if (voorwerpId !== omschrijvingId) {
      setMelding("Dat past niet helemaal. Probeer het nog eens!");
      return;
    }

    const nieuweKoppelingen = { ...gekoppeld, [omschrijvingId]: voorwerpId };
    setGekoppeld(nieuweKoppelingen);
    setGekozen(null);
    setMelding(
      Object.keys(nieuweKoppelingen).length === voorwerpen.length
        ? "Alles gevonden! Je hebt alle voorwerpen goed gekoppeld."
        : "Goed gekoppeld! Zoek het volgende voorwerp.",
    );
  }

  return (
    <div className="quiz-backdrop" onClick={onClose}>
      <section
        ref={dialogRef}
        className="quiz-dialog matching-game"
        role="dialog"
        aria-modal="true"
        aria-labelledby="matching-game-title"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <button className="quiz-close" type="button" onClick={onClose} aria-label="Koppelspel sluiten">
          &times;
        </button>
        <p className="eyebrow">Kijk goed naar de vondsten</p>
        <h2 id="matching-game-title">Sleep de vondst naar de omschrijving</h2>
        <p className="matching-instructions">
          Sleep een plaatje naar de juiste tekst. Liever tikken? Kies eerst een plaatje en daarna een omschrijving.
        </p>
        <div className="matching-board">
          <div className="matching-items" aria-label="Afbeeldingen van vondsten">
            {voorwerpen.map((voorwerp) => {
              const isGekoppeld = Boolean(gekoppeld[voorwerp.id]);
              return (
                <button
                  key={voorwerp.id}
                  type="button"
                  className={`matching-item${gekozen === voorwerp.id ? " is-selected" : ""}${isGekoppeld ? " is-matched" : ""}`}
                  draggable={!isGekoppeld}
                  aria-pressed={gekozen === voorwerp.id}
                  disabled={isGekoppeld}
                  onClick={() => {
                    setGekozen(voorwerp.id);
                    setMelding(`${voorwerp.naam} gekozen. Tik nu op de juiste omschrijving.`);
                  }}
                  onDragStart={(event) => {
                    setGekozen(voorwerp.id);
                    event.dataTransfer.setData("text/plain", voorwerp.id);
                    event.dataTransfer.effectAllowed = "move";
                  }}
                >
                  <img className="matching-picture" src={voorwerp.afbeelding} alt="" draggable={false} />
                  <span>{voorwerp.naam}</span>
                </button>
              );
            })}
          </div>
          <div className="matching-targets" aria-label="Omschrijvingen">
            {omschrijvingen.map((omschrijving, index) => {
              const isGekoppeld = Boolean(gekoppeld[omschrijving.id]);
              return (
                <button
                  key={omschrijving.id}
                  type="button"
                  className={`matching-target${isGekoppeld ? " is-matched" : ""}`}
                  disabled={isGekoppeld}
                  onClick={() => koppel(omschrijving.id)}
                  onDragOver={(event) => {
                    if (!isGekoppeld) event.preventDefault();
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    koppel(omschrijving.id, event.dataTransfer.getData("text/plain") || gekozen);
                  }}
                  aria-label={`Omschrijving ${index + 1}: ${omschrijving.tekst}${isGekoppeld ? ", goed gekoppeld" : ""}`}
                >
                  <span className="matching-number">{index + 1}</span>
                  <span>{omschrijving.tekst}</span>
                  {isGekoppeld && <span className="matching-check" aria-hidden="true">✓</span>}
                </button>
              );
            })}
          </div>
        </div>
        <p className="matching-feedback" role="status" aria-live="polite">{melding}</p>
        {Object.keys(gekoppeld).length === voorwerpen.length && (
          <button
            type="button"
            className="quiz-primary-button"
            onClick={() => {
              setGekoppeld({});
              setGekozen(null);
              setMelding("Kies een afbeelding en tik op de passende omschrijving, of sleep de afbeelding ernaartoe.");
            }}
          >
            Speel nog een keer
          </button>
        )}
      </section>
    </div>
  );
}
