import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import useAccessibleDialog from "../../hooks/useAccessibleDialog";
import {
  aantalStenen,
  kiesRobotZet,
  legaleZetPunten,
  magSlaan,
  maakNieuwSpel,
  spelReducer,
  punten,
  verbindingen,
} from "./gameRules";
import type { Speler } from "./gameRules";

type Moeilijkheid = "robot" | "twee-spelers";

export default function Molenspel({ onClose }: { onClose: () => void }) {
  const [fase, setFase] = useState<"menu" | "spel">("menu");
  const [moeilijkheid, setMoeilijkheid] = useState<Moeilijkheid>("robot");
  const [spel, dispatch] = useReducer(spelReducer, undefined, maakNieuwSpel);
  const dialogRef = useRef<HTMLElement>(null);
  useAccessibleDialog(true, onClose, dialogRef);

  const startSpel = (keuze: Moeilijkheid) => {
    setMoeilijkheid(keuze);
    dispatch({ type: "reset" });
    setFase("spel");
  };

  const klikPunt = useCallback((plek: number) => {
    if (spel.winnaar) return;
    if (spel.moetSlaan) {
      dispatch({ type: "slaan", plek });
    } else if (spel.over[spel.aanDeBeurt] > 0) {
      dispatch({ type: "plaatsen", plek });
    } else {
      dispatch({ type: "verplaatsen", plek });
    }
  }, [spel]);

  useEffect(() => {
    if (fase !== "spel" || moeilijkheid !== "robot" || spel.aanDeBeurt !== "twee" || spel.winnaar) return;
    const timer = window.setTimeout(() => {
      dispatch(kiesRobotZet(spel));
    }, 500);
    return () => window.clearTimeout(timer);
  }, [fase, moeilijkheid, spel]);

  const startOpnieuw = () => {
    setFase("menu");
    dispatch({ type: "reset" });
  };

  const statusText = spel.winnaar
    ? spel.winnaar === "een"
      ? "Jij hebt gewonnen!"
      : `${moeilijkheid === "robot" ? "De robot" : "Speler 2"} heeft gewonnen!`
    : spel.melding;

  return (
    <div className="mill-game-backdrop" onClick={onClose}>
      <section
        ref={dialogRef}
        className="mill-game"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mill-game-title"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <button className="mill-game-close" type="button" onClick={onClose} aria-label="Molenspel sluiten">
          &times;
        </button>
        <header className="mill-game-header">
          <p className="eyebrow">Een spel van slim vooruitdenken</p>
          <h2 id="mill-game-title">Het Molenspel</h2>
        </header>

        {fase === "menu" ? (
          <div className="mill-menu">
            <section className="mill-rules" aria-labelledby="mill-rules-title">
              <h3 id="mill-rules-title">Zo speel je</h3>
              <ol>
                <li><strong>Begin met plaatsen.</strong> Jullie hebben allebei 9 stenen. Zet om de beurt een steen op een leeg punt.</li>
                <li><strong>Maak een molen.</strong> Drie eigen stenen op één lijn vormen een molen. Haal dan één steen van je tegenstander weg. Een steen in een molen mag alleen weg als er geen andere stenen buiten een molen staan.</li>
                <li><strong>Verplaats je stenen.</strong> Zijn alle stenen geplaatst? Verplaats dan om de beurt één steen langs een lijn naar een leeg buurpunt.</li>
                <li><strong>Met drie stenen mag je vliegen.</strong> Je mag dan naar elk leeg punt springen.</li>
                <li><strong>Win het spel.</strong> Zorg dat je tegenstander minder dan 3 stenen overhoudt, of geen zet meer kan doen.</li>
              </ol>
            </section>
            <section className="mill-mode-choice" aria-labelledby="mill-mode-title">
              <h3 id="mill-mode-title">Tegen wie speel je?</h3>
              <button type="button" className="mill-mode-card" onClick={() => startSpel("robot")}>
                <span className="mill-mode-icon mill-robot-icon" aria-hidden="true"><span /></span>
                <span><strong>Tegen de robot</strong><small>Jij speelt tegen de computer.</small></span>
                <span aria-hidden="true">→</span>
              </button>
              <button type="button" className="mill-mode-card" onClick={() => startSpel("twee-spelers")}>
                <span className="mill-mode-icon mill-players-icon" aria-hidden="true" />
                <span><strong>Tegen een tweede speler</strong><small>Speel samen op hetzelfde scherm.</small></span>
                <span aria-hidden="true">→</span>
              </button>
            </section>
          </div>
        ) : (
          <div className="mill-play">
            <div className="mill-board-wrap">
              <p className={`mill-turn ${spel.winnaar ? "is-winner" : ""}`} aria-live="polite">
                {statusText}
              </p>
              <div className="mill-board" role="group" aria-label="Molenspelbord met 24 punten">
                <svg className="mill-board-lines" viewBox="0 0 600 600" aria-hidden="true">
                  {verbindingen.map(([a, b]) => (
                    <line
                      key={`${a}-${b}`}
                      x1={punten[a][0] * 100}
                      y1={punten[a][1] * 100}
                      x2={punten[b][0] * 100}
                      y2={punten[b][1] * 100}
                    />
                  ))}
                </svg>
                {punten.map(([x, y], plek) => {
                  const steen = spel.bord[plek];
                  const tegenstander: Speler = spel.aanDeBeurt === "een" ? "twee" : "een";
                  const isDoel = spel.moetSlaan && steen === tegenstander &&
                    magSlaan(spel.bord, plek, tegenstander);
                  const isZetbaar = !spel.moetSlaan && steen === null &&
                    (spel.over[spel.aanDeBeurt] > 0 ||
                      spel.gekozen !== null &&
                      (aantalStenen(spel.bord, spel.aanDeBeurt) === 3 ||
                        legaleZetPunten(spel.bord, spel.gekozen).includes(plek)));
                  return (
                    <button
                      key={plek}
                      type="button"
                      className={`mill-point ${steen ? `stone-${steen}` : ""} ${spel.gekozen === plek ? "is-selected" : ""} ${isDoel ? "is-removable" : ""} ${isZetbaar ? "is-available" : ""}`}
                      style={{
                        left: `calc(7% + ${x / 6 * 86}%)`,
                        top: `calc(7% + ${y / 6 * 86}%)`,
                      }}
                      aria-label={`Punt ${plek + 1}${steen ? `, steen van speler ${steen === "een" ? "1" : "2"}` : ", leeg"}${isZetbaar ? ", zet mogelijk" : ""}${isDoel ? ", steen weghalen" : ""}`}
                      aria-pressed={spel.gekozen === plek}
                      onClick={() => klikPunt(plek)}
                      disabled={Boolean(spel.winnaar) || moeilijkheid === "robot" && spel.aanDeBeurt === "twee"}
                    />
                  );
                })}
              </div>
              <div className="mill-score">
                <span className={spel.aanDeBeurt === "een" && !spel.winnaar ? "is-active" : ""}>
                  <i className="mill-score-stone stone-een" /> Jij: {aantalStenen(spel.bord, "een")} stenen
                  {spel.over.een > 0 && ` · ${spel.over.een} nog te plaatsen`}
                </span>
                <span className={spel.aanDeBeurt === "twee" && !spel.winnaar ? "is-active" : ""}>
                  <i className="mill-score-stone stone-twee" />
                  {moeilijkheid === "robot" ? "Robot" : "Speler 2"}: {aantalStenen(spel.bord, "twee")} stenen
                  {spel.over.twee > 0 && ` · ${spel.over.twee} nog te plaatsen`}
                </span>
              </div>
            </div>
            <aside className="mill-side-panel">
              <h3>Spelregels</h3>
              <ol>
                <li>Plaats om de beurt 9 stenen.</li>
                <li>Maak drie op een rij: haal een steen weg.</li>
                <li>Verplaats langs een lijn naar een leeg buurpunt.</li>
                <li>Met 3 stenen mag je naar elk leeg punt springen.</li>
                <li>Maak de ander minder dan 3 stenen of zet klem.</li>
              </ol>
              <p>Een molensteen is beschermd, tenzij alle stenen in een molen staan.</p>
              <button type="button" className="mill-secondary-button" onClick={startOpnieuw}>Opnieuw beginnen</button>
              <button type="button" className="mill-text-button" onClick={() => setFase("menu")}>Terug naar het menu</button>
            </aside>
          </div>
        )}
      </section>
    </div>
  );
}
