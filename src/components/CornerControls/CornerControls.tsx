import * as Tooltip from "@radix-ui/react-tooltip";
import { AboutControl } from "../AboutControl";
import { AnimationsToggle } from "../AnimationsToggle";
import { PaletteControl } from "../PaletteControl";
import { ThemeToggle } from "../ThemeToggle";

/** Fixed upper-left control cluster for site-wide toggles. */
export const CornerControls = () => (
  <Tooltip.Provider delayDuration={200} disableHoverableContent>
    <div className="fixed top-4 left-4 z-50 flex flex-col gap-3">
      <AnimationsToggle />
      <ThemeToggle />
      <PaletteControl />
      <AboutControl />
    </div>
  </Tooltip.Provider>
);
