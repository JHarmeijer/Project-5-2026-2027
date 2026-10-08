import type { NextApiRequest, NextApiResponse } from "next";
import sharp from "sharp";

const BRON = "https://brillenmannetje.nl/work/veluwsverleden/ROM_ABV_KLEUR_DEF.tif";

let cache: Buffer | null = null;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (!cache) {
      const r = await fetch(BRON);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const input = Buffer.from(await r.arrayBuffer());

      cache = await sharp(input, { limitInputPixels: false })
        .resize({ width: 5000, withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();
    }

    res.setHeader("Content-Type", "image/webp");
    res.setHeader("Cache-Control", "public, max-age=31536000, s-maxage=31536000, immutable");
    res.send(cache);
  } catch (e) {
    res.status(502).send("Kon de plaat niet ophalen of omzetten");
  }
}