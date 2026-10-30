import { useRef, useState } from "react";
import Confetti from "../../components/Confetti";
import useAccessibleDialog from "../../hooks/useAccessibleDialog";

const opdrachten = [
  {
    vondst: "🟡",
    naam: "Een geribbelde kraal",
    context: "Bij een opgraving vinden archeologen een kraal met ribbels. De vorm lijkt op een meloen.",
    vraag: "Wat kun je voorzichtig uit deze vondst afleiden?",
    opties: [
      "De kraal kan iets vertellen over versiering en vakmanschap.",
      "Iedereen op de Veluwe droeg precies zo'n kraal.",
      "De kraal bewijst dat hier een Romeinse stad stond.",
    ],
    juist: 0,
    uitleg: "Goed speurwerk! De vorm en het materiaal kunnen iets vertellen over versiering en vakmanschap, maar één vondst vertelt niet hoe iedereen leefde.",
  },
  {
    vondst: "🛡️",
    naam: "Een wal en een greppel",
    context: "Rond een kamp zijn sporen gevonden van een aarden wal en een greppel.",
    vraag: "Welke conclusie past het best bij dit bewijs?",
    opties: [
      "De wal en greppel hielpen het kamp beschermen.",
      "Er woonden precies duizend soldaten in het kamp.",
      "Het kamp is nooit aangevallen.",
    ],
    juist: 0,
    uitleg: "Precies! Een wal en greppel passen bij de verdediging van een kamp. Ze vertellen niet hoeveel soldaten er waren of wat er allemaal gebeurde.",
  },
  {
    vondst: "🏺",
    naam: "Voorwerpen van verschillende herkomst",
    context: "Op één plek vinden onderzoekers voorwerpen die met Romeinen en lokale bewoners te maken kunnen hebben.",
    vraag: "Wat is een mogelijke verklaring voor die vondsten?",
    opties: [
      "Mensen kunnen contact hebben gehad door handel, reizen, werk of militaire dienst.",
      "De Romeinen en lokale bewoners leefden altijd op precies dezelfde manier.",
      "De voorwerpen bewijzen dat iedereen goed bevriend was.",
    ],
    juist: 0,
    uitleg: "Goed gezien! Vondsten kunnen wijzen op contact, bijvoorbeeld door handel of werk. Ze bewijzen niet precies hoe mensen met elkaar omgingen.",
  },
];

export default function ArcheologenSpeurtocht({ onClose }: { onClose: () => void }) {
  const [opdrachtIndex, setOpdrachtIndex] = useState(0);
  const [gekozen, setGekozen] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [klaar, setKlaar] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);
  const [confettiPosition, setConfettiPosition] = useState<{ x: number; y: number } | null>(null);
  const dialogRef = useRef<HTMLElement>(null);
  useAccessibleDialog(true, onClose, dialogRef);

  const opdracht = opdrachten[opdrachtIndex];

  function volgendeOpdracht() {
    if (opdrachtIndex === opdrachten.length - 1) {
      setKlaar(true);
      return;
    }
    setOpdrachtIndex((index) => index + 1);
    setGekozen(null);
  }

  function opnieuwSpelen() {
    setOpdrachtIndex(0);
    setGekozen(null);
    setScore(0);
    setKlaar(false);
  }

  return (
    <div className="quiz-backdrop" onClick={onClose}>
      <section
        ref={dialogRef}
        className="quiz-dialog archaeology-game"
        role="dialog"
        aria-modal="true"
        aria-labelledby="archaeology-game-title"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <button className="quiz-close" type="button" onClick={onClose} aria-label="Speurtocht sluiten">
          &times;
        </button>
        <p className="eyebrow">Onderzoek als een archeoloog</p>
        <h2 id="archaeology-game-title">De archeologische speurtocht</h2>
        {klaar ? (
          <div className="quiz-result" aria-live="polite">
            <p>Speurtocht afgerond! Je had {score} van de {opdrachten.length} conclusies goed.</p>
            <button type="button" className="quiz-primary-button" onClick={opnieuwSpelen}>
              Speur opnieuw
            </button>
          </div>
        ) : (
          <>
            <p className="quiz-progress">Vondst {opdrachtIndex + 1} van {opdrachten.length}</p>
            <article className="archaeology-evidence">
              <span className="archaeology-picture" aria-hidden="true">{opdracht.vondst}</span>
              <div>
                <h3>{opdracht.naam}</h3>
                <p>{opdracht.context}</p>
              </div>
            </article>
            <h3 className="quiz-question">{opdracht.vraag}</h3>
            <div className="quiz-answers">
              {opdracht.opties.map((optie, index) => {
                const antwoordKlasse = gekozen === null
                  ? ""
                  : index === opdracht.juist
                    ? " is-correct"
                    : index === gekozen
                      ? " is-incorrect"
                      : "";
                return (
                  <button
                    key={optie}
                    type="button"
                    className={`quiz-answer${antwoordKlasse}`}
                    disabled={gekozen !== null}
                    onClick={(event) => {
                      setGekozen(index);
                      if (index === opdracht.juist) {
                        setScore((huidig) => huidig + 1);
                        setConfettiPosition({ x: event.clientX, y: event.clientY });
                        setConfettiKey((key) => key + 1);
                      }
                    }}
                  >
                    {optie}
                  </button>
                );
              })}
            </div>
            {gekozen !== null && (
              <>
                <p className="quiz-feedback" role="status">{opdracht.uitleg}</p>
                <button type="button" className="quiz-primary-button" onClick={volgendeOpdracht}>
                  {opdrachtIndex === opdrachten.length - 1 ? "Bekijk resultaat" : "Volgende vondst"}
                </button>
              </>
            )}
          </>
        )}
      </section>
      {confettiPosition && (
        <Confetti key={confettiKey} x={confettiPosition.x} y={confettiPosition.y} />
      )}
    </div>
  );
}
