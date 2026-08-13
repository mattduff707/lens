import * as Tooltip from "@radix-ui/react-tooltip";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useSyncExternalStore } from "react";
import { useUiStore } from "../../store/ui";
import { AboutControl } from "../AboutControl";
import { AnimationsToggle } from "../AnimationsToggle";
import { CloseIcon, MenuIcon } from "../icons";
import { PaletteControl } from "../PaletteControl";
import { ThemeToggle } from "../ThemeToggle";

const useIsLargerThan600 = () =>
  useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia("(min-width: 600px)");
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia("(min-width: 600px)").matches,
    () => true
  );

/** Fixed upper-left control cluster for site-wide toggles. */
export const CornerControls = () => {
  const [isOpen, setIsOpen] = useState(false);
  const enableAnimations = useUiStore((s) => s.enableAnimations);
  const isLarger = useIsLargerThan600();

  return (
    <Tooltip.Provider delayDuration={200} disableHoverableContent>
      {/* Desktop: show stacked controls */}
      <div className="fixed top-4 left-4 z-50 hidden min-[1100px]:flex flex-col gap-3">
        <AnimationsToggle />
        <ThemeToggle />
        <PaletteControl />
        <AboutControl />
      </div>

      {/* Mobile: hamburger menu - anchored bottom-left, expands upward */}
      <motion.div
        className="fixed bottom-4 left-4 z-50 min-[1100px]:hidden overflow-hidden rounded-sm border border-main/30 bg-secondary w-10 min-[600px]:w-12 flex flex-col justify-end"
        initial={false}
        animate={{ height: isOpen ? (isLarger ? 248 : 184) : (isLarger ? 48 : 40) }}
        transition={
          enableAnimations
            ? { duration: 0.25, ease: "easeInOut" }
            : { duration: 0 }
        }
      >
        <div className="flex flex-col justify-end h-full py-2 min-[600px]:py-3">
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="open"
                initial={enableAnimations ? { opacity: 0 } : false}
                animate={{ opacity: 1 }}
                exit={enableAnimations ? { opacity: 0 } : undefined}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="flex flex-col gap-3 min-[600px]:gap-4 items-center"
              >
                <div className="flex flex-col gap-3 min-[600px]:gap-4 [&_button]:h-6 [&_button]:w-6 [&_svg]:h-5 [&_svg]:w-5 min-[600px]:[&_button]:h-8 min-[600px]:[&_button]:w-8 min-[600px]:[&_svg]:h-7 min-[600px]:[&_svg]:w-7">
                  <AnimationsToggle />
                  <ThemeToggle />
                  <PaletteControl />
                  <AboutControl />
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close menu"
                  className="flex h-6 w-6 min-[600px]:h-8 min-[600px]:w-8 items-center justify-center rounded-sm text-main/55 transition-colors hover:text-main"
                >
                  <CloseIcon className="h-5 w-5 min-[600px]:h-6 min-[600px]:w-6" />
                </button>
              </motion.div>
            ) : (
              <motion.button
                key="closed"
                type="button"
                onClick={() => setIsOpen(true)}
                aria-label="Open menu"
                initial={enableAnimations ? { opacity: 0 } : false}
                animate={{ opacity: 1 }}
                exit={enableAnimations ? { opacity: 0 } : undefined}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="flex h-6 w-6 items-center justify-center text-main/55 transition-colors hover:text-main mx-auto"
              >
                <MenuIcon className="h-5 w-5 min-[600px]:h-6 min-[600px]:w-6" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </Tooltip.Provider>
  );
};
