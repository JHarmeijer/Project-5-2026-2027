export type Speler = "een" | "twee";
export type Steen = Speler | null;

export type SpelStatus = {
  bord: Steen[];
  aanDeBeurt: Speler;
  over: Record<Speler, number>;
  gekozen: number | null;
  moetSlaan: boolean;
  winnaar: Speler | null;
  melding: string;
};

export type SpelActie =
  | { type: "reset" }
  | { type: "plaatsen"; plek: number }
  | { type: "verplaatsen"; plek: number }
  | { type: "robot-verplaatsen"; vanaf: number; naar: number }
  | { type: "slaan"; plek: number };

export const punten: Array<[number, number]> = [
  [0, 0], [3, 0], [6, 0], [6, 3], [6, 6], [3, 6], [0, 6], [0, 3],
  [1, 1], [3, 1], [5, 1], [5, 3], [5, 5], [3, 5], [1, 5], [1, 3],
  [2, 2], [3, 2], [4, 2], [4, 3], [4, 4], [3, 4], [2, 4], [2, 3],
];

export const verbindingen: Array<[number, number]> = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0],
  [8, 9], [9, 10], [10, 11], [11, 12], [12, 13], [13, 14], [14, 15], [15, 8],
  [16, 17], [17, 18], [18, 19], [19, 20], [20, 21], [21, 22], [22, 23], [23, 16],
  [1, 9], [3, 11], [5, 13], [7, 15], [9, 17], [11, 19], [13, 21], [15, 23],
];

export const molens: Array<[number, number, number]> = [
  [0, 1, 2], [2, 3, 4], [4, 5, 6], [6, 7, 0],
  [8, 9, 10], [10, 11, 12], [12, 13, 14], [14, 15, 8],
  [16, 17, 18], [18, 19, 20], [20, 21, 22], [22, 23, 16],
  [1, 9, 17], [3, 11, 19], [5, 13, 21], [7, 15, 23],
];

export function maakNieuwSpel(): SpelStatus {
  return {
    bord: Array(24).fill(null),
    aanDeBeurt: "een",
    over: { een: 9, twee: 9 },
    gekozen: null,
    moetSlaan: false,
    winnaar: null,
    melding: "Jij bent aan de beurt. Plaats een steen op een leeg punt.",
  };
}

export function zittenInMolen(bord: Steen[], plek: number, speler: Speler) {
  return molens.some(
    (molen) => molen.includes(plek) && molen.every((punt) => bord[punt] === speler),
  );
}

export function legaleZetPunten(bord: Steen[], vanaf: number) {
  return verbindingen
    .filter(([a, b]) => a === vanaf || b === vanaf)
    .map(([a, b]) => (a === vanaf ? b : a))
    .filter((plek) => bord[plek] === null);
}

export function magSlaan(bord: Steen[], plek: number, speler: Speler) {
  if (bord[plek] !== speler) return false;
  const stenenBuitenMolens = bord
    .map((steen, index) => (steen === speler && !zittenInMolen(bord, index, speler) ? index : -1))
    .filter((index) => index >= 0);
  return stenenBuitenMolens.length === 0 || !zittenInMolen(bord, plek, speler);
}

export function aantalStenen(bord: Steen[], speler: Speler) {
  return bord.filter((steen) => steen === speler).length;
}

function alleStenenGeplaatst(status: SpelStatus) {
  return status.over.een === 0 && status.over.twee === 0;
}

export function heeftLegaleZet(bord: Steen[], speler: Speler) {
  if (aantalStenen(bord, speler) === 3) {
    return bord.some((steen) => steen === null);
  }
  return bord.some(
    (steen, index) => steen === speler && legaleZetPunten(bord, index).length > 0,
  );
}

export function volgendeBeurt(status: SpelStatus, speler: Speler): SpelStatus {
  const volgende: Speler = speler === "een" ? "twee" : "een";
  if (alleStenenGeplaatst(status)) {
    if (aantalStenen(status.bord, volgende) < 3 || !heeftLegaleZet(status.bord, volgende)) {
      return { ...status, aanDeBeurt: volgende, winnaar: speler, melding: "Je hebt gewonnen!" };
    }
  }
  const naam = volgende === "een" ? "Jij bent" : "Speler 2 is";
  return {
    ...status,
    aanDeBeurt: volgende,
    gekozen: null,
    moetSlaan: false,
    melding: `${naam} aan de beurt.`,
  };
}

function naZet(status: SpelStatus, bord: Steen[], speler: Speler): SpelStatus {
  const nieuweMolen = molens.some(
    (molen) =>
      molen.some((plek) => status.bord[plek] !== speler) &&
      molen.every((plek) => bord[plek] === speler),
  );
  if (nieuweMolen) {
    const tegenstander: Speler = speler === "een" ? "twee" : "een";
    if (aantalStenen(bord, tegenstander) > 0) {
      return {
        ...status,
        bord,
        gekozen: null,
        moetSlaan: true,
        melding: "Molen! Kies een steen van je tegenstander om weg te halen.",
      };
    }
  }
  return volgendeBeurt({ ...status, bord }, speler);
}

