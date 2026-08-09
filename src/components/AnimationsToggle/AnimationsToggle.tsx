import * as Tooltip from "@radix-ui/react-tooltip";
import { useUiStore } from "../../store/ui";
import { AnimationsOffIcon, AnimationsOnIcon } from "../icons/Animations";

export const AnimationsToggle = () => {
  const enableAnimations = useUiStore((s) => s.enableAnimations);
  const setEnableAnimations = useUiStore((s) => s.setEnableAnimations);

  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button
          type="button"
          onClick={() => setEnableAnimations(!enableAnimations)}
          aria-pressed={enableAnimations}
          aria-label={
            enableAnimations ? "Disable animations" : "Enable animations"
          }
          className="flex h-6 w-6 items-center justify-center rounded-sm text-main/55 transition-colors hover:text-main focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-main/40"
        >
          {enableAnimations ? (
            <AnimationsOnIcon className="h-6 w-6" />
          ) : (
            <AnimationsOffIcon className="h-6 w-6" />
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
          Animations
          <Tooltip.Arrow className="fill-main" width={8} height={4} />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
};
