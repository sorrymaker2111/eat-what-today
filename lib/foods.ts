export const defaultFoodItems = [
  "火锅",
  "烤肉",
  "麻辣烫",
  "炒饭",
  "炸鸡",
  "寿司",
  "披萨",
  "汉堡",
  "面条",
  "拉面",
  "饺子",
  "煎饼",
  "盖浇饭",
  "沙拉",
  "三明治",
  "烧烤"
];

export const wheelColors = [
  "#ff4b3f",
  "#19b6a3",
  "#ffd166",
  "#ef476f",
  "#5b6ee1",
  "#06d6a0",
  "#f78c2f",
  "#118ab2",
  "#ff7f51",
  "#00a6a6",
  "#f7c948",
  "#c76d3a",
  "#7bdff2",
  "#7c8794",
  "#d1495b",
  "#6c4ab6"
];

export function normalizeFoodItems(items: unknown, fallback = defaultFoodItems): string[] {
  if (!Array.isArray(items)) {
    return [...fallback];
  }

  const normalized = items
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);

  return normalized.length > 0 ? normalized : [...fallback];
}

export function getWheelColor(index: number): string {
  return wheelColors[index % wheelColors.length];
}

export function createWheelGradient(items: string[]): string {
  if (items.length === 0) {
    return "#ff4b3f";
  }

  const step = 100 / items.length;

  return `conic-gradient(${items
    .map((_, index) => {
      const start = (index * step).toFixed(4);
      const end = ((index + 1) * step).toFixed(4);
      return `${getWheelColor(index)} ${start}% ${end}%`;
    })
    .join(", ")})`;
}
