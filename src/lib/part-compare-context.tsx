"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const STORAGE_KEY = "gearup_compare_parts";

export type ComparePart = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  stockQuantity: number;
  restockLeadDays: number;
};

type PartCompareContextValue = {
  selected: ComparePart[];
  togglePart: (part: ComparePart) => void;
  removePart: (id: string) => void;
  clearAll: () => void;
  isSelected: (id: string) => boolean;
};

const PartCompareContext = createContext<PartCompareContextValue | null>(null);

export function PartCompareProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selected, setSelected] = useState<ComparePart[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ComparePart[];
        if (Array.isArray(parsed)) setSelected(parsed);
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selected));
  }, [selected, hydrated]);

  const togglePart = useCallback((part: ComparePart) => {
    setSelected((prev) => {
      const exists = prev.find((p) => p.id === part.id);
      if (exists) return prev.filter((p) => p.id !== part.id);
      if (prev.length >= 4) return prev; // max 4 for comparison
      return [...prev, part];
    });
  }, []);

  const removePart = useCallback((id: string) => {
    setSelected((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setSelected([]);
  }, []);

  const isSelected = useCallback(
    (id: string) => selected.some((p) => p.id === id),
    [selected],
  );

  return (
    <PartCompareContext.Provider
      value={{ selected, togglePart, removePart, clearAll, isSelected }}
    >
      {children}
    </PartCompareContext.Provider>
  );
}

export function usePartCompare() {
  const ctx = useContext(PartCompareContext);
  if (!ctx) {
    throw new Error("usePartCompare must be used within PartCompareProvider");
  }
  return ctx;
}
