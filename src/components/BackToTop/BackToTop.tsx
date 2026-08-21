import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useUiStore } from "../../store/ui";
import { cn } from "../../util/style";
import { ArrowUpIcon } from "../icons";

const SHOW_AFTER_PX = 320;

const fade = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
};

const fadeTransition = { duration: 0.2, ease: "easeOut" as const };

export const BackToTop = () => {
  const enableAnimations = useUiStore((s) => s.enableAnimations);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > SHOW_AFTER_PX);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: enableAnimations ? "smooth" : "auto",
    });
  };

  const button = (
    <motion.button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      className={cn(
        "fixed bottom-4 z-50 flex h-[46px] w-[46px] min-[600px]:h-[50px] min-[600px]:w-[50px] items-center justify-center rounded-sm border border-main/30 bg-secondary text-main/55 shadow-subtle transition-colors hover:text-main focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-main/40",
        // Mobile: viewport corner. Desktop: just past the centered list, clamped so it never leaves the screen.
        "right-4 min-[1100px]:right-auto min-[1100px]:left-[min(calc(50%+var(--container-list,1000px)/2+0.75rem),calc(100%-4.25rem))]"
      )}
      initial={enableAnimations ? fade.initial : false}
      animate={fade.animate}
      exit={enableAnimations ? fade.exit : undefined}
      transition={enableAnimations ? fadeTransition : { duration: 0 }}
    >
      <ArrowUpIcon className="h-6 w-6" />
    </motion.button>
  );

  if (!enableAnimations) {
    return visible ? button : null;
  }

  return <AnimatePresence>{visible ? button : null}</AnimatePresence>;
};
