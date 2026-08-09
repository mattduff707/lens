import type { SVGProps } from "react";
import { useUiStore } from "../../store/ui";
import { cn } from "../../util/style";
import { VisuallyHidden } from "../VisuallyHidden";

type LoaderProps = SVGProps<SVGSVGElement> & {
  /** Announced to screen readers while content loads. */
  label?: string;
};

/**
 * A looping cursive flourish, drawn with a stroke rather than a fill so the
 * dash offset can animate the line on and off like a moving pen.
 */
export const Loader = ({
  label = "Loading",
  className,
  ...props
}: LoaderProps) => {
  const enableAnimations = useUiStore((s) => s.enableAnimations);

  return (
    <div role="status" className="flex justify-center">
      <svg
        viewBox="0 0 140 40"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
        className={cn("w-36 text-main/60", className)}
        {...props}
      >
        <path
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={enableAnimations ? undefined : 0}
          className={enableAnimations ? "animate-cursive-write" : undefined}
          d="M8 30
           C 20 30, 26 8, 36 12
           C 44 15, 34 30, 26 28
           C 18 26, 24 14, 40 16
           C 56 18, 62 30, 72 30
           C 84 30, 90 8, 100 12
           C 108 15, 98 30, 90 28
           C 82 26, 88 14, 104 16
           C 118 18, 124 28, 132 26"
        />
      </svg>
      <VisuallyHidden>{label}</VisuallyHidden>
    </div>
  );
};
