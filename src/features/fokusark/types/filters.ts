export type FremdriftBucket = "behind" | "on_track" | "ahead";

export type OfferAmountBucket =
  | "25_50k"
  | "50_100k"
  | "100_250k"
  | "250_500k"
  | "500k_1m"
  | "1m_plus";

export interface FokusarkFilters {
  responsible: string[];
  categoryIds: number[];
  fremdrift: FremdriftBucket[];
  offerAmount: OfferAmountBucket[];
  search: string;
}

export const EMPTY_FILTERS: FokusarkFilters = {
  responsible: [],
  categoryIds: [],
  fremdrift: [],
  offerAmount: [],
  search: "",
};

export const isFilterActive = (f: FokusarkFilters): boolean =>
  f.responsible.length > 0 ||
  f.categoryIds.length > 0 ||
  f.fremdrift.length > 0 ||
  f.offerAmount.length > 0 ||
  f.search.trim().length > 0;
