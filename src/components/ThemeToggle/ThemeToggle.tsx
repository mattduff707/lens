import * as Tooltip from "@radix-ui/react-tooltip";
import { AnimatePresence, motion } from "framer-motion";
import { useUiStore } from "../../store/ui";
import { MoonIcon, SunIcon } from "../icons/Theme";

const iconTransition = { duration: 0.2, ease: "easeOut" as const };

export const ThemeToggle = () => {
  const theme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);
  const enableAnimations = useUiStore((s) => s.enableAnimations);
  const isDark = theme === "dark";

  const icon = isDark ? (
    <MoonIcon className="h-6 w-6" />
  ) : (
    <SunIcon className="h-6 w-6" />
  );

  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button
          type="button"
          onClick={toggleTheme}
          aria-pressed={isDark}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          className="relative flex h-6 w-6 items-center justify-center rounded-sm text-main/55 transition-colors hover:text-main focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-main/40"
        >
          {enableAnimations ? (
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={theme}
                className="flex items-center justify-center"
                initial={{ opacity: 0, rotate: -30, scale: 0.8 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 30, scale: 0.8 }}
                transition={iconTransition}
              >
                {icon}
              </motion.span>
            </AnimatePresence>
          ) : (
            icon
          )}
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          side="bottom"
          align="start"
          sideOffset={-2}
          className="select-none rounded-sm bg-main px-2 py-1 text-xs tracking-wide text-secondary shadow-subtle data-[state=delayed-open]:animate-[tooltip-in_160ms_ease-out] data-[state=instant-open]:animate-[tooltip-in_160ms_ease-out]"
        >
          Theme
          <Tooltip.Arrow className="fill-main" width={8} height={4} />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
};
