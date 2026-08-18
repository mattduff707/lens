import * as Popover from "@radix-ui/react-popover";
import { PaintingIcon } from "../icons";

const COLORS = [
  {
    name: "Isabelline",
    hex: "#f4f0ec",
    href: "https://storiedcolors.com/color/isabelline/",
  },
  {
    name: "Bone Black",
    hex: "#2a2118",
    href: "https://storiedcolors.com/color/bone-black/",
  },
  {
    name: "Scheele's Green",
    hex: "#478800",
    href: "https://storiedcolors.com/color/scheeles-green/",
  },
  {
    name: "Ravenna Gold",
    hex: "#d4af37",
    href: "https://storiedcolors.com/color/ravenna-gold/",
  },
] as const;

type PaletteControlProps = {
  align?: "start" | "end";
};

export const PaletteControl = ({ align = "start" }: PaletteControlProps) => (
  <Popover.Root>
    <Popover.Trigger asChild>
      <button
        type="button"
        aria-label="Color palette"
        className="flex h-6 w-6 items-center justify-center rounded-sm text-main/55 transition-colors hover:text-main focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-main/40"
      >
        <PaintingIcon className="h-5 w-5" />
      </button>
    </Popover.Trigger>
    <Popover.Portal>
      <Popover.Content
        side="right"
        align={align}
        sideOffset={12}
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="z-50 w-56 min-[1100px]:w-48 rounded-sm border border-main/15 bg-secondary p-3.5 min-[1100px]:p-3 shadow-subtle outline-none [-webkit-tap-highlight-color:transparent] data-[state=open]:animate-[tooltip-in_160ms_ease-out]"
      >
        <p className="mb-3 min-[1100px]:mb-2.5 text-base min-[1100px]:text-sm font-medium tracking-wide text-main/60">
          Storied Colors
        </p>
        <ul className="flex flex-col gap-3 min-[1100px]:gap-2.5">
          {COLORS.map((color) => (
            <li key={color.hex}>
              <a
                href={color.href}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-3 min-[1100px]:gap-2.5 py-0.5 min-[1100px]:py-0 text-base min-[1100px]:text-sm text-main/75 transition-colors hover:text-main"
              >
                <span
                  className="h-5 w-5 min-[1100px]:h-3.5 min-[1100px]:w-3.5 shrink-0 rounded-[2px] border border-main/20"
                  style={{ backgroundColor: color.hex }}
                  aria-hidden="true"
                />
                <span className="tracking-wide">{color.name}</span>
              </a>
            </li>
          ))}
        </ul>
      </Popover.Content>
    </Popover.Portal>
  </Popover.Root>
);
