import { type Review } from "../../lib/supabase";

interface ReviewCardProps {
  review: Review;
  onEdit?: (review: Review) => void;
  onDelete?: (review: Review) => void;
  showActions?: boolean;
}

export const ReviewCard = ({
  review,
  onEdit,
  onDelete,
  showActions = false,
}: ReviewCardProps) => {
  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString
      .slice(0, 10)
      .split("-")
      .map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <article className="group border-t border-main/15 pt-6">
      <div className="flex gap-5">
        {review.album_cover && (
          <div className="shrink-0">
            <img
              src={review.album_cover}
              alt={`${review.album} cover`}
              className="h-20 w-20 object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-4">
            <div className="min-w-0">
              <h3 className="truncate text-lg tracking-tight text-main">
                {review.album}
              </h3>
              <p className="mt-0.5 text-sm text-main/55">
                {review.artist.join(", ")}
              </p>
            </div>

            <div
              className="flex shrink-0 items-center gap-0.5 text-sm tracking-[0.2em] text-highlight"
              aria-label={`${review.rating} out of 5 stars`}
            >
              {Array.from({ length: 5 }, (_, i) => (
                <span
                  key={i}
                  className={i < review.rating ? "text-highlight" : "text-main/20"}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          {review.description && (
            <p className="mt-3 text-sm leading-relaxed text-main/70 line-clamp-3">
              {review.description}
            </p>
          )}

          {review.highlights.length > 0 && (
            <p className="mt-3 text-sm text-main/55">
              <span className="text-main/35">Highlights </span>
              {review.highlights.join(" · ")}
            </p>
          )}

          <div className="mt-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {review.release_date && (
                <time
                  dateTime={review.release_date}
                  className="text-xs tracking-wide text-main/40"
                >
                  Released {formatDate(review.release_date)}
                </time>
              )}
              {/* Admin-only, so the marker never reaches the public site */}
              {showActions && review.status === "draft" && (
                <span className="rounded border border-main/20 px-1.5 py-0.5 text-xs tracking-wide text-main/50">
                  Draft
                </span>
              )}
            </div>

            {showActions && (
              <div className="flex gap-3">
                {onEdit && (
                  <button
                    onClick={() => onEdit(review)}
                    className="text-xs tracking-wide text-main/50 transition-colors hover:text-main"
                  >
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(review)}
                    className="text-xs tracking-wide text-main/50 transition-colors hover:text-red-500"
                  >
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
