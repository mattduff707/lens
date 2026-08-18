import { type Review } from "../../lib/supabase";
import { useUiStore } from "../../store/ui";
import { cn } from "../../util/style";
import { StarIcon } from "../icons";

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
      role="img"
      aria-label={`Rated ${rating} out of 5`}
      className={cn(
        "inline-flex shrink-0 items-center gap-0.5 tracking-[0.2em]",
        isPerfect ? "text-[0.9375rem]" : "text-sm",
        className,
      )}
    >
      {Array.from({ length: starCount }, (_, i) => {
        const filled = isPerfect || i < Math.min(rating, VISIBLE_STARS);

        return (
          <span
            key={i}
            aria-hidden="true"
            className={cn(
              "inline-block w-[1em] text-center",
              filled &&
                (isPerfect
                  ? cn(
                      "text-special",
                      enableAnimations && "animate-star-wave",
                    )
                  : "text-highlight"),
            )}
            style={
              isPerfect && enableAnimations
                ? { animationDelay: `${i * 0.12}s` }
                : undefined
            }
          >
            {filled ? (
              <StarIcon className="star-outline block size-[1em]" />
            ) : null}
          </span>
        );
      })}
    </span>
  );
};
