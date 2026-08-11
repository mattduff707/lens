import { Navbar } from "../Navbar";
import {
  ReviewRatingFilter,
  type RatingFilterValue,
} from "../ReviewRatingFilter";
import { ReviewSearch } from "../ReviewSearch";
import { ReviewSort, type ReviewSortOption } from "../ReviewSort";

type ReviewControlsProps = {
  onDebouncedChange: (term: string) => void;
  sort: ReviewSortOption;
  onSortChange: (sort: ReviewSortOption) => void;
  ratingFilter: RatingFilterValue;
  onRatingFilterChange: (value: RatingFilterValue) => void;
};

export const ReviewControls = ({
  onDebouncedChange,
  sort,
  onSortChange,
  ratingFilter,
  onRatingFilterChange,
}: ReviewControlsProps) => {
  return (
    <div className="sticky top-0 z-10">
      <div className="flex items-center justify-between gap-4 bg-secondary py-4">
        <ReviewSearch onDebouncedChange={onDebouncedChange} />
        <Navbar />
        <div className="flex items-center">
          <ReviewRatingFilter
            value={ratingFilter}
            onChange={onRatingFilterChange}
          />
          <ReviewSort value={sort} onChange={onSortChange} />
        </div>
      </div>
      <div
        className="h-6 bg-gradient-to-b from-secondary to-transparent pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
};
