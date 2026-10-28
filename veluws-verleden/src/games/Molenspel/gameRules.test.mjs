import assert from "node:assert/strict";
import test from "node:test";
import {
  heeftLegaleZet,
  maakNieuwSpel,
  magSlaan,
  volgendeBeurt,
  spelReducer,
} from "./gameRules.ts";

test("three remaining stones can fly to any empty point", () => {
  const bord = Array(24).fill(null);
  bord[0] = "twee";
  bord[1] = "twee";
  bord[2] = "twee";
  for (let plek = 3; plek < 12; plek++) bord[plek] = "een";
  bord[14] = null;

  assert.equal(heeftLegaleZet(bord, "twee"), true);
});

test("three stones with a distant empty point do not lose for being blocked", () => {
  const status = maakNieuwSpel();
  status.bord.fill(null);
  status.bord[0] = "twee";
  status.bord[1] = "twee";
  status.bord[2] = "twee";
  for (let plek = 3; plek < 12; plek++) status.bord[plek] = "een";
  status.over = { een: 0, twee: 0 };

  const next = volgendeBeurt(status, "een");

  assert.equal(next.winnaar, null);
  assert.equal(next.aanDeBeurt, "twee");
});

test("a player with four blocked stones loses despite empty distant points", () => {
  const status = maakNieuwSpel();
  for (const plek of [0, 2, 4, 6]) status.bord[plek] = "twee";
  for (const plek of [1, 3, 5, 7]) status.bord[plek] = "een";
  status.over = { een: 0, twee: 0 };

  const next = volgendeBeurt(status, "een");

  assert.equal(next.winnaar, "een");
});

test("a player with three stones loses when no empty point is available", () => {
  const bord = Array(24).fill("een");
  bord[0] = "twee";
  bord[1] = "twee";
  bord[2] = "twee";

  assert.equal(heeftLegaleZet(bord, "twee"), false);
});

test("forming a mill requires removing an opponent stone", () => {
  const status = maakNieuwSpel();
  status.bord[0] = "een";
  status.bord[1] = "een";
  status.bord[8] = "twee";
  status.over = { een: 1, twee: 8 };

  const next = spelReducer(status, { type: "plaatsen", plek: 2 });

  assert.equal(next.moetSlaan, true);
  assert.equal(next.bord[2], "een");
});

test("a stone in a mill is protected while the opponent has stones outside mills", () => {
  const bord = Array(24).fill(null);
  bord[8] = "twee";
  bord[9] = "twee";
  bord[10] = "twee";
  bord[12] = "twee";

  assert.equal(magSlaan(bord, 8, "twee"), false);
  assert.equal(magSlaan(bord, 12, "twee"), true);
});
