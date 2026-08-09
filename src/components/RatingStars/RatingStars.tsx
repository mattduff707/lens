import { type Review } from "../../lib/supabase";
import { useUiStore } from "../../store/ui";
import { cn } from "../../util/style";

const VISIBLE_STARS = 4;

export type RatingStarsProps = {
  rating: Review["rating"];
  className?: string;
  /** Only render filled stars — better for inline prose. */
  filledOnly?: boolean;
};

export const RatingStars = ({
  rating,
  className,
  filledOnly = false,
}: RatingStarsProps) => {
  const enableAnimations = useUiStore((s) => s.enableAnimations);
  const isPerfect = rating === 5;
  const starCount =
    filledOnly && !isPerfect
      ? Math.min(rating, VISIBLE_STARS)
      : VISIBLE_STARS;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-0.5 tracking-[0.2em]",
        isPerfect ? "text-[0.9375rem]" : "text-sm",
        className,
      )}
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: starCount }, (_, i) => {
        const filled = i < Math.min(rating, VISIBLE_STARS);

        return (
          <span
            key={i}
            className={
              isPerfect
                ? cn("text-special", enableAnimations && "animate-star-wave")
                : filled
                  ? "text-highlight"
                  : "text-transparent"
            }
            style={
              isPerfect && enableAnimations
                ? { animationDelay: `${i * 0.12}s` }
                : undefined
            }
          >
            ★
          </span>
        );
      })}
    </span>
  );
};
