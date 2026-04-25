"use client";

import { useEffect, useMemo, useState } from "react";

import { defaultFoodItems, normalizeFoodItems } from "@/lib/foods";

const STORAGE_KEY = "foodItems";

export function useLocalFoods() {
  const [foods, setFoods] = useState<string[]>(defaultFoodItems);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);

    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setFoods(normalizeFoodItems(JSON.parse(saved)));
      }
    } catch {
      setFoods(defaultFoodItems);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeFoodItems(foods)));
  }, [foods, isHydrated]);

  return useMemo(
    () => ({
      foods,
      setFoods,
      resetFoods: () => setFoods(defaultFoodItems),
      isHydrated
    }),
    [foods, isHydrated]
  );
}
