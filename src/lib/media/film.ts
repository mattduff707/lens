import { COVER_PRELOAD_COUNT, preloadCoverImages } from "../coverImage";
import { filmKeys, REVIEW_PREVIEW_LIMIT } from "../queries";
import { filmService, type Film } from "../supabase";
import { sortColumns } from "./sort";
import type { MediaConfig, MediaItem } from "./types";

const SORT_COLUMNS = sortColumns("title");

export const filmToMediaItem = (film: Film): MediaItem => ({
  id: film.id,
  title: film.title,
  subtitle: film.director ?? [],
  imageUrl: film.poster ?? "",
  rating: film.rating,
  description: film.description ?? "",
  metaItems: film.cast_members ?? [],
  reviewDate: film.review_date ?? "",
  releaseDate: film.release_date ?? "",
  status: film.status,
  searchTerms: [
    film.title,
    ...(film.director ?? []),
    ...(film.cast_members ?? []),
  ],
});

export const filmConfig: MediaConfig<Film> = {
  kind: "film",
  aspect: "poster",
  metaLabel: "Starring",
  emptyMessage: "No films match",
  loadingLabel: "Loading films",
  errorMessage: "Failed to load films. Please try again.",
  publishedListKey: filmKeys.publishedList(),
  fetchPublishedList: () => filmService.getPublished(),
  publishedPreviewKey: (sort, rating) => filmKeys.publishedPreview(sort, rating),
  fetchPublishedPreview: async (sort, rating) => {
    const films = await filmService.getPublishedPreview({
      limit: REVIEW_PREVIEW_LIMIT,
      rating,
      ...SORT_COLUMNS[sort],
    });
    preloadCoverImages(
      films
        .slice(0, COVER_PRELOAD_COUNT)
        .map((film) => film.poster)
        .filter(Boolean)
    );
    return films;
  },
  toMediaItem: filmToMediaItem,
};
