import { useEffect, useState } from "react";
import { CursiveUnderline } from "../CursiveUnderline";
import { VisuallyHidden } from "../VisuallyHidden";

const DEBOUNCE_MS = 300;

type ReviewSearchProps = {
  onDebouncedChange: (term: string) => void;
};

export const ReviewSearch = ({ onDebouncedChange }: ReviewSearchProps) => {
  const [term, setTerm] = useState("");

  useEffect(() => {
    const timeout = setTimeout(
      () => onDebouncedChange(term.trim()),
      DEBOUNCE_MS
    );
    return () => clearTimeout(timeout);
  }, [term, onDebouncedChange]);

  return (
    <>
      <label htmlFor="review-search">
        <VisuallyHidden>Search</VisuallyHidden>
      </label>
      <div className="relative mb-8 w-[200px]">
        <input
          id="review-search"
          type="search"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          autoComplete="off"
          placeholder="Search"
          className="w-full bg-transparent py-2 text-sm text-main pl-3 placeholder-main/40 focus:outline-none"
        />
        <CursiveUnderline
          animate={false}
          stroke="search"
          className="pointer-events-none absolute inset-x-0 -bottom-[6px] h-3 w-full text-main/45"
        />
      </div>
    </>
  );
};
