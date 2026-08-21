import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { cn } from "../../util/style";
import { CursiveUnderline } from "../CursiveUnderline";

export const RequestRecommendation = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      to="/recommendation"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      className={cn(
        "group fixed bottom-4 z-50 rounded-sm border border-main/30 bg-secondary px-6 min-[600px]:px-7 pt-2.5 pb-3 text-main shadow-subtle transition-colors hover:border-main/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-main/40",
        // Mobile: centered. Desktop: just past the right edge of the centered list, clamped so it never leaves the screen.
        "left-1/2 -translate-x-1/2 min-[1540px]:translate-x-0 min-[1540px]:left-[min(calc(50%+var(--container-list,1000px)/2+1rem),calc(100%-1rem))]"
      )}
    >
      <span className="flex flex-col gap-1">
        <span className="self-start text-[0.625rem] uppercase tracking-[0.2em] text-main/55 transition-colors group-hover:text-main/75">
          Request a
        </span>
        <span className="relative inline-block font-corinthia text-4xl min-[600px]:text-5xl leading-[0.8] text-main">
          Recommendation
          {isHovered && (
            <CursiveUnderline className="absolute inset-x-0 -bottom-1.5 h-3 w-full" />
          )}
        </span>
      </span>
    </Link>
  );
};
