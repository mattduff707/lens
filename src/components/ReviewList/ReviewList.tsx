import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type { MediaConfig, MediaItem } from "../../lib/media";
import {
  type RatingFilterValue,
  type ReviewSortOption,
  useUiStore,
} from "../../store/ui";
import { BackToTop } from "../BackToTop";
import { Loader } from "../Loader";
import { RequestRecommendation } from "../RequestRecommendation";
import { ReviewCard } from "../ReviewCard";
import { ReviewControls } from "../ReviewControls";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const listTransition = {
  duration: 0.3,
  ease: "easeOut" as const,
};

const compareItems = (
  a: MediaItem,
  b: MediaItem,
  sort: ReviewSortOption
): number => {
  switch (sort) {
    case "review-desc":
      return b.reviewDate.localeCompare(a.reviewDate);
    case "review-asc":
      return a.reviewDate.localeCompare(b.reviewDate);
    case "release-desc":
      return b.releaseDate.localeCompare(a.releaseDate);
    case "release-asc":
      return a.releaseDate.localeCompare(b.releaseDate);
    case "rating-desc":
      return b.rating - a.rating;
    case "rating-asc":
      return a.rating - b.rating;
    case "title-asc":
      return a.title.localeCompare(b.title);
    case "title-desc":
      return b.title.localeCompare(a.title);
  }
};

const matchesSearchTerm = (item: MediaItem, term: string): boolean => {
  if (!term) return true;
  const q = term.toLowerCase();
  return item.searchTerms.some((value) => value.toLowerCase().includes(q));
};

const matchesRating = (
  item: MediaItem,
  ratingFilter: RatingFilterValue
): boolean => {
  if (ratingFilter === null) return true;
  return item.rating === ratingFilter;
};

interface ReviewListProps<TRow> {
  config: MediaConfig<TRow>;
}

export const ReviewList = <TRow,>({ config }: ReviewListProps<TRow>) => {
  const enableAnimations = useUiStore((s) => s.enableAnimations);
  const sort = useUiStore((s) => s.reviewSort);
  const setReviewSort = useUiStore((s) => s.setReviewSort);
  const ratingFilter = useUiStore((s) => s.reviewRatingFilter);
  const setRatingFilter = useUiStore((s) => s.setReviewRatingFilter);

  const [debouncedTerm, setDebouncedTerm] = useState("");

  const queryClient = useQueryClient();
  // Already have everything from an earlier visit, so the preview is dead weight.
  const hasFullRows =
    queryClient.getQueryData(config.publishedListKey) !== undefined;

  const previewQuery = useQuery({
    queryKey: config.publishedPreviewKey(sort, ratingFilter),
    queryFn: () => config.fetchPublishedPreview(sort, ratingFilter),
    enabled: !hasFullRows,
  });

  const {
    data: fullRows,
    isPending,
    error,
  } = useQuery({
    queryKey: config.publishedListKey,
    queryFn: () => config.fetchPublishedList(),
    // Held back so the small response lands first; a failed preview must not
    // strand the real data, so an error unblocks it too.
    enabled: hasFullRows || previewQuery.isSuccess || previewQuery.isError,
    placeholderData: previewQuery.data,
  });

  // The full set always wins. Placeholder data covers the handoff while the
  // full fetch is pending, and this fallback keeps the preview on screen if
  // that fetch fails outright.
  const rows = fullRows ?? previewQuery.data ?? [];

  const filtered = rows
    .map(config.toMediaItem)
    .filter(
      (item) =>
        matchesSearchTerm(item, debouncedTerm) &&
        matchesRating(item, ratingFilter)
    );

  const sorted = [...filtered].sort((a, b) => compareItems(a, b, sort));

  const filterKey = [sort, debouncedTerm || "all", ratingFilter ?? "all"].join(
    ":"
  );

  const list = (() => {
    if (isPending && rows.length === 0) {
      return (
        <div key="loading" className="py-16">
          <Loader label={config.loadingLabel} />
        </div>
      );
    }

    // With a preview on screen there is still something worth reading, so only
    // the total failure case replaces the list outright.
    if (error && rows.length === 0) {
      return (
        <div key="error" className="text-center text-red-400">
          {config.errorMessage}
        </div>
      );
    }

    return sorted.length === 0 ? (
      <motion.p
        key={`empty:${filterKey}`}
        className="text-sm text-main/60 px-4"
        initial={enableAnimations ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        exit={enableAnimations ? { opacity: 0 } : undefined}
        transition={listTransition}
      >
        {config.emptyMessage}
      </motion.p>
    ) : (
      <motion.div
        key={filterKey}
        className="grid gap-x-12 gap-y-8 lg:grid-cols-2 px-4"
        initial={enableAnimations ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        exit={enableAnimations ? { opacity: 0 } : undefined}
        transition={listTransition}
      >
        {sorted.map((item, index) => (
          <motion.div
            key={item.id}
            variants={fadeUp}
            initial={enableAnimations ? "hidden" : false}
            whileInView={enableAnimations ? "visible" : undefined}
            animate={enableAnimations ? undefined : "visible"}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <ReviewCard
              item={item}
              aspect={config.aspect}
              metaLabel={config.metaLabel}
              showActions={false}
              index={index}
            />
          </motion.div>
        ))}
      </motion.div>
    );
  })();

  return (
    <div className="mx-auto flex max-w-list flex-col pb-28">
      <ReviewControls
        onDebouncedChange={setDebouncedTerm}
        searchTerm={debouncedTerm}
        sort={sort}
        onSortChange={setReviewSort}
        ratingFilter={ratingFilter}
        onRatingFilterChange={setRatingFilter}
      />

      {enableAnimations ? (
        <AnimatePresence mode="wait">{list}</AnimatePresence>
      ) : (
        list
      )}

      <RequestRecommendation />
      <BackToTop />
    </div>
  );
};
