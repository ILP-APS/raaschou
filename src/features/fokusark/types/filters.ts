export type FremdriftBucket = "behind" | "on_track" | "ahead";

export interface FokusarkFilters {
  responsible: string[];
  categoryIds: number[];
  fremdrift: FremdriftBucket[];
  search: string;
}

export const EMPTY_FILTERS: FokusarkFilters = {
  responsible: [],
  categoryIds: [],
  fremdrift: [],
  search: "",
};

export const isFilterActive = (f: FokusarkFilters): boolean =>
  f.responsible.length > 0 ||
  f.categoryIds.length > 0 ||
  f.fremdrift.length > 0 ||
  f.search.trim().length > 0;
