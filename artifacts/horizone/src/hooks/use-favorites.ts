import { useState, useEffect } from "react";

const STORAGE_KEY = "horizone_favorites";

function loadFavorites(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as number[];
  } catch {
    return [];
  }
}

function saveFavorites(ids: number[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  useEffect(() => {
    setFavoriteIds(loadFavorites());
  }, []);

  function isFavorited(vehicleId: number): boolean {
    return favoriteIds.includes(vehicleId);
  }

  function toggleFavorite(vehicleId: number): void {
    setFavoriteIds(prev => {
      const next = prev.includes(vehicleId)
        ? prev.filter(id => id !== vehicleId)
        : [...prev, vehicleId];
      saveFavorites(next);
      return next;
    });
  }

  return { favoriteIds, isFavorited, toggleFavorite };
}
