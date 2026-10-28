import type { NextApiRequest, NextApiResponse } from "next";
import sharp from "sharp";

const BRON = "https://brillenmannetje.nl/work/veluwsverleden/ROM_ABV_KLEUR_DEF.tif";
const MAX_DOWNLOAD_BYTES = 256 * 1024 * 1024;
const MAX_INPUT_PIXELS = 150_000_000;

let cachedImage: Promise<Buffer> | null = null;

async function leesBegrensdeResponse(response: Response) {
  const contentLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_DOWNLOAD_BYTES) {
    throw new Error(`Schoolplaat is groter dan de limiet van ${MAX_DOWNLOAD_BYTES} bytes.`);
  }
  if (!response.body) throw new Error("De server heeft geen afbeeldingsdata teruggestuurd.");

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_DOWNLOAD_BYTES) {
        await reader.cancel();
        throw new Error(`Schoolplaat is groter dan de limiet van ${MAX_DOWNLOAD_BYTES} bytes.`);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks);
}

async function laadSchoolplaat() {
  if (!cachedImage) {
    cachedImage = (async () => {
      const response = await fetch(BRON, { signal: AbortSignal.timeout(20_000) });
      if (!response.ok) throw new Error(`Ophalen schoolplaat mislukt: HTTP ${response.status}`);
      const input = await leesBegrensdeResponse(response);
      return sharp(input, { limitInputPixels: MAX_INPUT_PIXELS })
        .resize({ width: 5000, withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();
    })();
  }

  try {
    return await cachedImage;
  } catch (error) {
    cachedImage = null;
    throw error;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).send("Alleen GET-verzoeken zijn toegestaan.");
    return;
  }

  try {
    const image = await laadSchoolplaat();
    res.setHeader("Content-Type", "image/webp");
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800");
    res.send(image);
  } catch (error) {
    console.error("Schoolplaat ophalen of converteren mislukt:", error);
    res.status(502).send("Kon de plaat niet ophalen of omzetten");
  }
}