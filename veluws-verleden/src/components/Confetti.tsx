import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

const kleuren = ["#913d32", "#d7b979", "#596c50", "#315d83", "#f2c94c"];
const stukjes = Array.from({ length: 36 }, (_, index) => {
  const hoek = (index / 36) * Math.PI * 2;
  const afstand = 75 + (index % 5) * 18;
  const x = Math.cos(hoek) * afstand;
  const y = Math.sin(hoek) * afstand + 45;

  return {
    kleur: kleuren[index % kleuren.length],
    stijl: {
      animationDelay: `${(index % 6) * 0.025}s`,
      "--confetti-x": `${x}px`,
      "--confetti-y": `${y}px`,
    } as CSSProperties & { "--confetti-x": string; "--confetti-y": string },
  };
});

export default function Confetti({ x, y }: { x: number; y: number }) {
  const [zichtbaar, setZichtbaar] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setZichtbaar(false), 3000);
    return () => window.clearTimeout(timer);
  }, []);

  if (!zichtbaar) return null;

  return (
    <div className="quiz-confetti" aria-hidden="true">
      {stukjes.map((stukje, index) => (
        <span
          key={index}
          className="quiz-confetti-piece"
          style={{ ...stukje.stijl, left: x, top: y, backgroundColor: stukje.kleur }}
        />
      ))}
    </div>
  );
}
