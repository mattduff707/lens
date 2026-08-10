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
    <div className="mb-8 flex items-center justify-between gap-4">
      <ReviewSearch onDebouncedChange={onDebouncedChange} />

      <div className="flex items-center">
        <ReviewRatingFilter
          value={ratingFilter}
          onChange={onRatingFilterChange}
        />
        <ReviewSort value={sort} onChange={onSortChange} />
      </div>
    </div>
  );
};
