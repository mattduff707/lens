import { ReviewSearch } from "../ReviewSearch";
import { ReviewSort, type ReviewSortOption } from "../ReviewSort";

type ReviewControlsProps = {
  onDebouncedChange: (term: string) => void;
  sort: ReviewSortOption;
  onSortChange: (sort: ReviewSortOption) => void;
};

export const ReviewControls = ({
  onDebouncedChange,
  sort,
  onSortChange,
}: ReviewControlsProps) => {
  return (
    <div className="mb-8 flex items-center justify-between gap-4">
      <ReviewSearch onDebouncedChange={onDebouncedChange} />
      <ReviewSort value={sort} onChange={onSortChange} />
    </div>
  );
};
