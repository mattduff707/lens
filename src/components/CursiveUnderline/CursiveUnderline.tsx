import type { SVGProps } from "react";
import { cn } from "../../util/style";

type CursiveUnderlineProps = SVGProps<SVGSVGElement> & {
  /** Draw the stroke left to right on mount. Default true. */
  animate?: boolean;
};

/**
 * Decorative calligraphic swash. The shape is a filled outline rather than a
 * stroke so the line can taper to a point at both ends the way a pen stroke
 * does, which a uniform stroke-width cannot express.
 */
export const CursiveUnderline = ({
  animate = true,
  className,
  ...props
}: CursiveUnderlineProps) => (
  <svg
    viewBox="0 0 200 24"
    preserveAspectRatio="none"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
    className={cn(animate && "animate-underline-draw", className)}
    {...props}
  >
    <path
      d="M4 14
         C 30 7, 60 6, 95 9
         C 125 11.5, 155 13, 180 9
         C 189 7.5, 194 5, 196 2
         C 193.5 6, 189.5 9.5, 180 11.5
         C 155 15.5, 125 14, 95 12
         C 60 9, 30 10, 4 14 Z"
    />
  </svg>
);
