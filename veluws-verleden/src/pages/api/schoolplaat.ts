import type { NextApiRequest, NextApiResponse } from "next";
import { Readable } from "stream";

export const config = {
  api: {
    responseLimit: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const response = await fetch(
    "https://brillenmannetje.nl/work/veluwsverleden/ROM_ABV_KLEUR_DEF.tif"
  );

  if (!response.ok || !response.body) {
    res.status(502).send("Kon de plaat niet ophalen");
    return;
  }

  res.setHeader("Content-Type", "image/tiff");
  res.setHeader("Cache-Control", "public, max-age=86400");

  Readable.fromWeb(response.body as any).pipe(res);
}