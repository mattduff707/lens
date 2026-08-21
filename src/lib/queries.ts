import { queryOptions } from "@tanstack/react-query";
import type { RatingFilterValue, ReviewSortOption } from "../store/ui";
import {
  filmService,
  recommendationRequestService,
  reviewService,
} from "./supabase";

/** How many reviews the first paint renders before the full set arrives. */
export const REVIEW_PREVIEW_LIMIT = 30;

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

// Film query keys
export const filmKeys = {
  all: ["film"] as const,
  list: () => [...filmKeys.all, "list"] as const,
  publishedList: () => [...filmKeys.all, "list", "published"] as const,
  publishedPreview: (sort: ReviewSortOption, rating: RatingFilterValue) =>
    [...filmKeys.all, "list", "published", "preview", sort, rating] as const,
  item: (id: number) => [...filmKeys.all, "item", id] as const,
};

// Recommendation request query keys
export const recommendationRequestKeys = {
  all: ["recommendationRequest"] as const,
  list: () => [...recommendationRequestKeys.all, "list"] as const,
};

// Review queries. The public list and preview live on musicConfig, since the
// shared list builds those two from the media config it is handed.
export const reviewListQuery = queryOptions({
  queryKey: reviewKeys.list(),
  queryFn: () => reviewService.getAll(),
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

// Film queries
export const filmListQuery = queryOptions({
  queryKey: filmKeys.list(),
  queryFn: () => filmService.getAll(),
});

export const filmItemQuery = (id: number) =>
  queryOptions({
    queryKey: filmKeys.item(id),
    queryFn: () => filmService.getOne(id),
  });

// Review mutations
export const createReviewMutation = () => ({
  mutationFn: reviewService.create,
});

export const updateReviewMutation = () => ({
  mutationFn: ({
    id,
    updates,
  }: {
    id: number;
    updates: Parameters<typeof reviewService.update>[1];
  }) => reviewService.update(id, updates),
});

export const deleteReviewMutation = () => ({
  mutationFn: (id: number) => reviewService.delete(id),
});

// Film mutations
export const createFilmMutation = () => ({
  mutationFn: filmService.create,
});

export const updateFilmMutation = () => ({
  mutationFn: ({
    id,
    updates,
  }: {
    id: number;
    updates: Parameters<typeof filmService.update>[1];
  }) => filmService.update(id, updates),
});

export const deleteFilmMutation = () => ({
  mutationFn: (id: number) => filmService.delete(id),
});

// Recommendation request queries
export const recommendationRequestListQuery = queryOptions({
  queryKey: recommendationRequestKeys.list(),
  queryFn: () => recommendationRequestService.getAll(),
});

// Recommendation request mutations
export const createRecommendationRequestMutation = () => ({
  mutationFn: recommendationRequestService.create,
});

export const updateRecommendationRequestMutation = () => ({
  mutationFn: ({
    id,
    updates,
  }: {
    id: number;
    updates: Parameters<typeof recommendationRequestService.update>[1];
  }) => recommendationRequestService.update(id, updates),
});
