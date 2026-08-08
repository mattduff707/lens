import { queryOptions } from "@tanstack/react-query";
import { reviewService } from "./supabase";

// Review query keys
export const reviewKeys = {
  all: ["review"] as const,
  list: () => [...reviewKeys.all, "list"] as const,
  // Nested under list() so invalidating the list also refreshes this.
  publishedList: () => [...reviewKeys.all, "list", "published"] as const,
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
