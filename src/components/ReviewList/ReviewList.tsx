import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import { publishedReviewListQuery } from "../../lib/queries";
import { Loader } from "../Loader";
import { ReviewCard } from "../ReviewCard";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export const ReviewList = () => {
  const prefersReducedMotion = useReducedMotion();
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

  return (
    <div className="mx-auto grid max-w-list gap-x-12 gap-y-8 lg:grid-cols-2 pb-12">
      {reviews.map((review) => (
        <motion.div
          key={review.id}
          variants={fadeUp}
          initial={prefersReducedMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <ReviewCard review={review} showActions={false} />
        </motion.div>
      ))}
    </div>
  );
};
