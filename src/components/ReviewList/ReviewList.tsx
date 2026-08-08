import { useQuery } from "@tanstack/react-query";
import { publishedReviewListQuery } from "../../lib/queries";
import { Loader } from "../Loader";
import { ReviewCard } from "../ReviewCard";

export const ReviewList = () => {
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
    <div className="mx-auto grid max-w-list gap-x-12 gap-y-2 md:grid-cols-1 lg:grid-cols-2">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} showActions={false} />
      ))}
    </div>
  );
};
