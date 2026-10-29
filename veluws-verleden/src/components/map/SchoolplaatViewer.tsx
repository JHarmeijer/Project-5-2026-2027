"use client";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Molenspel from "../../games/Molenspel/Molenspel";
import VondstenKoppelen from "../../games/VondstenKoppelen/VondstenKoppelen";
import ArcheologenSpeurtocht from "../../games/ArcheologenSpeurtocht/ArcheologenSpeurtocht";
import SchoolplaatPuzzel from "../../games/SchoolplaatPuzzel/SchoolplaatPuzzel";
import Quiz from "../Quiz/Quiz";
import { romanPOIs } from "../../data/romanPOI";
import type { POI } from "../../types/POI";
import useAccessibleDialog from "../../hooks/useAccessibleDialog";

const MIN_SCALE = 1;
const MAX_SCALE = 10;
const SMOOTHING = 0.2; // 0.1 = zachter/trager, 0.4 = sneller

type View = { s: number; x: number; y: number };
type ScreenOrientationWithLock = ScreenOrientation & {
  lock?: (orientation: "landscape") => Promise<void>;
  unlock?: () => void;
};

function subscribeFullscreen(callback: () => void) {
  document.addEventListener("fullscreenchange", callback);
  return () => document.removeEventListener("fullscreenchange", callback);
}

function getFullscreenAvailability() {
  return document.fullscreenEnabled === true;
}

function getServerFullscreenAvailability() {
  return false;
}

const overlayStijl: React.CSSProperties = {
  position: "absolute",
  zIndex: 10,
  borderRadius: 12,
  background: "rgba(0, 0, 0, 0.6)",
  color: "white",
};

const knopStijl: React.CSSProperties = { minHeight: 44, padding: "0 1rem" };
const rondeKnopStijl: React.CSSProperties = {
  ...knopStijl,
  minWidth: 44,
  padding: 0,
  fontSize: "1.2rem",
};

