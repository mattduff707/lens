import {
  COVER_EAGER_COUNT,
  COVER_HIGH_PRIORITY_COUNT,
} from "../../lib/coverImage";
import type { CoverAspect, MediaItem } from "../../lib/media";
import { RatingStars } from "../RatingStars";

interface ReviewCardProps {
  item: MediaItem;
  aspect: CoverAspect;
  metaLabel: string;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
  index?: number;
}

const COVER_DIMENSIONS: Record<
  CoverAspect,
  { width: number; height: number; className: string }
> = {
  square: { width: 80, height: 80, className: "h-20 w-20" },
  poster: { width: 80, height: 120, className: "h-30 w-20" },
};

export const ReviewCard = ({
  item,
  aspect,
  metaLabel,
  onEdit,
  onDelete,
  showActions = false,
  index = Infinity,
}: ReviewCardProps) => {
  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.slice(0, 10).split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const cover = COVER_DIMENSIONS[aspect];

  return (
    <article className="group pt-6">
      <div className="flex gap-5">
        {item.imageUrl && (
          <div className="shrink-0">
            <img
              src={item.imageUrl}
              alt={`${item.title} cover`}
              width={cover.width}
              height={cover.height}
              loading={index < COVER_EAGER_COUNT ? "eager" : "lazy"}
              fetchPriority={
                index < COVER_HIGH_PRIORITY_COUNT ? "high" : "auto"
              }
              decoding="async"
              className={`${cover.className} object-cover`}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-4">
            <div className="min-w-0">
              <h3 className="text-lg font-bold tracking-tight text-main">
                {item.title}
              </h3>
              <p className="mt-0.5 text-sm text-main/75">
                {item.subtitle.join(", ")}
              </p>
            </div>

            <RatingStars rating={item.rating} />
          </div>

          {item.description && (
            <p className="mt-3 text-sm leading-relaxed text-main/70 line-clamp-3">
              {item.description}
            </p>
          )}

          {item.metaItems.length > 0 && (
            <p className="mt-3 text-sm text-main/55">
              <span className="text-main/35">{metaLabel} </span>
              {item.metaItems.join(" · ")}
            </p>
          )}

          <div className="mt-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {item.releaseDate && (
                <time
                  dateTime={item.releaseDate}
                  className="text-xs tracking-wide text-main/60"
                >
                  Released {formatDate(item.releaseDate)}
                </time>
              )}
              {/* Admin-only, so the marker never reaches the public site */}
              {showActions && item.status === "draft" && (
                <span className="rounded border border-main/20 px-1.5 py-0.5 text-xs tracking-wide text-main/50">
                  Draft
                </span>
              )}
            </div>

            {showActions && (
              <div className="flex gap-3">
                {onEdit && (
                  <button
                    onClick={onEdit}
                    className="text-xs tracking-wide text-main/50 transition-colors hover:text-main"
                  >
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={onDelete}
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
