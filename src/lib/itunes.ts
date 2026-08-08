const ITUNES_API = "https://itunes.apple.com";

/**
 * iTunes reports singles and EPs with a collectionType of "Album", so the only
 * reliable signals are Apple's name suffix and the track count.
 */
const SINGLE_OR_EP = /\s-\s(Single|EP)$/i;
const MIN_ALBUM_TRACKS = 4;

// Overfetch, since filtering happens client side. iTunes caps search at 200.
const SEARCH_LIMIT = 200;

export interface AlbumResult {
  id: number;
  album: string;
  artist: string;
  artworkUrl: string;
  releaseDate: string;
  trackCount: number;
}

interface ItunesCollection {
  wrapperType: string;
  collectionId: number;
  collectionName: string;
  artistName: string;
  artworkUrl100?: string;
  releaseDate?: string;
  trackCount?: number;
}

interface ItunesTrack {
  wrapperType: string;
  trackName?: string;
  trackNumber?: number;
}

interface ItunesArtist {
  artistId: number;
}

/**
 * Apple serves artwork at whatever dimensions are embedded in the path, so
 * swapping the segment yields a higher resolution image of the same asset.
 */
export const getArtworkUrl = (artworkUrl: string, size = 600) =>
  artworkUrl.replace(/\/\d+x\d+bb\.jpg$/, `/${size}x${size}bb.jpg`);

const fetchJson = async <T>(path: string, signal?: AbortSignal): Promise<T> => {
  const response = await fetch(`${ITUNES_API}${path}`, { signal });

  if (!response.ok) {
    throw new Error(`iTunes request failed (${response.status})`);
  }

  // The endpoints respond with a text/javascript content type.
  return JSON.parse(await response.text()) as T;
};

const toAlbumResults = (results: ItunesCollection[]): AlbumResult[] =>
  results
    .filter(
      (result) =>
        result.wrapperType === "collection" &&
        result.collectionId &&
        result.collectionName &&
        !SINGLE_OR_EP.test(result.collectionName) &&
        (result.trackCount ?? 0) >= MIN_ALBUM_TRACKS
    )
    .map((result) => ({
      id: result.collectionId,
      album: result.collectionName,
      artist: result.artistName,
      artworkUrl: result.artworkUrl100 ?? "",
      releaseDate: result.releaseDate?.slice(0, 10) ?? "",
      trackCount: result.trackCount ?? 0,
    }));

const searchByAlbumTitle = async (term: string, signal?: AbortSignal) => {
  const params = new URLSearchParams({
    term,
    entity: "album",
    limit: String(SEARCH_LIMIT),
  });

  const data = await fetchJson<{ results: ItunesCollection[] }>(
    `/search?${params}`,
    signal
  );

  return toAlbumResults(data.results);
};

/**
 * Some artists' albums are missing from the album search index even though they
 * exist in the catalog, so resolve the artist and read their discography
 * directly. Best effort: a failure here just means fewer results.
 */
const searchByArtistCatalog = async (term: string, signal?: AbortSignal) => {
  try {
    const artistParams = new URLSearchParams({
      term,
      entity: "musicArtist",
      limit: "1",
    });

    const artistData = await fetchJson<{ results: ItunesArtist[] }>(
      `/search?${artistParams}`,
      signal
    );

    const artistId = artistData.results[0]?.artistId;
    if (!artistId) return [];

    const albumParams = new URLSearchParams({
      id: String(artistId),
      entity: "album",
      limit: "200",
    });

    const albumData = await fetchJson<{ results: ItunesCollection[] }>(
      `/lookup?${albumParams}`,
      signal
    );

    return toAlbumResults(albumData.results).sort((a, b) =>
      b.releaseDate.localeCompare(a.releaseDate)
    );
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    return [];
  }
};

export const searchAlbums = async (
  term: string,
  signal?: AbortSignal
): Promise<AlbumResult[]> => {
  const [byTitle, byArtist] = await Promise.all([
    searchByAlbumTitle(term, signal),
    searchByArtistCatalog(term, signal),
  ]);

  const seen = new Set<number>();

  return [...byTitle, ...byArtist].filter((album) => {
    if (seen.has(album.id)) return false;
    seen.add(album.id);
    return true;
  });
};

export const getTracklist = async (
  collectionId: number,
  signal?: AbortSignal
): Promise<string[]> => {
  const params = new URLSearchParams({
    id: String(collectionId),
    entity: "song",
  });

  const response = await fetch(`${ITUNES_API}/lookup?${params}`, { signal });

  if (!response.ok) {
    throw new Error(`iTunes lookup failed (${response.status})`);
  }

  const data: { results: (ItunesCollection | ItunesTrack)[] } = JSON.parse(
    await response.text()
  );

  return data.results
    .filter((result): result is ItunesTrack => result.wrapperType === "track")
    .sort((a, b) => (a.trackNumber ?? 0) - (b.trackNumber ?? 0))
    .map((track) => track.trackName ?? "")
    .filter((name) => name !== "");
};
