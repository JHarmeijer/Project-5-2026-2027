"use client";
import { useEffect, useRef, useState } from "react";
import { useTifAsUrl } from "./useTifAsUrl";

type Hotspot = { id: string; x: number; y: number; titel: string; tekst: string };

const hotspots: Hotspot[] = [
  { id: "kamp", x: 30, y: 40, titel: "Legerkamp", tekst: "Hier ligt een Romeins kamp." },
  { id: "weg", x: 65, y: 55, titel: "Romeinse weg", tekst: "Een belangrijke verbindingsweg." },
];

export default function SchoolplaatViewer({ src }: { src: string }) {
  const { url, error } = useTifAsUrl(src);
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [actief, setActief] = useState<Hotspot | null>(null);
  const drag = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);

  // voor scrollwiel-zoom
  const containerRef = useRef<HTMLDivElement>(null);
  const scaleRef = useRef(1);
  const posRef = useRef({ x: 0, y: 0 });
  scaleRef.current = scale;
  posRef.current = pos;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const rect = el!.getBoundingClientRect();
      // muispositie ten opzichte van het midden van de viewer
      const mx = e.clientX - rect.left - rect.width / 2;
      const my = e.clientY - rect.top - rect.height / 2;

      const s = scaleRef.current;
      const nieuw = Math.min(5, Math.max(1, s * (e.deltaY < 0 ? 1.1 : 1 / 1.1)));
      if (nieuw === s) return;

      if (nieuw === 1) {
        scaleRef.current = 1;
        posRef.current = { x: 0, y: 0 };
        setScale(1);
        setPos({ x: 0, y: 0 });
        return;
      }

      const p = posRef.current;
      const nieuwePos = {
        x: mx - (nieuw / s) * (mx - p.x),
        y: my - (nieuw / s) * (my - p.y),
      };
      scaleRef.current = nieuw;
      posRef.current = nieuwePos;
      setScale(nieuw);
      setPos(nieuwePos);
    }

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [url]);

  if (error) return <p>Het laden van de plaat is mislukt: {error}</p>;
  if (!url) return <p>Even geduld!, De plaat wordt geladen...</p>;

  function zoom(delta: number) {
    setScale((s) => {
      const nieuw = Math.min(5, Math.max(1, s + delta));
      if (nieuw === 1) setPos({ x: 0, y: 0 });
      return nieuw;
    });
  }

  return (
    <div>
      <div style={{ marginBottom: "0.5rem", display: "flex", gap: "0.5rem" }}>
        <button type="button" onClick={() => zoom(0.5)}>+</button>
        <button type="button" onClick={() => zoom(-0.5)}>−</button>
        <button type="button" onClick={() => { setScale(1); setPos({ x: 0, y: 0 }); }}>
          Reset
        </button>
      </div>

      <div
        ref={containerRef}
        style={{ overflow: "hidden", cursor: "grab", touchAction: "none", position: "relative" }}
        onPointerDown={(e) => {
          drag.current = { sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y };
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          setPos({
            x: drag.current.ox + e.clientX - drag.current.sx,
            y: drag.current.oy + e.clientY - drag.current.sy,
          });
        }}
        onPointerUp={() => (drag.current = null)}
        onPointerLeave={() => (drag.current = null)}
      >
        <div
          style={{
            position: "relative",
            transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
            transformOrigin: "center",
          }}
        >
          <img
            src={url}
            alt="Schoolplaat: Oog in oog met de Romeinen"
            draggable={false}
            style={{ width: "100%", display: "block" }}
          />
          {hotspots.map((h) => (
            <button
              key={h.id}
              type="button"
              aria-label={h.titel}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setActief(h)}
              style={{
                position: "absolute",
                left: `${h.x}%`,
                top: `${h.y}%`,
                width: 28,
                height: 28,
                borderRadius: "50%",
                border: "2px solid white",
                background: "#2563eb",
                color: "white",
                cursor: "pointer",
                // houdt de knop even groot als je inzoomt
                transform: `translate(-50%, -50%) scale(${1 / scale})`,
              }}
            >
              i
            </button>
          ))}
        </div>
      </div>

      {actief && (
        <div style={{ marginTop: "1rem" }}>
          <h3>{actief.titel}</h3>
          <p>{actief.tekst}</p>
        </div>
      )}
    </div>
  );
}