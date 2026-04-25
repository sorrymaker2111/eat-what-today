import assert from "node:assert/strict";
import test from "node:test";

import { calculateSpin } from "./spin";

test("calculateSpin returns a selected index and advances clockwise by several full turns", () => {
  const result = calculateSpin({
    itemCount: 16,
    currentRotation: 130,
    randomIndex: 5,
    randomOffsetRatio: 0.5,
    extraSpins: 6
  });

  assert.equal(result.selectedIndex, 5);
  assert.equal(result.targetAngle, 123.75);
  assert.equal(result.rotation, 2396.25);
});

test("calculateSpin rejects empty wheels", () => {
  assert.throws(
    () =>
      calculateSpin({
        itemCount: 0,
        currentRotation: 0,
        randomIndex: 0,
        randomOffsetRatio: 0.5,
        extraSpins: 5
      }),
    /itemCount must be greater than 0/
  );
});
