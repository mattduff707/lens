import type { RatingFilterValue, ReviewSortOption } from "../../store/ui";
import type { ReviewStatus } from "../supabase";

export type MediaKind = "music" | "film";

/** Album art is square; film posters are 2:3. */
export type CoverAspect = "square" | "poster";

/** The medium-agnostic shape the list and card render. */
export interface MediaItem {
  id: number;
  title: string;
  /** Artists for music, directors for film. */
  subtitle: string[];
  imageUrl: string;
  rating: 1 | 2 | 3 | 4 | 5;
  description: string;
  /** Highlights for music, cast for film. */
  metaItems: string[];
  reviewDate: string;
  releaseDate: string;
  status: ReviewStatus;
  /** Everything the list searches over, flattened at map time. */
  searchTerms: string[];
}

/**
 * Describes one medium well enough for the shared list and card to render it,
 * so music and film differ only by this object.
 */
export interface MediaConfig<TRow> {
  kind: MediaKind;
  aspect: CoverAspect;
  /** Heading for the secondary detail row on a card. */
  metaLabel: string;
  emptyMessage: string;
  loadingLabel: string;
  errorMessage: string;
  publishedListKey: readonly unknown[];
  fetchPublishedList: () => Promise<TRow[]>;
  publishedPreviewKey: (
    sort: ReviewSortOption,
    rating: RatingFilterValue
  ) => readonly unknown[];
  fetchPublishedPreview: (
    sort: ReviewSortOption,
    rating: RatingFilterValue
  ) => Promise<TRow[]>;
  toMediaItem: (row: TRow) => MediaItem;
}
