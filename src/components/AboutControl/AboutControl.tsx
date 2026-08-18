import * as Popover from "@radix-ui/react-popover";
import me from "../../assets/me.webp";
import { PersonIcon } from "../icons";

// Warm the cache on module load so the popover image is ready on first open.
new Image().src = me;

export const AboutControl = () => (
  <Popover.Root>
    <Popover.Trigger asChild>
      <button
        type="button"
        aria-label="About Matthew Duffy"
        className="flex h-6 w-6 items-center justify-center rounded-sm text-main/55 transition-colors hover:text-main focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-main/40"
      >
        <PersonIcon className="h-5 w-5" />
      </button>
    </Popover.Trigger>
    <Popover.Portal>
      <Popover.Content
        side="right"
        align="start"
        sideOffset={12}
        className="z-50 w-[18.4rem] overflow-hidden rounded-sm border border-main/15 bg-secondary shadow-subtle data-[state=open]:animate-[tooltip-in_160ms_ease-out]"
      >
        <img
          src={me}
          alt="Matthew Duffy"
          width={800}
          height={500}
          className="aspect-[16/10] w-full object-cover"
        />
        <div className="flex flex-col gap-1.5 p-4">
          <p className="text-[1.125rem] font-medium tracking-wide text-main">
            Matthew Duffy
          </p>
          <p className="text-base leading-relaxed text-main/70">
            I&apos;m a software engineer who enjoys music, film, antiques, dogs,
            and the great outdoors. Please enjoy my thoughts on the works of
            those more talented than I.
          </p>
        </div>
      </Popover.Content>
    </Popover.Portal>
  </Popover.Root>
);
