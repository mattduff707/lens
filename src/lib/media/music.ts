import { COVER_PRELOAD_COUNT, preloadCoverImages } from "../coverImage";
import { REVIEW_PREVIEW_LIMIT, reviewKeys } from "../queries";
import { reviewService, type Review } from "../supabase";
import { sortColumns } from "./sort";
import type { MediaConfig, MediaItem } from "./types";

const SORT_COLUMNS = sortColumns("album");

export const reviewToMediaItem = (review: Review): MediaItem => ({
  id: review.id,
  title: review.album,
  subtitle: review.artist ?? [],
  imageUrl: review.album_cover ?? "",
  rating: review.rating,
  description: review.description ?? "",
  metaItems: review.highlights ?? [],
  reviewDate: review.review_date ?? "",
  releaseDate: review.release_date ?? "",
  status: review.status,
  searchTerms: [
    review.album,
    ...(review.artist ?? []),
    ...(review.tracklist ?? []),
  ],
});

export const musicConfig: MediaConfig<Review> = {
  kind: "music",
  aspect: "square",
  metaLabel: "Highlights",
  emptyMessage: "No reviews match",
  loadingLabel: "Loading reviews",
  errorMessage: "Failed to load reviews. Please try again.",
  publishedListKey: reviewKeys.publishedList(),
  fetchPublishedList: () => reviewService.getPublished(),
  publishedPreviewKey: (sort, rating) =>
    reviewKeys.publishedPreview(sort, rating),
  fetchPublishedPreview: async (sort, rating) => {
    const reviews = await reviewService.getPublishedPreview({
      limit: REVIEW_PREVIEW_LIMIT,
      rating,
      ...SORT_COLUMNS[sort],
    });
    preloadCoverImages(
      reviews
        .slice(0, COVER_PRELOAD_COUNT)
        .map((review) => review.album_cover)
        .filter(Boolean)
    );
    return reviews;
  },
  toMediaItem: reviewToMediaItem,
};
