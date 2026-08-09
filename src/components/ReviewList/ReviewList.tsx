import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { publishedReviewListQuery } from "../../lib/queries";
import { useUiStore } from "../../store/ui";
import { Loader } from "../Loader";
import { ReviewCard } from "../ReviewCard";
import { ReviewSearch } from "../ReviewSearch";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const listTransition = {
  duration: 0.3,
  ease: "easeOut" as const,
};

export const ReviewList = () => {
  const enableAnimations = useUiStore((s) => s.enableAnimations);
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

  const filtered = reviews.filter((review) => {
    if (!debouncedTerm) return true;
    const q = debouncedTerm.toLowerCase();
    return (
      review.album.toLowerCase().includes(q) ||
      review.artist.some((a) => a.toLowerCase().includes(q)) ||
      review.tracklist.some((track) => track.toLowerCase().includes(q))
    );
  });

  const list =
    filtered.length === 0 ? (
      <motion.p
        key="empty"
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
        key={debouncedTerm || "all"}
        className="grid gap-x-12 gap-y-8 lg:grid-cols-2"
        initial={enableAnimations ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        exit={enableAnimations ? { opacity: 0 } : undefined}
        transition={listTransition}
      >
        {filtered.map((review) => (
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
      <ReviewSearch onDebouncedChange={setDebouncedTerm} />

      {enableAnimations ? (
        <AnimatePresence mode="wait">{list}</AnimatePresence>
      ) : (
        list
      )}
    </div>
  );
};
