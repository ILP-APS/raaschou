import { useCallback, useEffect, useState } from "react";
import { EMPTY_FILTERS, FokusarkFilters } from "../types/filters";

const STORAGE_KEY = "fokusark-filters";

const loadFromStorage = (): FokusarkFilters => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_FILTERS;
    const parsed = JSON.parse(raw);
    return {
      responsible: Array.isArray(parsed.responsible) ? parsed.responsible : [],
      categoryIds: Array.isArray(parsed.categoryIds) ? parsed.categoryIds : [],
      fremdrift: Array.isArray(parsed.fremdrift) ? parsed.fremdrift : [],
      offerAmount: Array.isArray(parsed.offerAmount) ? parsed.offerAmount : [],
      search: "",
    };
  } catch {
    return EMPTY_FILTERS;
  }
};

export const useFokusarkFilters = () => {
  const [filters, setFilters] = useState<FokusarkFilters>(loadFromStorage);

  useEffect(() => {
    const { search, ...persisted } = filters;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
  }, [filters]);

  const update = useCallback(<K extends keyof FokusarkFilters>(
    key: K,
    value: FokusarkFilters[K],
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearAll = useCallback(() => {
    setFilters({ ...EMPTY_FILTERS });
  }, []);

  return { filters, update, clearAll };
};
