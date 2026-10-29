import type { NextApiRequest, NextApiResponse } from "next";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const BRON = join(process.cwd(), "src", "assets", "Schoolplaat.jpg");
const MAX_INPUT_PIXELS = 150_000_000;

let cachedImage: Promise<Buffer> | null = null;

async function laadSchoolplaat() {
  if (!cachedImage) {
    cachedImage = (async () => {
      const input = await readFile(BRON);
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