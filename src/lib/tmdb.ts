const TMDB_API = "https://api.themoviedb.org/3";
const TMDB_IMAGES = "https://image.tmdb.org/t/p";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

/** How many billed cast members are worth listing on a review. */
const CAST_LIMIT = 6;

export type PosterSize = "w92" | "w185" | "w500" | "original";

export interface MovieResult {
  id: number;
  title: string;
  posterPath: string;
  releaseDate: string;
  overview: string;
}

export interface MovieDetails {
  id: number;
  title: string;
  directors: string[];
  cast: string[];
  posterPath: string;
  releaseDate: string;
  overview: string;
}

interface TmdbMovie {
  id: number;
  title?: string;
  poster_path?: string | null;
  release_date?: string;
  overview?: string;
}

interface TmdbCredit {
  name?: string;
  job?: string;
}

interface TmdbMovieDetails extends TmdbMovie {
  credits?: {
    cast?: TmdbCredit[];
    crew?: TmdbCredit[];
  };
}

/**
 * TMDB serves each poster at a set of fixed widths, so the size is part of the
 * path rather than a query parameter.
 */
export const getPosterUrl = (
  posterPath: string,
  size: PosterSize = "w500"
): string => (posterPath ? `${TMDB_IMAGES}/${size}${posterPath}` : "");

const fetchJson = async <T>(
  path: string,
  params: Record<string, string>,
  signal?: AbortSignal
): Promise<T> => {
  if (!API_KEY) {
    throw new Error("Missing VITE_TMDB_API_KEY environment variable");
  }

  const query = new URLSearchParams({ ...params, api_key: API_KEY });
  const response = await fetch(`${TMDB_API}${path}?${query}`, { signal });

  if (!response.ok) {
    throw new Error(`TMDB request failed (${response.status})`);
  }

  return (await response.json()) as T;
};

const toMovieResult = (movie: TmdbMovie): MovieResult => ({
  id: movie.id,
  title: movie.title ?? "",
  posterPath: movie.poster_path ?? "",
  releaseDate: movie.release_date?.slice(0, 10) ?? "",
  overview: movie.overview ?? "",
});

export const searchMovies = async (
  term: string,
  signal?: AbortSignal
): Promise<MovieResult[]> => {
  const data = await fetchJson<{ results: TmdbMovie[] }>(
    "/search/movie",
    { query: term, include_adult: "false" },
    signal
  );

  return data.results.filter((movie) => movie.title).map(toMovieResult);
};

export const getMovieDetails = async (
  id: number,
  signal?: AbortSignal
): Promise<MovieDetails> => {
  const data = await fetchJson<TmdbMovieDetails>(
    `/movie/${id}`,
    { append_to_response: "credits" },
    signal
  );

  const directors = (data.credits?.crew ?? [])
    .filter((member) => member.job === "Director")
    .map((member) => member.name ?? "")
    .filter(Boolean);

  // The cast array comes back in billing order, so the head of it is the
  // headline cast.
  const cast = (data.credits?.cast ?? [])
    .slice(0, CAST_LIMIT)
    .map((member) => member.name ?? "")
    .filter(Boolean);

  return { ...toMovieResult(data), directors, cast };
};
