import * as Popover from "@radix-ui/react-popover";
import { useEffect, useRef, useState } from "react";
import { FilterIcon } from "../icons";
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
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isStuck, setIsStuck] = useState(false);
  const [childSelectOpen, setChildSelectOpen] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsStuck(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinelRef} className="h-0" aria-hidden="true" />
      <div className="sticky top-0 z-10">
        {/* Desktop layout: 800px and up */}
        <div className="hidden min-[800px]:flex items-center justify-between gap-4 bg-secondary py-4 min-[1100px]:px-0 px-0">
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

        {/* Mobile layout: below 800px */}
        <div className="flex min-[800px]:hidden items-center justify-between bg-secondary py-4 px-0">
          <Navbar />
          <Popover.Root modal={true}>
            <Popover.Trigger asChild>
              <button
                type="button"
                aria-label="Open filters"
                className="flex h-8 w-8 items-center justify-center rounded-sm text-main/55 transition-colors hover:text-main"
              >
                <FilterIcon className="h-6 w-6" />
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                side="bottom"
                align="end"
                sideOffset={8}
                onOpenAutoFocus={(e) => e.preventDefault()}
                onCloseAutoFocus={(e) => e.preventDefault()}
                className="z-50 min-w-[200px] overflow-hidden rounded-sm border border-main/15 bg-secondary p-4 shadow-subtle data-[state=open]:animate-[tooltip-in_160ms_ease-out]"
                onInteractOutside={(e) => {
                  if (childSelectOpen) {
                    e.preventDefault();
                  }
                }}
              >
                <div className="flex flex-col gap-4">
                  <ReviewSearch onDebouncedChange={onDebouncedChange} />
                  <div className="flex items-center justify-between">
                    <ReviewRatingFilter
                      value={ratingFilter}
                      onChange={onRatingFilterChange}
                      onOpenChange={setChildSelectOpen}
                    />
                    <ReviewSort
                      value={sort}
                      onChange={onSortChange}
                      onOpenChange={setChildSelectOpen}
                    />
                  </div>
                </div>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>

        <div
          className={`h-px bg-main/20 transition-transform duration-300 ease-out origin-center ${
            isStuck ? "scale-x-100" : "scale-x-0"
          }`}
          aria-hidden="true"
        />
      </div>
    </>
  );
};
