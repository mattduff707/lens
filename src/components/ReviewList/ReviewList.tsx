import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { publishedReviewListQuery } from "../../lib/queries";
import type { Review } from "../../lib/supabase";
import {
  type RatingFilterValue,
  type ReviewSortOption,
  useUiStore,
} from "../../store/ui";
import { Loader } from "../Loader";
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

const compareReviews = (
  a: Review,
  b: Review,
  sort: ReviewSortOption
): number => {
  switch (sort) {
    case "review-desc":
      return b.review_date.localeCompare(a.review_date);
    case "review-asc":
      return a.review_date.localeCompare(b.review_date);
    case "release-desc":
      return b.release_date.localeCompare(a.release_date);
    case "release-asc":
      return a.release_date.localeCompare(b.release_date);
    case "rating-desc":
      return b.rating - a.rating;
    case "rating-asc":
      return a.rating - b.rating;
    case "title-asc":
      return a.album.localeCompare(b.album);
    case "title-desc":
      return b.album.localeCompare(a.album);
  }
};

const matchesSearchTerm = (review: Review, term: string): boolean => {
  if (!term) return true;
  const q = term.toLowerCase();
  return (
    review.album.toLowerCase().includes(q) ||
    review.artist.some((a) => a.toLowerCase().includes(q)) ||
    review.tracklist.some((track) => track.toLowerCase().includes(q))
  );
};

const matchesRating = (
  review: Review,
  ratingFilter: RatingFilterValue
): boolean => {
  if (ratingFilter === null) return true;
  return review.rating === ratingFilter;
};

export const ReviewList = () => {
  const enableAnimations = useUiStore((s) => s.enableAnimations);
  const sort = useUiStore((s) => s.reviewSort);
  const setReviewSort = useUiStore((s) => s.setReviewSort);
  const ratingFilter = useUiStore((s) => s.reviewRatingFilter);
  const setRatingFilter = useUiStore((s) => s.setReviewRatingFilter);

  const [debouncedTerm, setDebouncedTerm] = useState("");

  const {
    data: reviews = [],
    isLoading,
    error,
  } = useQuery(publishedReviewListQuery);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-list py-16">
        <Loader label="Loading reviews" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center max-w-list mx-auto">
        <div className="text-red-400">
          Failed to load reviews. Please try again.
        </div>
      </div>
    );
  }

  const filtered = reviews.filter(
    (review) =>
      matchesSearchTerm(review, debouncedTerm) &&
      matchesRating(review, ratingFilter)
  );

  const sorted = [...filtered].sort((a, b) => compareReviews(a, b, sort));

  const filterKey = [sort, debouncedTerm || "all", ratingFilter ?? "all"].join(
    ":"
  );

  const list =
    sorted.length === 0 ? (
      <motion.p
        key={`empty:${filterKey}`}
        className="text-sm text-main/60"
        initial={enableAnimations ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        exit={enableAnimations ? { opacity: 0 } : undefined}
        transition={listTransition}
      >
        No reviews match
      </motion.p>
    ) : (
      <motion.div
        key={filterKey}
        className="grid gap-x-12 gap-y-8 lg:grid-cols-2"
        initial={enableAnimations ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        exit={enableAnimations ? { opacity: 0 } : undefined}
        transition={listTransition}
      >
        {sorted.map((review) => (
          <motion.div
            key={review.id}
            variants={fadeUp}
            initial={enableAnimations ? "hidden" : false}
            whileInView={enableAnimations ? "visible" : undefined}
            animate={enableAnimations ? undefined : "visible"}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <ReviewCard review={review} showActions={false} />
          </motion.div>
        ))}
      </motion.div>
    );

  return (
    <div className="mx-auto flex max-w-list flex-col pb-12">
      <ReviewControls
        onDebouncedChange={setDebouncedTerm}
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
    </div>
  );
};
