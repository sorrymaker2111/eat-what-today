export type CalculateSpinInput = {
  itemCount: number;
  currentRotation: number;
  randomIndex: number;
  randomOffsetRatio: number;
  extraSpins: number;
};

export type SpinResult = {
  selectedIndex: number;
  targetAngle: number;
  rotation: number;
};

export function calculateSpin(input: CalculateSpinInput): SpinResult {
  const { itemCount, currentRotation, randomIndex, randomOffsetRatio, extraSpins } = input;

  if (itemCount <= 0) {
    throw new Error("itemCount must be greater than 0");
  }

  const selectedIndex = Math.min(Math.max(randomIndex, 0), itemCount - 1);
  const sectorAngle = 360 / itemCount;
  const offsetRatio = Math.min(Math.max(randomOffsetRatio, 0.1), 0.9);
  const targetAngle = selectedIndex * sectorAngle + sectorAngle * offsetRatio;
  const angleToTarget = 360 - targetAngle;
  const currentModulo = currentRotation % 360;
  let angleFromCurrent = angleToTarget - currentModulo;

  if (angleFromCurrent < 0) {
    angleFromCurrent += 360;
  }

  return {
    selectedIndex,
    targetAngle,
    rotation: currentRotation + angleFromCurrent + extraSpins * 360
  };
}

export function createRandomSpin(itemCount: number, currentRotation: number): SpinResult {
  return calculateSpin({
    itemCount,
    currentRotation,
    randomIndex: Math.floor(Math.random() * itemCount),
    randomOffsetRatio: 0.1 + Math.random() * 0.8,
    extraSpins: 5 + Math.floor(Math.random() * 4)
  });
}