export function spelReducer(status: SpelStatus, actie: SpelActie): SpelStatus {
  if (actie.type === "reset") return maakNieuwSpel();
  if (status.winnaar) return status;
  const speler = status.aanDeBeurt;
  const tegenstander: Speler = speler === "een" ? "twee" : "een";

  if (actie.type === "slaan") {
    if (!status.moetSlaan || !magSlaan(status.bord, actie.plek, tegenstander)) return status;
    const bord = [...status.bord];
    bord[actie.plek] = null;
    const bijgewerkt = {
      ...status,
      bord,
      moetSlaan: false,
      melding: "De steen is weggehaald.",
    };
    return volgendeBeurt(bijgewerkt, speler);
  }

  if (actie.type === "plaatsen") {
    if (status.moetSlaan || status.over[speler] === 0 || status.bord[actie.plek] !== null) return status;
    const bord = [...status.bord];
    bord[actie.plek] = speler;
    const over = { ...status.over, [speler]: status.over[speler] - 1 };
    return naZet({ ...status, over }, bord, speler);
  }

  if (actie.type === "robot-verplaatsen") {
    const kanVliegen = aantalStenen(status.bord, speler) === 3;
    if (
      status.moetSlaan ||
      status.over.een > 0 ||
      status.over.twee > 0 ||
      status.bord[actie.vanaf] !== speler ||
      status.bord[actie.naar] !== null ||
      (!kanVliegen && !legaleZetPunten(status.bord, actie.vanaf).includes(actie.naar))
    ) {
      return status;
    }
    const bord = [...status.bord];
    bord[actie.vanaf] = null;
    bord[actie.naar] = speler;
    return naZet({ ...status, gekozen: null }, bord, speler);
  }

  if (status.moetSlaan || status.over.een > 0 || status.over.twee > 0) return status;
  if (status.gekozen === null) {
    if (status.bord[actie.plek] !== speler) return status;
    return {
      ...status,
      gekozen: actie.plek,
      melding: "Kies nu een leeg punt naast je steen.",
    };
  }

  if (status.bord[actie.plek] === speler) {
    return { ...status, gekozen: actie.plek, melding: "Kies nu een leeg punt naast je steen." };
  }
  const kanVliegen = aantalStenen(status.bord, speler) === 3;
  if (
    status.bord[actie.plek] !== null ||
    (!kanVliegen && !legaleZetPunten(status.bord, status.gekozen).includes(actie.plek))
  ) {
    return status;
  }
  const bord = [...status.bord];
  bord[status.gekozen] = null;
  bord[actie.plek] = speler;
  return naZet({ ...status, gekozen: null }, bord, speler);
}

export function scoreZet(bord: Steen[], plek: number, speler: Speler) {
  const nieuwBord = [...bord];
  nieuwBord[plek] = speler;
  const molensGemaakt = molens.filter(
    (molen) =>
      molen.includes(plek) &&
      molen.every((punt) => nieuwBord[punt] === speler) &&
      molen.some((punt) => bord[punt] !== speler),
  ).length;
  const openMolens = molens.filter(
    (molen) =>
      molen.filter((punt) => nieuwBord[punt] === speler).length === 2 &&
      molen.filter((punt) => nieuwBord[punt] === null).length === 1,
  ).length;
  return molensGemaakt * 100 + openMolens * 3;
}

export function kiesRobotZet(status: SpelStatus): SpelActie {
  if (status.moetSlaan) {
    const tegenstander: Speler = status.aanDeBeurt === "een" ? "twee" : "een";
    const doelen = status.bord
      .map((steen, plek) => (magSlaan(status.bord, plek, tegenstander) ? plek : -1))
      .filter((plek) => plek >= 0);
    if (doelen.length === 0) throw new Error("De robot kan geen steen van de tegenstander slaan.");
    return { type: "slaan", plek: doelen[0] };
  }
  const legePlekken = status.bord
    .map((steen, plek) => (steen === null ? plek : -1))
    .filter((plek) => plek >= 0);
  if (status.over.twee > 0) {
    const plek = legePlekken.reduce((beste, kandidaat) =>
      scoreZet(status.bord, kandidaat, "twee") > scoreZet(status.bord, beste, "twee")
        ? kandidaat
        : beste,
    );
    return { type: "plaatsen", plek };
  }
  const zetten = status.bord.flatMap((steen, vanaf) =>
    steen === "twee"
      ? (aantalStenen(status.bord, "twee") === 3
          ? legePlekken
          : legaleZetPunten(status.bord, vanaf)
        ).map((naar) => ({ vanaf, naar }))
      : [],
  );
  if (zetten.length === 0) throw new Error("De robot heeft geen legale zet.");
  const besteZet = zetten.reduce<{ vanaf: number; naar: number; score: number }>((beste, zet) => {
    const bordNaZet = [...status.bord];
    bordNaZet[zet.vanaf] = null;
    const score = scoreZet(bordNaZet, zet.naar, "twee");
    return score > beste.score ? { ...zet, score } : beste;
  }, { vanaf: zetten[0].vanaf, naar: zetten[0].naar, score: -1 });
  return { type: "robot-verplaatsen", vanaf: besteZet.vanaf, naar: besteZet.naar };
}
