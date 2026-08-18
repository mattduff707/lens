import * as Select from "@radix-ui/react-select";
import { useUiStore } from "../../store/ui";
import { StarIcon } from "../icons";

export type RatingFilterValue = 1 | 2 | 3 | 4 | 5 | null;

type RatingOption = {
  value: string;
  starCount: number;
  isPerfect?: boolean;
};

const RATING_OPTIONS: RatingOption[] = [
  { value: "all", starCount: 0 },
  { value: "1", starCount: 1 },
  { value: "2", starCount: 2 },
  { value: "3", starCount: 3 },
  { value: "4", starCount: 4 },
  { value: "5", starCount: 4, isPerfect: true },
];

type ReviewRatingFilterProps = {
  value: RatingFilterValue;
  onChange: (value: RatingFilterValue) => void;
  onOpenChange?: (open: boolean) => void;
};

const Stars = ({
  count,
  isPerfect,
  enableAnimations,
}: {
  count: number;
  isPerfect?: boolean;
  enableAnimations: boolean;
}) => {
  if (isPerfect) {
    return (
      <span className="inline-flex items-center gap-0.5 tracking-[0.1em]">
        {Array.from({ length: count }, (_, i) => (
          <span
            key={i}
            className={`text-special ${
              enableAnimations ? "animate-star-wave" : ""
            }`}
            style={
              enableAnimations ? { animationDelay: `${i * 0.12}s` } : undefined
            }
          >
            <StarIcon className="star-outline block size-[1em]" />
          </span>
        ))}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-0.5 tracking-[0.1em] text-highlight">
      {Array.from({ length: count }, (_, i) => (
        <StarIcon key={i} className="star-outline block size-[1em]" />
      ))}
    </span>
  );
};

export const ReviewRatingFilter = ({
  value,
  onChange,
  onOpenChange,
}: ReviewRatingFilterProps) => {
  const enableAnimations = useUiStore((s) => s.enableAnimations);
  const displayValue = value === null ? "all" : String(value);
  const isAll = value === null;
  const selectedOption = RATING_OPTIONS.find((o) => o.value === displayValue);

  const handleChange = (next: string) => {
    onChange(next === "all" ? null : (parseInt(next, 10) as 1 | 2 | 3 | 4 | 5));
  };

  return (
    <Select.Root
      value={displayValue}
      onValueChange={handleChange}
      onOpenChange={onOpenChange}
    >
      <Select.Trigger
        aria-label="Filter by rating"
        className="inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-sm text-main/55 transition-colors hover:text-main focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-main/40 data-[state=open]:text-main"
      >
        {isAll ? (
          <>
            <span>All</span>
            <span className="text-highlight" aria-hidden="true">
              <StarIcon className="star-outline block size-[1em]" />
            </span>
          </>
        ) : (
          <Stars
            count={selectedOption?.starCount ?? 0}
            isPerfect={selectedOption?.isPerfect}
            enableAnimations={enableAnimations}
          />
        )}
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={6}
          align="center"
          onCloseAutoFocus={(e) => e.preventDefault()}
          className="z-50 min-w-[6rem] overflow-hidden rounded-sm border border-main/15 bg-secondary shadow-subtle data-[state=open]:animate-[tooltip-in_160ms_ease-out]"
        >
          <Select.Viewport className="p-1">
            {RATING_OPTIONS.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                className="cursor-pointer rounded-sm px-2.5 py-1.5 text-sm text-main/75 outline-none data-[highlighted]:bg-main/5 data-[highlighted]:text-main data-[state=checked]:text-main"
              >
                <Select.ItemText>
                  {option.value === "all" ? (
                    "All"
                  ) : (
                    <Stars
                      count={option.starCount}
                      isPerfect={option.isPerfect}
                      enableAnimations={enableAnimations}
                    />
                  )}
                </Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};
