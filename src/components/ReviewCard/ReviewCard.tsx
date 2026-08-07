import { type Review } from "../../lib/supabase";
import { cn } from "../../util/style";

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
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-lg ${i < rating ? "text-highlight" : "text-main/30"}`}
      >
        ★
      </span>
    ));
  };

  const outerBg = review.rating === 5 ? "golden" : "bg-main";
  const innerBg = review.rating === 5 ? "golden" : "bg-secondary";

  return (
    <div className={cn(outerBg, "p-2 rounded-[12px] shadow-3d")}>
      <div
        className={cn(
          innerBg,
          "shadow-3d rounded-[24px] p-6 transition-colors duration-200"
        )}
      >
        <div className="flex gap-4">
          {/* Album Cover */}
          {review.album_cover && (
            <div className="flex-shrink-0">
              <img
                src={review.album_cover}
                alt={`${review.album} cover`}
                className="w-24 h-24 object-cover rounded-lg border-main border-2"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          )}

          {/* Review Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-xl font-bold text-main truncate">
                  {review.album}
                </h3>
                <p className="text-main/70">by {review.artist.join(", ")}</p>
              </div>
              <div className="flex items-center space-x-1 ml-4">
                {renderStars(review.rating)}
              </div>
            </div>

            {/* Description */}
            {review.description && (
              <p className="text-main/80 text-sm mb-3 line-clamp-3">
                {review.description}
              </p>
            )}

            {/* Highlights */}
            {review.highlights.length > 0 && (
              <div className="mb-3">
                <h4 className="text-main font-medium text-sm mb-1">
                  Highlights:
                </h4>
                <div className="flex flex-wrap gap-1">
                  {review.highlights.map((track, index) => (
                    <span
                      key={index}
                      className="bg-highlight/20 text-highlight px-2 py-1 rounded text-xs"
                    >
                      {track}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-secondary/10">
              <div className="text-xs text-main/60">
                Reviewed on {formatDate(review.review_date)}
              </div>

              {showActions && (
                <div className="flex space-x-2">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(review)}
                      className="bg-highlight/20 hover:bg-highlight/30 text-highlight border border-highlight/30 font-medium px-3 py-1 rounded text-sm transition-colors duration-200"
                    >
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(review)}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-medium px-3 py-1 rounded text-sm transition-colors duration-200"
                    >
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
