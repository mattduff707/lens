import { useEffect, useState } from "react";
import { cn } from "../../util/style";
import { CursiveUnderline } from "../CursiveUnderline";
import { CloseIcon } from "../icons";
import { VisuallyHidden } from "../VisuallyHidden";

const DEBOUNCE_MS = 300;

type ReviewSearchProps = {
  onDebouncedChange: (term: string) => void;
};

export const ReviewSearch = ({ onDebouncedChange }: ReviewSearchProps) => {
  const [term, setTerm] = useState("");
  const [focused, setFocused] = useState(false);
  const hasQuery = term.length > 0;
  const emphasized = focused || hasQuery;

  useEffect(() => {
    const timeout = setTimeout(
      () => onDebouncedChange(term.trim()),
      DEBOUNCE_MS
    );
    return () => clearTimeout(timeout);
  }, [term, onDebouncedChange]);

  return (
    <div className="relative w-full max-w-[200px] min-w-[120px]">
      <label htmlFor="review-search">
        <VisuallyHidden>Search</VisuallyHidden>
      </label>
      <input
        id="review-search"
        type="search"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoComplete="off"
        placeholder="Search"
        className={cn(
          "w-full bg-transparent py-2 text-sm text-main pl-3 placeholder-main/40 focus:outline-none [&::-webkit-search-cancel-button]:appearance-none",
          hasQuery && "pr-8"
        )}
      />
      {hasQuery && (
        <button
          type="button"
          aria-label="Clear search"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setTerm("")}
          className="absolute right-0 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center text-main"
        >
          <CloseIcon className="h-3.5 w-3.5" />
        </button>
      )}
      <CursiveUnderline
        animate={false}
        stroke="search"
        className={cn(
          "pointer-events-none absolute inset-x-0 -bottom-[6px] h-3 w-full transition-colors",
          emphasized ? "text-main" : "text-main/45"
        )}
      />
    </div>
  );
};
