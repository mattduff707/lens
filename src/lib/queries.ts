import { queryOptions } from "@tanstack/react-query";
import type { RatingFilterValue, ReviewSortOption } from "../store/ui";
import { reviewService } from "./supabase";

/** How many reviews the first paint renders before the full set arrives. */
export const REVIEW_PREVIEW_LIMIT = 30;

// The list sorts client-side, so the preview has to order by the same field to
// come back as a prefix of the final list instead of an unrelated slice.
const SORT_COLUMNS: Record<
  ReviewSortOption,
  { column: string; ascending: boolean }
> = {
  "review-desc": { column: "review_date", ascending: false },
  "review-asc": { column: "review_date", ascending: true },
  "release-desc": { column: "release_date", ascending: false },
  "release-asc": { column: "release_date", ascending: true },
  "rating-desc": { column: "rating", ascending: false },
  "rating-asc": { column: "rating", ascending: true },
  "title-asc": { column: "album", ascending: true },
  "title-desc": { column: "album", ascending: false },
};

// Review query keys
export const reviewKeys = {
  all: ["review"] as const,
  list: () => [...reviewKeys.all, "list"] as const,
  // Nested under list() so invalidating the list also refreshes this.
  publishedList: () => [...reviewKeys.all, "list", "published"] as const,
  publishedPreview: (sort: ReviewSortOption, rating: RatingFilterValue) =>
    [...reviewKeys.all, "list", "published", "preview", sort, rating] as const,
  item: (id: number) => [...reviewKeys.all, "item", id] as const,
  byAlbum: (album: string) => [...reviewKeys.all, "album", album] as const,
  byArtist: (artist: string) => [...reviewKeys.all, "artist", artist] as const,
  byRating: (rating: 1 | 2 | 3 | 4 | 5) =>
    [...reviewKeys.all, "rating", rating] as const,
};

// Review queries
export const reviewListQuery = queryOptions({
  queryKey: reviewKeys.list(),
  queryFn: () => reviewService.getAll(),
});

export const publishedReviewListQuery = queryOptions({
  queryKey: reviewKeys.publishedList(),
  queryFn: () => reviewService.getPublished(),
});

export const publishedReviewPreviewQuery = (
  sort: ReviewSortOption,
  rating: RatingFilterValue
) =>
  queryOptions({
    queryKey: reviewKeys.publishedPreview(sort, rating),
    queryFn: () =>
      reviewService.getPublishedPreview({
        limit: REVIEW_PREVIEW_LIMIT,
        rating,
        ...SORT_COLUMNS[sort],
      }),
  });

export const reviewItemQuery = (id: number) =>
  queryOptions({
    queryKey: reviewKeys.item(id),
    queryFn: () => reviewService.getOne(id),
  });

export const reviewByAlbumQuery = (album: string) =>
  queryOptions({
    queryKey: reviewKeys.byAlbum(album),
    queryFn: () => reviewService.getByAlbum(album),
  });

export const reviewByArtistQuery = (artist: string) =>
  queryOptions({
    queryKey: reviewKeys.byArtist(artist),
    queryFn: () => reviewService.getByArtist(artist),
  });

export const reviewByRatingQuery = (rating: 1 | 2 | 3 | 4 | 5) =>
  queryOptions({
    queryKey: reviewKeys.byRating(rating),
    queryFn: () => reviewService.getByRating(rating),
  });

// Review mutations
export const createReviewMutation = () => ({
  mutationFn: reviewService.create,
  onSuccess: () => {
    // Invalidate review list queries
    // This will be handled by the mutation hook
  },
});

export const updateReviewMutation = () => ({
  mutationFn: ({
    id,
    updates,
  }: {
    id: number;
    updates: Parameters<typeof reviewService.update>[1];
  }) => reviewService.update(id, updates),
  onSuccess: () => {
    // Invalidate review list and item queries
    // This will be handled by the mutation hook
  },
});

export const deleteReviewMutation = () => ({
  mutationFn: (id: number) => reviewService.delete(id),
  onSuccess: () => {
    // Invalidate review list queries
    // This will be handled by the mutation hook
  },
});
