import assert from "node:assert/strict";
import test from "node:test";

import { normalizeFoodItems } from "./foods";

test("normalizeFoodItems trims names and removes empty values", () => {
  assert.deepEqual(normalizeFoodItems([" 火锅 ", "", "  ", "拉面"]), ["火锅", "拉面"]);
});

test("normalizeFoodItems falls back when every value is empty", () => {
  assert.deepEqual(normalizeFoodItems(["", " "], ["寿司"]), ["寿司"]);
});
