import { createContext, useContext, useState, useEffect, ReactNode } from "react";

const STORAGE_KEY = "horizone_compare";
const MAX_COMPARE = 2;

function load(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}

function save(ids: number[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

interface CompareContextValue {
  compareIds: number[];
  isInCompare: (id: number) => boolean;
  toggleCompare: (id: number) => void;
  clearCompare: () => void;
  isFull: boolean;
}

const CompareContext = createContext<CompareContextValue | null>(null);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [compareIds, setCompareIds] = useState<number[]>([]);

  useEffect(() => {
    setCompareIds(load());
  }, []);

  function isInCompare(id: number) {
    return compareIds.includes(id);
  }

  function toggleCompare(id: number) {
    setCompareIds(prev => {
      let next: number[];
      if (prev.includes(id)) {
        next = prev.filter(x => x !== id);
      } else {
        if (prev.length >= MAX_COMPARE) return prev;
        next = [...prev, id];
      }
      save(next);
      return next;
    });
  }

  function clearCompare() {
    save([]);
    setCompareIds([]);
  }

  return (
    <CompareContext.Provider value={{ compareIds, isInCompare, toggleCompare, clearCompare, isFull: compareIds.length >= MAX_COMPARE }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used inside CompareProvider");
  return ctx;
}
