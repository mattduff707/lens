import type { SVGProps } from "react";
import { cn } from "../../util/style";
import { useUiStore } from "../../store/ui";

const STROKES = {
  /** Active nav link swash — lifts into a flourish on the right. */
  nav: `M4 14
         C 30 7, 60 6, 95 9
         C 125 11.5, 155 13, 180 9
         C 189 7.5, 194 5, 196 2
         C 193.5 6, 189.5 9.5, 180 11.5
         C 155 15.5, 125 14, 95 12
         C 60 9, 30 10, 4 14 Z`,
  /** Search field underline — flatter, edge-to-edge, no end flourish. */
  search: `M0 14
         C 35 19, 70 19, 100 15
         C 130 11, 165 10, 200 13
         C 165 12.5, 130 13.5, 100 17
         C 70 21, 35 21, 0 14 Z`,
} as const;

type CursiveUnderlineProps = SVGProps<SVGSVGElement> & {
  /** Draw the stroke left to right on mount. Default true. */
  animate?: boolean;
  /** Which calligraphic path to use. Default "nav". */
  stroke?: keyof typeof STROKES;
};

/**
 * Decorative calligraphic swash. The shape is a filled outline rather than a
 * stroke so the line can taper to a point at both ends the way a pen stroke
 * does, which a uniform stroke-width cannot express.
 */
export const CursiveUnderline = ({
  animate = true,
  stroke = "nav",
  className,
  ...props
}: CursiveUnderlineProps) => {
  const enableAnimations = useUiStore((s) => s.enableAnimations);
  const shouldAnimate = animate && enableAnimations;

  return (
    <svg
      viewBox="0 0 200 24"
      preserveAspectRatio="none"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={cn(shouldAnimate && "animate-underline-draw", className)}
      {...props}
    >
      <path d={STROKES[stroke]} />
    </svg>
  );
};
