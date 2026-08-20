import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark";

export type ReviewSortOption =
  | "review-desc"
  | "review-asc"
  | "release-desc"
  | "release-asc"
  | "rating-desc"
  | "rating-asc"
  | "title-asc"
  | "title-desc";

export type RatingFilterValue = 1 | 2 | 3 | 4 | 5 | null;

const DEFAULT_REVIEW_SORT: ReviewSortOption = "review-desc";

type UiStore = {
  enableAnimations: boolean;
  theme: Theme;
  reviewSort: ReviewSortOption;
  reviewRatingFilter: RatingFilterValue;
  setEnableAnimations: (enableAnimations: boolean) => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setReviewSort: (reviewSort: ReviewSortOption) => void;
  setReviewRatingFilter: (rating: RatingFilterValue) => void;
};

type PersistedUi = {
  enableAnimations?: boolean;
  theme?: Theme;
};

const STORAGE_KEY = "lens-ui";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const prefersDarkScheme = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

const readPersistedUi = (): PersistedUi | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: PersistedUi };
    return parsed.state ?? null;
  } catch {
    return null;
  }
};

const resolveInitialTheme = (): Theme => {
  const stored = readPersistedUi()?.theme;
  if (stored === "light" || stored === "dark") return stored;
  if (typeof window === "undefined") return "light";
  return prefersDarkScheme() ? "dark" : "light";
};

const resolveInitialAnimations = (): boolean => {
  const stored = readPersistedUi()?.enableAnimations;
  if (typeof stored === "boolean") return stored;
  return !prefersReducedMotion();
};

export const useUiStore = create<UiStore>()(
  persist(
    (set) => ({
      enableAnimations: resolveInitialAnimations(),
      theme: resolveInitialTheme(),
      reviewSort: DEFAULT_REVIEW_SORT,
      reviewRatingFilter: null,
      setEnableAnimations: (enableAnimations) => set({ enableAnimations }),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === "light" ? "dark" : "light",
        })),
      setReviewSort: (reviewSort) => set({ reviewSort }),
      setReviewRatingFilter: (reviewRatingFilter) => set({ reviewRatingFilter }),
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        enableAnimations: state.enableAnimations,
        theme: state.theme,
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as PersistedUi | undefined;
        return {
          ...currentState,
          ...(persisted?.theme !== undefined && { theme: persisted.theme }),
          ...(persisted?.enableAnimations !== undefined && {
            enableAnimations: persisted.enableAnimations,
          }),
        };
      },
    }
  )
);

/** Keeps CSS animation utilities in sync with the store. */
export function syncAnimationsAttribute(enableAnimations: boolean) {
  document.documentElement.dataset.animations = enableAnimations
    ? "on"
    : "off";
}

/** Keeps theme tokens and native color-scheme in sync with the store. */
export function syncThemeAttribute(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export function syncUiAttributes(state: {
  enableAnimations: boolean;
  theme: Theme;
}) {
  syncAnimationsAttribute(state.enableAnimations);
  syncThemeAttribute(state.theme);
}
