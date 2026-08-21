import { useState } from "react";
import { CursiveUnderline } from "../CursiveUnderline";

export const RequestRecommendation = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      type="button"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      className="group fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-sm border border-main/30 bg-secondary px-6 min-[600px]:px-7 pt-2.5 pb-3 text-main shadow-subtle transition-colors hover:border-main/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-main/40"
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
    </button>
  );
};
