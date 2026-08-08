import * as Label from "@radix-ui/react-label";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { type AlbumResult, searchAlbums } from "../../lib/itunes";

interface AlbumSearchProps {
  onSelect: (album: AlbumResult) => void;
  disabled?: boolean;
}

const MIN_TERM_LENGTH = 2;
const DEBOUNCE_MS = 300;

export const AlbumSearch = ({ onSelect, disabled }: AlbumSearchProps) => {
  const [term, setTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedTerm(term.trim()), DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [term]);

  const {
    data: results = [],
    isFetching,
    error,
  } = useQuery({
    queryKey: ["itunes", "albums", debouncedTerm],
    queryFn: ({ signal }) => searchAlbums(debouncedTerm, signal),
    enabled: debouncedTerm.length >= MIN_TERM_LENGTH,
    staleTime: 5 * 60 * 1000,
  });

  const handleSelect = (album: AlbumResult) => {
    onSelect(album);
    setTerm("");
    setDebouncedTerm("");
  };

  const showResults = debouncedTerm.length >= MIN_TERM_LENGTH;

  return (
    <div>
      <Label.Root
        htmlFor="album-search"
        className="block text-main font-medium mb-2"
      >
        Search for an album
      </Label.Root>
      <input
        id="album-search"
        type="search"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        disabled={disabled}
        autoComplete="off"
        className="w-full px-4 py-3 bg-secondary border border-main/30 rounded-lg text-main placeholder-main/40 focus:outline-none focus:border-highlight focus:ring-2 focus:ring-highlight/20 transition-colors disabled:opacity-50"
        placeholder="Album title or artist name"
      />

      {showResults && (
        <div className="mt-2 max-h-64 overflow-y-auto rounded-lg border border-main/20">
          {error ? (
            <p className="px-4 py-3 text-sm text-red-400">
              Search failed. Please try again.
            </p>
          ) : results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-main/60">
              {isFetching ? "Searching..." : "No albums found."}
            </p>
          ) : (
            <ul>
              {results.map((album) => (
                <li key={album.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(album)}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-main/5"
                  >
                    {album.artworkUrl && (
                      <img
                        src={album.artworkUrl}
                        alt=""
                        className="h-12 w-12 shrink-0 rounded object-cover"
                      />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-main">
                        {album.album}
                      </span>
                      <span className="block truncate text-sm text-main/60">
                        {album.artist}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs text-main/40">
                      {album.releaseDate.slice(0, 4)}
                      {album.trackCount > 0 && ` · ${album.trackCount} tracks`}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
