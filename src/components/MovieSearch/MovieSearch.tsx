import * as Label from "@radix-ui/react-label";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getPosterUrl, type MovieResult, searchMovies } from "../../lib/tmdb";

interface MovieSearchProps {
  onSelect: (movie: MovieResult) => void;
  disabled?: boolean;
}

const MIN_TERM_LENGTH = 2;
const DEBOUNCE_MS = 300;
const PAGE_SIZE = 20;

export const MovieSearch = ({ onSelect, disabled }: MovieSearchProps) => {
  const [term, setTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedTerm(term.trim()), DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [term]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [debouncedTerm]);

  const {
    data: results = [],
    isFetching,
    error,
  } = useQuery({
    queryKey: ["tmdb", "movies", debouncedTerm],
    queryFn: ({ signal }) => searchMovies(debouncedTerm, signal),
    enabled: debouncedTerm.length >= MIN_TERM_LENGTH,
    staleTime: 5 * 60 * 1000,
  });

  const handleSelect = (movie: MovieResult) => {
    onSelect(movie);
    setTerm("");
    setDebouncedTerm("");
    setVisibleCount(PAGE_SIZE);
  };

  const showResults = debouncedTerm.length >= MIN_TERM_LENGTH;
  const visibleResults = results.slice(0, visibleCount);
  const hasMore = visibleCount < results.length;

  return (
    <div>
      <Label.Root
        htmlFor="movie-search"
        className="block text-main font-medium mb-2"
      >
        Search for a film
      </Label.Root>
      <input
        id="movie-search"
        type="search"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        disabled={disabled}
        autoComplete="off"
        className="w-full px-4 py-3 bg-secondary border border-main/30 rounded-lg text-main placeholder-main/40 focus:outline-none focus:border-highlight focus:ring-2 focus:ring-highlight/20 transition-colors disabled:opacity-50"
        placeholder="Film title"
      />

      {showResults && (
        <div className="mt-2 max-h-64 overflow-y-auto rounded-lg border border-main/20">
          {error ? (
            <p className="px-4 py-3 text-sm text-red-400">
              Search failed. Please try again.
            </p>
          ) : results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-main/60">
              {isFetching ? "Searching..." : "No films found."}
            </p>
          ) : (
            <>
              <ul>
                {visibleResults.map((movie) => (
                  <li key={movie.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(movie)}
                      className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-main/5"
                    >
                      {movie.posterPath && (
                        <img
                          src={getPosterUrl(movie.posterPath, "w92")}
                          alt=""
                          className="h-18 w-12 shrink-0 rounded object-cover"
                        />
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-main">
                          {movie.title}
                        </span>
                        <span className="block truncate text-sm text-main/60">
                          {movie.overview}
                        </span>
                      </span>
                      <span className="shrink-0 text-xs text-main/40">
                        {movie.releaseDate.slice(0, 4)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              {hasMore && (
                <button
                  type="button"
                  onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                  className="w-full border-t border-main/10 px-4 py-2.5 text-sm text-main/60 transition-colors hover:bg-main/5 hover:text-main"
                >
                  Show more ({results.length - visibleCount} remaining)
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
