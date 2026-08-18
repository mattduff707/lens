import type { ReviewSortOption } from "../../store/ui";

export type SortColumn = { column: string; ascending: boolean };

/**
 * The list sorts client-side, so the preview has to order by the same field to
 * come back as a prefix of the final list instead of an unrelated slice. Only
 * the title column differs between media, since each table names it after its
 * own medium.
 */
export const sortColumns = (
  titleColumn: string
): Record<ReviewSortOption, SortColumn> => ({
  "review-desc": { column: "review_date", ascending: false },
  "review-asc": { column: "review_date", ascending: true },
  "release-desc": { column: "release_date", ascending: false },
  "release-asc": { column: "release_date", ascending: true },
  "rating-desc": { column: "rating", ascending: false },
  "rating-asc": { column: "rating", ascending: true },
  "title-asc": { column: titleColumn, ascending: true },
  "title-desc": { column: titleColumn, ascending: false },
});
