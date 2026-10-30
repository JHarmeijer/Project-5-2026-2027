import { useRef, useState } from "react";
import Confetti from "../../components/Confetti";
import useAccessibleDialog from "../../hooks/useAccessibleDialog";

const kolommen = 5;
const puzzelBeeldverhouding = "14031 / 9921";

function schudStukjes(aantal: number, willekeurig: () => number = Math.random) {
  const stukjes = Array.from({ length: aantal }, (_, index) => index);
  for (let index = stukjes.length - 1; index > 0; index -= 1) {
    const volgende = Math.floor(willekeurig() * (index + 1));
    [stukjes[index], stukjes[volgende]] = [stukjes[volgende], stukjes[index]];
  }
  if (stukjes.every((stukje, index) => stukje === index)) {
    [stukjes[0], stukjes[1]] = [stukjes[1], stukjes[0]];
  }
  return stukjes;
}

export default function SchoolplaatPuzzel({
  src,
  onClose,
}: {
  src: string;
  onClose: () => void;
}) {
  const [aantal, setAantal] = useState(10);
  const [stukjes, setStukjes] = useState<number[]>(() => {
    let zaad = 10;
    return schudStukjes(10, () => {
      zaad = (zaad * 9301 + 49297) % 233280;
      return zaad / 233280;
    });
  });
  const [gekozen, setGekozen] = useState<number | null>(null);
  const [melding, setMelding] = useState("Kies een stukje en daarna de plek waar het moet liggen. Je kunt stukjes ook slepen.");
  const [confettiKey, setConfettiKey] = useState(0);
  const [confettiPosition, setConfettiPosition] = useState<{ x: number; y: number } | null>(null);
  const dialogRef = useRef<HTMLElement>(null);
  useAccessibleDialog(true, onClose, dialogRef);

  const rijen = aantal / kolommen;
  const opgelost = stukjes.every((stukje, index) => stukje === index);

  function verwissel(van: number, naar: number, positie: { x: number; y: number }) {
    if (van === naar) return;
    const nieuw = [...stukjes];
    [nieuw[van], nieuw[naar]] = [nieuw[naar], nieuw[van]];
    setStukjes(nieuw);
    const isOpgelost = nieuw.every((stukje, index) => stukje === index);
    setMelding(isOpgelost
      ? "Goed gedaan! Je hebt de schoolplaatpuzzel opgelost."
      : "Stukjes verwisseld. Ga door met puzzelen!");
    if (isOpgelost) {
      setConfettiPosition(positie);
      setConfettiKey((key) => key + 1);
    }
    setGekozen(null);
  }

  function veranderAantal(nieuwAantal: number) {
    setAantal(nieuwAantal);
    setStukjes(schudStukjes(nieuwAantal));
    setGekozen(null);
    setMelding(`De puzzel is geschud met ${nieuwAantal} stukjes.`);
  }

  function opnieuwSpelen() {
    setStukjes(schudStukjes(aantal));
    setGekozen(null);
    setMelding("De puzzel is opnieuw geschud. Veel plezier!");
  }

  return (
    <div className="quiz-backdrop" onClick={onClose}>
      <section
        ref={dialogRef}
        className="quiz-dialog school-puzzle-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="school-puzzle-title"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <button className="quiz-close" type="button" onClick={onClose} aria-label="Puzzel sluiten">
          &times;
        </button>
        <p className="eyebrow">Ontdek de schoolplaat</p>
        <h2 id="school-puzzle-title">Leg de puzzel</h2>
        <p className="school-puzzle-instructions">
          Kies 10 of 20 stukjes en zet ze op de juiste plek. Tik twee stukjes aan om ze te verwisselen,
          of sleep een stukje naar een andere plek.
        </p>
        <div className="school-puzzle-options" aria-label="Kies het aantal puzzelstukjes">
          {[10, 20].map((optie) => (
            <button
              key={optie}
              type="button"
              className={`school-puzzle-option${aantal === optie ? " is-active" : ""}`}
              aria-pressed={aantal === optie}
              onClick={() => veranderAantal(optie)}
            >
              {optie} stukjes
            </button>
          ))}
          <button type="button" className="school-puzzle-option" onClick={opnieuwSpelen}>
            Opnieuw schudden
          </button>
        </div>
        <div
          className="school-puzzle-board"
          role="grid"
          aria-label={`Puzzel met ${aantal} stukjes`}
          style={{
            aspectRatio: puzzelBeeldverhouding,
            gridTemplateRows: `repeat(${rijen}, minmax(0, 1fr))`,
          }}
        >
          {stukjes.map((stukje, plek) => {
            const kolom = stukje % kolommen;
            const rij = Math.floor(stukje / kolommen);
            return (
              <button
                key={plek}
                type="button"
                role="gridcell"
                className={`school-puzzle-piece${gekozen === plek ? " is-selected" : ""}`}
                aria-label={`Stukje hoort op rij ${rij + 1}, kolom ${kolom + 1}; ligt nu op plek ${plek + 1} van ${aantal}${gekozen === plek ? ", geselecteerd" : ""}`}
                aria-selected={gekozen === plek}
                draggable={!opgelost}
                onClick={(event) => {
                  if (gekozen === null) {
                    setGekozen(plek);
                    setMelding(`Stukje op plek ${plek + 1} gekozen. Kies nu een ander stukje om ze te verwisselen.`);
                  } else {
                    verwissel(gekozen, plek, { x: event.clientX, y: event.clientY });
                  }
                }}
                onDragStart={(event) => {
                  event.dataTransfer.setData("text/plain", String(plek));
                  event.dataTransfer.effectAllowed = "move";
                }}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  const van = Number(event.dataTransfer.getData("text/plain"));
                  if (Number.isInteger(van) && van >= 0 && van < aantal) {
                    verwissel(van, plek, { x: event.clientX, y: event.clientY });
                  }
                }}
                style={{
                  backgroundImage: `url("${src}")`,
                  backgroundSize: `${kolommen * 100}% ${rijen * 100}%`,
                  backgroundPosition: `${(kolom / (kolommen - 1)) * 100}% ${(rij / (rijen - 1)) * 100}%`,
                }}
              />
            );
          })}
        </div>
        <p className="school-puzzle-feedback" role="status" aria-live="polite">{melding}</p>
        {opgelost && (
          <p className="school-puzzle-complete">Puzzel opgelost! Goed gedaan!</p>
        )}
      </section>
        {confettiPosition && (
          <Confetti key={confettiKey} x={confettiPosition.x} y={confettiPosition.y} />
        )}
    </div>
  );
}