export default function SchoolplaatViewer({
  src,
  terugHref,
  terugLabel = "Terug naar overzicht",
}: {
  src: string;
  terugHref?: string;
  terugLabel?: string;
}) {
  const [geladen, setGeladen] = useState(false);
  const [fout, setFout] = useState(false);
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [actief, setActief] = useState<POI | null>(null);
  const [hint, setHint] = useState(true);
  const [molenspelOpen, setMolenspelOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [koppelspelOpen, setKoppelspelOpen] = useState(false);
  const [speurtochtOpen, setSpeurtochtOpen] = useState(false);
  const [puzzelOpen, setPuzzelOpen] = useState(false);
  const verhaalDialogRef = useRef<HTMLDivElement>(null);
  const resetSchoolplaatWeergave = useCallback(() => {
    animeerNaar(1, { x: 0, y: 0 });
  }, []);
  const closeVerhaallijn = useCallback(() => {
    setActief(null);
    resetSchoolplaatWeergave();
  }, [resetSchoolplaatWeergave]);
  const closeMolenspel = useCallback(() => {
    setMolenspelOpen(false);
    resetSchoolplaatWeergave();
  }, [resetSchoolplaatWeergave]);
  const closeQuiz = useCallback(() => {
    setQuizOpen(false);
    resetSchoolplaatWeergave();
  }, [resetSchoolplaatWeergave]);
  const closeKoppelspel = useCallback(() => {
    setKoppelspelOpen(false);
    resetSchoolplaatWeergave();
  }, [resetSchoolplaatWeergave]);
  const closeSpeurtocht = useCallback(() => {
    setSpeurtochtOpen(false);
    resetSchoolplaatWeergave();
  }, [resetSchoolplaatWeergave]);
  const closePuzzel = useCallback(() => {
    setPuzzelOpen(false);
    resetSchoolplaatWeergave();
  }, [resetSchoolplaatWeergave]);
  useAccessibleDialog(Boolean(actief), closeVerhaallijn, verhaalDialogRef);

  // volledig scherm
  const wrapRef = useRef<HTMLDivElement>(null);
  const [volledig, setVolledig] = useState(false);
  const [fullscreenMelding, setFullscreenMelding] = useState("");
  const kanVolledig = useSyncExternalStore(
    subscribeFullscreen,
    getFullscreenAvailability,
    getServerFullscreenAvailability,
  );

  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // huidige weergave (ook bruikbaar in event listeners)
  const scaleRef = useRef(1);
  const posRef = useRef({ x: 0, y: 0 });

  // doel waar de animatie naartoe beweegt
  const targetRef = useRef<View>({ s: 1, x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  // actieve vingers/pointers en hun laatste positie
  const pointers = useRef(new Map<number, { x: number; y: number }>());

  // begrens schaal en positie binnen het kader
  function clamp(s: number, p: { x: number; y: number }): View {
    const el = containerRef.current;
    const ns = Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));
    if (ns === 1) return { s: 1, x: 0, y: 0 };
    let x = p.x;
    let y = p.y;
    if (el) {
      const maxX = ((ns - 1) * el.clientWidth) / 2;
      const maxY = ((ns - 1) * el.clientHeight) / 2;
      x = Math.min(maxX, Math.max(-maxX, x));
      y = Math.min(maxY, Math.max(-maxY, y));
    }
    return { s: ns, x, y };
  }

  // zet de weergave direct (zonder animatie)
  function render(v: View) {
    scaleRef.current = v.s;
    posRef.current = { x: v.x, y: v.y };
    setScale(v.s);
    setPos({ x: v.x, y: v.y });
  }

  function stopAnim() {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    targetRef.current = { s: scaleRef.current, ...posRef.current };
  }

  // direct toepassen (slepen, pinch)
  function apply(s: number, p: { x: number; y: number }) {
    stopAnim();
    const v = clamp(s, p);
    targetRef.current = v;
    render(v);
  }

  // één animatiestap richting het doel
  function stap() {
    const t = targetRef.current;
    const cs = scaleRef.current;
    const cp = posRef.current;

    const ns = cs + (t.s - cs) * SMOOTHING;
    const nx = cp.x + (t.x - cp.x) * SMOOTHING;
    const ny = cp.y + (t.y - cp.y) * SMOOTHING;

    const klaar =
      Math.abs(t.s - ns) < 0.001 && Math.abs(t.x - nx) < 0.5 && Math.abs(t.y - ny) < 0.5;

    if (klaar) {
      render(t);
      rafRef.current = null;
      return;
    }
    render({ s: ns, x: nx, y: ny });
    rafRef.current = requestAnimationFrame(stap);
  }

  // animeer naar een nieuw doel
  function animeerNaar(s: number, p: { x: number; y: number }) {
    targetRef.current = clamp(s, p);
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(stap);
    }
  }

  // zoom naar een punt (relatief ten opzichte van het midden van het kader)
  function zoomNaar(nieuweSchaal: number, mx: number, my: number) {
    const t = targetRef.current; // bouw voort op het doel, zodat scrollstappen optellen
    const ns = Math.min(MAX_SCALE, Math.max(MIN_SCALE, nieuweSchaal));
    if (ns === t.s) return;
    animeerNaar(ns, {
      x: mx - (ns / t.s) * (mx - t.x),
      y: my - (ns / t.s) * (my - t.y),
    });
  }

  // animatie opruimen bij verlaten van de pagina
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // controleer of de plaat al klaar is (bijvoorbeeld uit de browsercache)
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete) {
      if (img.naturalWidth > 0) setGeladen(true);
      else setFout(true);
    }
  }, []);

  // volledig scherm: beschikbaarheid en wijzigingen bijhouden
  useEffect(() => {
    function onChange() {
      const aan = !!document.fullscreenElement;
      setVolledig(aan);
      setActief(null);
      apply(1, { x: 0, y: 0 }); // begin opnieuw, want het kader verandert van grootte
      if (!aan) {
        try {
          (screen.orientation as ScreenOrientationWithLock).unlock?.();
        } catch {
          setFullscreenMelding("De schermoriëntatie kon niet worden hersteld.");
        }
      }
    }

    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  async function toggleVolledig() {
    setFullscreenMelding("");
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {
        setFullscreenMelding("Volledig scherm kon niet worden gesloten.");
      }
      return;
    }
    const element = wrapRef.current;
    if (!element) {
      setFullscreenMelding("De schoolplaat is nog niet klaar voor volledig scherm.");
      return;
    }
    try {
      await element.requestFullscreen();
    } catch {
      setFullscreenMelding("Volledig scherm kon niet worden geopend.");
      return;
    }
    try {
      await (screen.orientation as ScreenOrientationWithLock).lock?.("landscape");
    } catch {
      setFullscreenMelding("Volledig scherm is geopend, maar schermrotatie kon niet worden vergrendeld.");
    }
  }

  // scrollwiel-zoom (muis): alleen met Ctrl/Cmd, anders scrolt de pagina gewoon
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function onWheel(e: WheelEvent) {
      if (!e.ctrlKey && !e.metaKey) return; // laat de pagina scrollen

      e.preventDefault();
      setHint(false);
      const rect = el!.getBoundingClientRect();
      const mx = e.clientX - rect.left - rect.width / 2;
      const my = e.clientY - rect.top - rect.height / 2;

      // begrens één wielstap, zodat een muiswiel niet in één keer enorm zoomt
      const delta = Math.max(-50, Math.min(50, e.deltaY));
      zoomNaar(targetRef.current.s * Math.exp(-delta * 0.01), mx, my);
    }

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  function zoomKnop(factor: number) {
    setHint(false);
    zoomNaar(targetRef.current.s * factor, 0, 0);
  }

  function openVerhaallijn(verhaallijn: POI, marker: HTMLButtonElement) {
    setActief(verhaallijn);
    setHint(false);

    const el = containerRef.current;
    if (!el) return;

    stopAnim();
    const rect = el.getBoundingClientRect();
    const markerRect = marker.getBoundingClientRect();
    const huidigeWeergave = targetRef.current;
    const volgendeSchaal = Math.min(MAX_SCALE, Math.max(2.5, huidigeWeergave.s * 1.5));
    const markerX = markerRect.left + markerRect.width / 2 - rect.left - rect.width / 2;
    const markerY = markerRect.top + markerRect.height / 2 - rect.top - rect.height / 2;
    const lokaalX = (markerX - huidigeWeergave.x) / huidigeWeergave.s;
    const lokaalY = (markerY - huidigeWeergave.y) / huidigeWeergave.s;

    animeerNaar(volgendeSchaal, {
      x: -lokaalX * volgendeSchaal,
      y: -lokaalY * volgendeSchaal,
    });
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    setHint(false);
    stopAnim(); // onderbreek een lopende zoomanimatie
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;

    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const s = scaleRef.current;
    const p = posRef.current;

    if (pointers.current.size === 1) {
      // slepen met één vinger/muis
      if (s > 1) {
        apply(s, { x: p.x + e.clientX - prev.x, y: p.y + e.clientY - prev.y });
      }
    } else if (pointers.current.size === 2) {
      // pinch met twee vingers
      const other = [...pointers.current.entries()].find(([id]) => id !== e.pointerId)![1];

      const prevDist = Math.hypot(prev.x - other.x, prev.y - other.y);
      const newDist = Math.hypot(e.clientX - other.x, e.clientY - other.y);
      if (prevDist > 0) {
        const prevMid = { x: (prev.x + other.x) / 2 - cx, y: (prev.y + other.y) / 2 - cy };
        const mid = { x: (e.clientX + other.x) / 2 - cx, y: (e.clientY + other.y) / 2 - cy };

        const ns = Math.min(MAX_SCALE, Math.max(MIN_SCALE, s * (newDist / prevDist)));
        // zoom rond het vorige middelpunt, daarna meeschuiven met het nieuwe middelpunt
        const x = prevMid.x - (ns / s) * (prevMid.x - p.x) + (mid.x - prevMid.x);
        const y = prevMid.y - (ns / s) * (prevMid.y - p.y) + (mid.y - prevMid.y);
        apply(ns, { x, y });
      }
    }

    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
  }

  function onPointerEnd(e: React.PointerEvent<HTMLDivElement>) {
    pointers.current.delete(e.pointerId);
  }

  return (
    <>
    <div
      ref={wrapRef}
      style={{
        position: "relative",
        overflow: "hidden",
        maxWidth: "100%",
        ...(volledig && { width: "100%", height: "100%", background: "#000" }),
      }}
    >
      {/* status linksboven: laden, fout of hint (zelfde in elke stand) */}
      {(fout || !geladen || hint) && (
        <div
          style={{
            ...overlayStijl,
            top: 12,
            left: 12,
            padding: "0.4rem 0.75rem",
            fontSize: "0.85rem",
            maxWidth: "55%",
            pointerEvents: "none",
          }}
        >
          {fout
            ? "Het laden van de plaat is mislukt."
            : !geladen
              ? "Even geduld!, De plaat wordt geladen..."
              : "Ctrl + scroll of knijp om te zoomen, sleep om te bewegen."}
        </div>
      )}

      {/* terug-link rechtsboven (zelfde in elke stand) */}
      {terugHref && (
        <Link
          href={terugHref}
          style={{
            ...overlayStijl,
            top: 12,
            right: 12,
            minHeight: 44,
            padding: "0 1rem",
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
            fontSize: "0.9rem",
          }}
        >
          ← {terugLabel}
        </Link>
      )}

      {/* plaat */}
      <div
        ref={containerRef}
        style={{
          overflow: "hidden",
          position: "relative",
          cursor: scale > 1 ? "grab" : "default",
          // bij zoom 1 mag de pagina gewoon scrollen; ingezoomd vangt de plaat alle gebaren op
          touchAction: volledig || scale > 1 ? "none" : "pan-y",
          userSelect: "none",
          WebkitUserSelect: "none",
          WebkitTouchCallout: "none",
          ...(volledig && {
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }),
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
      >
        <div
          style={{
            position: "relative",
            transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
            transformOrigin: "center",
            // in volledig scherm sluit deze laag precies om de plaat, zodat de hotspots kloppen
            ...(volledig && { width: "fit-content" }),
          }}
        >
          <img
            ref={imgRef}
            src={src}
            onLoad={() => setGeladen(true)}
            onError={() => setFout(true)}
            alt="Schoolplaat: Oog in oog met de Romeinen"
            draggable={false}
            style={
              volledig
                ? {
                    display: "block",
                    width: "auto",
                    height: "auto",
                    maxWidth: "100vw",
                    maxHeight: "100dvh",
                  }
                : { width: "100%", height: "auto", display: "block" }
            }
          />
          {geladen && romanPOIs.map((verhaallijn) => (
            <button
              key={verhaallijn.id}
              type="button"
              className={`school-map-poi${verhaallijn.id === "molenspel" ? " school-map-poi-game" : ""}`}
              data-poi-id={verhaallijn.id}
              aria-label={verhaallijn.id === "molenspel"
                ? "Speel het Molenspel"
                : `Informatie: ${verhaallijn.titel}`}
              title={verhaallijn.titel}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => openVerhaallijn(verhaallijn, event.currentTarget)}
              style={{
                left: `${verhaallijn.x}%`,
                top: `${verhaallijn.y}%`,
                transform: `translate(-50%, -50%) scale(${1 / scale})`,
              }}
            >
              <span aria-hidden="true">{verhaallijn.id === "molenspel" ? "▶" : "i"}</span>
            </button>
          ))}
          {geladen && (
            <button
              type="button"
              className="school-map-quiz-marker"
              aria-label="Start de schoolplaatquiz"
              title="Schoolplaatquiz"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => setQuizOpen(true)}
              style={{
                left: "94%",
                top: "88%",
                transform: `translate(-50%, -50%) scale(${1 / scale})`,
              }}
            >
              ?
            </button>
          )}
          {geladen && (
            <>
              <button
                type="button"
                className="school-map-game-marker school-map-matching-marker"
                aria-label="Speel Vondsten koppelen"
                title="Vondsten koppelen"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => setKoppelspelOpen(true)}
                style={{
                  left: "50%",
                  top: "60%",
                  transform: `translate(-50%, -50%) scale(${1 / scale})`,
                }}
              >
                <span aria-hidden="true">🧩</span>
              </button>
              <button
                type="button"
                className="school-map-game-marker school-map-archaeology-marker"
                aria-label="Speel de archeologische speurtocht"
                title="Archeologische speurtocht"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => setSpeurtochtOpen(true)}
                style={{
                  left: "25%",
                  top: "30%",
                  transform: `translate(-50%, -50%) scale(${1 / scale})`,
                }}
              >
                <span aria-hidden="true">🔎</span>
              </button>
              <button
                type="button"
                className="school-map-game-marker school-map-puzzle-marker"
                aria-label="Speel de schoolplaatpuzzel"
                title="Schoolplaatpuzzel"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => setPuzzelOpen(true)}
                style={{
                  left: "50%",
                  top: "14%",
                  transform: `translate(-50%, -50%) scale(${1 / scale})`,
                }}
              >
                <span aria-hidden="true">🧩</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* knoppen linksonder (zelfde in elke stand) */}
      <div
        style={{
          ...overlayStijl,
          left: 12,
          bottom: 12,
          display: "flex",
          flexWrap: "wrap",
          maxWidth: "calc(100% - 24px)",
          gap: "0.5rem",
          padding: 6,
        }}
      >
        <button
          type="button"
          onClick={() => zoomKnop(1.5)}
          aria-label="Inzoomen"
          style={rondeKnopStijl}
        >
          +
        </button>
        <button
          type="button"
          onClick={() => zoomKnop(1 / 1.5)}
          aria-label="Uitzoomen"
          style={rondeKnopStijl}
        >
          −
        </button>
        <button
          type="button"
          onClick={() => animeerNaar(1, { x: 0, y: 0 })}
          style={knopStijl}
        >
          Reset
        </button>
        {kanVolledig && (
          <button type="button" onClick={toggleVolledig} style={knopStijl}>
            {volledig ? "Sluiten" : "Volledig scherm"}
          </button>
        )}
      </div>
      {fullscreenMelding && (
        <p
          role="status"
          style={{
            ...overlayStijl,
            left: 12,
            bottom: 76,
            padding: "0.5rem 0.75rem",
            maxWidth: "min(28rem, calc(100% - 24px))",
          }}
        >
          {fullscreenMelding}
        </p>
      )}

      {/* Geselecteerde verhaallijn */}
      {actief && (
        <div
          onClick={closeVerhaallijn}
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(15, 23, 42, 0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 20,
            padding: "1rem",
          }}
        >
          <div
            ref={verhaalDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="verhaallijn-titel"
            tabIndex={-1}
            onClick={(event) => event.stopPropagation()}
            style={{
              ...overlayStijl,
              position: "relative",
              width: "min(420px, 90%)",
              maxWidth: "420px",
              padding: "1.25rem 2.5rem 1rem 1rem",
              background: "rgba(15, 23, 42, 0.9)",
              boxShadow: "0 18px 50px rgba(0, 0, 0, 0.35)",
            }}
          >
            <button
              type="button"
              onClick={closeVerhaallijn}
              aria-label="Verhaallijn sluiten"
              style={{
                position: "absolute",
                top: 8,
                right: 10,
                border: "none",
                background: "transparent",
                color: "white",
                fontSize: "1.5rem",
                cursor: "pointer",
                lineHeight: 1,
              }}
            >
              &times;
            </button>
            <h3 id="verhaallijn-titel" style={{ margin: "0 0 0.5rem", fontSize: "1.2rem" }}>
              {actief.titel}
            </h3>
            <p style={{ margin: 0, lineHeight: 1.6 }}>{actief.tekst}</p>
            {actief.id === "molenspel" && (
              <button
                type="button"
                className="mill-secondary-button"
                style={{ marginTop: "1rem" }}
                onClick={() => {
                  setActief(null);
                  setMolenspelOpen(true);
                }}
              >
                <span aria-hidden="true">▶ </span>
                Speel het Molenspel
              </button>
            )}
          </div>
        </div>
      )}
      {molenspelOpen && <Molenspel onClose={closeMolenspel} />}
      {quizOpen && <Quiz onClose={closeQuiz} />}
      {koppelspelOpen && <VondstenKoppelen onClose={closeKoppelspel} />}
      {speurtochtOpen && <ArcheologenSpeurtocht onClose={closeSpeurtocht} />}
      {puzzelOpen && <SchoolplaatPuzzel src={src} onClose={closePuzzel} />}
    </div>
    </>
  );
}