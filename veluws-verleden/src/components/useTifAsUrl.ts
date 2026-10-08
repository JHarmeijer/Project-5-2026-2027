"use client";
import { useEffect, useState } from "react";
import * as UTIF from "utif";

const MAX_ZIJDE = 8000;

export function useTifAsUrl(src: string) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let geannuleerd = false;
    let objectUrl: string | null = null;

    async function laad() {
      try {
        const res = await fetch(src);
        console.log("fetch status", res.status, res.headers.get("content-type"));
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const buffer = await res.arrayBuffer();
        console.log("bytes ontvangen:", buffer.byteLength);

        const ifds = UTIF.decode(buffer);
        const pagina = ifds[0];
        UTIF.decodeImage(buffer, pagina);
        console.log("afmeting:", pagina.width, "x", pagina.height);

        if (!pagina.width || !pagina.height) {
          throw new Error("Kon de afmetingen van de tif niet lezen");
        }

        const rgba = UTIF.toRGBA8(pagina);

        const bron = document.createElement("canvas");
        bron.width = pagina.width;
        bron.height = pagina.height;
        const bronCtx = bron.getContext("2d");
        if (!bronCtx) throw new Error("Geen canvas-context");
        bronCtx.putImageData(
          new ImageData(new Uint8ClampedArray(rgba.buffer), pagina.width, pagina.height),
          0,
          0
        );

        const factor = Math.min(1, MAX_ZIJDE / Math.max(pagina.width, pagina.height));
        const doel = document.createElement("canvas");
        doel.width = Math.round(pagina.width * factor);
        doel.height = Math.round(pagina.height * factor);
        const doelCtx = doel.getContext("2d");
        if (!doelCtx) throw new Error("Geen canvas-context");
        doelCtx.fillStyle = "white";
        doelCtx.fillRect(0, 0, doel.width, doel.height);
        doelCtx.drawImage(bron, 0, 0, doel.width, doel.height);

        doel.toBlob(
          (blob) => {
            if (geannuleerd) return;
            if (!blob) {
              setError("Omzetten naar afbeelding mislukt (waarschijnlijk te groot)");
              return;
            }
            objectUrl = URL.createObjectURL(blob);
            console.log("klaar, blob-grootte:", blob.size);
            setUrl(objectUrl);
          },
          "image/jpeg",
          0.9
        );
      } catch (e) {
        console.error(e);
        if (!geannuleerd) setError(e instanceof Error ? e.message : "Onbekende fout");
      }
    }

    laad();
    return () => {
      geannuleerd = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  return { url, error };
}