import { useRef, useState } from "react";
import useAccessibleDialog from "../../hooks/useAccessibleDialog";

type Vraag = {
  vraag: string;
  antwoorden: string[];
  juist: number;
};

const vragen: Vraag[] = [
  {
    vraag: "Wat kon een Romeins legerkamp beschermen tegen indringers?",
    antwoorden: [
      "Een aarden wal, een greppel en stevige poorten",
      "Een hoge stenen toren in het midden",
      "Een brede rivier rondom het kamp",
    ],
    juist: 0,
  },
  {
    vraag: "Waarom was een Romeins kamp volgens een duidelijk plan ingericht?",
    antwoorden: [
      "Om ruimte te maken voor markten en winkels",
      "Om soldaten te laten slapen, spullen op te slaan en bevelen te geven",
      "Om alle dieren buiten het kamp te houden",
    ],
    juist: 1,
  },
  {
    vraag: "Wie dienden er naast legionairs in het Romeinse leger?",
    antwoorden: [
      "Alleen Romeinse senatoren",
      "Hulptroepen uit verschillende delen van het rijk",
      "Uitsluitend lokale boeren",
    ],
    juist: 1,
  },
  {
    vraag: "Waarvan leefden veel gemeenschappen op de Veluwe voordat de Romeinen kwamen?",
    antwoorden: [
      "Van landbouw en veeteelt",
      "Van handel over zee",
      "Van het bouwen van stenen steden",
    ],
    juist: 0,
  },
  {
    vraag: "Waaraan dankt de meloenkraal haar naam?",
    antwoorden: [
      "Aan de plek waar hij meestal wordt gevonden",
      "Aan de ribbels en vorm die aan een meloen doen denken",
      "Aan het materiaal waarvan hij altijd werd gemaakt",
    ],
    juist: 1,
  },
  {
    vraag: "Op welke manieren konden Romeinen en de lokale bevolking contact hebben?",
    antwoorden: [
      "Door handel, reizen, werk of militaire dienst",
      "Alleen door veldslagen",
      "Alleen doordat Romeinen op de Veluwe gingen wonen",
    ],
    juist: 0,
  },
  {
    vraag: "Welke landschappen kwamen op de Veluwe voor?",
    antwoorden: [
      "Alleen dichte bossen",
      "Bossen, open plekken, natte gebieden en hogere zandgronden",
      "Vooral stranden en moerassen",
    ],
    juist: 1,
  },
  {
    vraag: "Wat kan de bodemlaag van een archeologische vondst helpen verklaren?",
    antwoorden: [
      "Wat de vondst ons over het verleden kan leren",
      "Welke soldaat de vondst precies heeft gemaakt",
      "Hoeveel mensen er op de vindplaats woonden",
    ],
    juist: 0,
  },
];

export default function Quiz({ onClose }: { onClose: () => void }) {
  const [vraagIndex, setVraagIndex] = useState(0);
  const [gekozenAntwoord, setGekozenAntwoord] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [resultaat, setResultaat] = useState(false);
  const dialogRef = useRef<HTMLElement>(null);
  useAccessibleDialog(true, onClose, dialogRef);

  const vraag = vragen[vraagIndex];

  function volgendeVraag() {
    if (vraagIndex === vragen.length - 1) {
      setResultaat(true);
      return;
    }
    setVraagIndex((index) => index + 1);
    setGekozenAntwoord(null);
  }

  function opnieuwSpelen() {
    setVraagIndex(0);
    setGekozenAntwoord(null);
    setScore(0);
    setResultaat(false);
  }

  return (
    <div className="quiz-backdrop" onClick={onClose}>
      <section
        ref={dialogRef}
        className="quiz-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="schoolplaat-quiz-title"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <button className="quiz-close" type="button" onClick={onClose} aria-label="Quiz sluiten">
          &times;
        </button>
        <p className="eyebrow">Oog in oog met de Romeinen</p>
        <h2 id="schoolplaat-quiz-title">Schoolplaatquiz</h2>
        {resultaat ? (
          <div className="quiz-result" aria-live="polite">
            <p>Je hebt {score} van de {vragen.length} vragen goed!</p>
            <button type="button" className="quiz-primary-button" onClick={opnieuwSpelen}>
              Speel opnieuw
            </button>
          </div>
        ) : (
          <>
            <p className="quiz-progress">Vraag {vraagIndex + 1} van {vragen.length}</p>
            <h3 className="quiz-question">{vraag.vraag}</h3>
            <div className="quiz-answers">
              {vraag.antwoorden.map((antwoord, index) => {
                const isGekozen = gekozenAntwoord === index;
                const isGoed = vraag.juist === index;
                const antwoordKlasse = gekozenAntwoord === null
                  ? ""
                  : isGoed
                    ? " is-correct"
                    : isGekozen
                      ? " is-incorrect"
                      : "";
                return (
                  <button
                    key={antwoord}
                    type="button"
                    className={`quiz-answer${antwoordKlasse}`}
                    onClick={() => {
                      if (gekozenAntwoord !== null) return;
                      setGekozenAntwoord(index);
                      if (isGoed) setScore((huidig) => huidig + 1);
                    }}
                    disabled={gekozenAntwoord !== null}
                  >
                    {antwoord}
                  </button>
                );
              })}
            </div>
            {gekozenAntwoord !== null && (
              <>
                <p className="quiz-feedback" role="status">
                  {gekozenAntwoord === vraag.juist
                    ? "Goed gedaan!"
                    : `Helaas, het juiste antwoord is: ${vraag.antwoorden[vraag.juist]}`}
                </p>
                <button type="button" className="quiz-primary-button" onClick={volgendeVraag}>
                  {vraagIndex === vragen.length - 1 ? "Bekijk resultaat" : "Volgende vraag"}
                </button>
              </>
            )}
          </>
        )}
      </section>
    </div>
  );
}
