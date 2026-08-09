import * as HoverCard from "@radix-ui/react-hover-card";
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

export const PaletteControl = () => (
  <HoverCard.Root openDelay={200} closeDelay={100}>
    <HoverCard.Trigger asChild>
      <button
        type="button"
        aria-label="Color palette"
        className="flex h-6 w-6 items-center justify-center rounded-sm text-main/55 transition-colors hover:text-main focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-main/40"
      >
        <PaintingIcon className="h-5 w-5" />
      </button>
    </HoverCard.Trigger>
    <HoverCard.Portal>
      <HoverCard.Content
        side="right"
        align="start"
        sideOffset={12}
        className="z-50 w-48 rounded-sm border border-main/15 bg-secondary p-3 shadow-subtle data-[state=open]:animate-[tooltip-in_160ms_ease-out]"
      >
        <ul className="flex flex-col gap-2.5">
          {COLORS.map((color) => (
            <li key={color.hex}>
              <a
                href={color.href}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-2.5 text-sm text-main/75 transition-colors hover:text-main"
              >
                <span
                  className="h-3.5 w-3.5 shrink-0 rounded-[2px] border border-main/20"
                  style={{ backgroundColor: color.hex }}
                  aria-hidden="true"
                />
                <span className="tracking-wide">{color.name}</span>
              </a>
            </li>
          ))}
        </ul>
      </HoverCard.Content>
    </HoverCard.Portal>
  </HoverCard.Root>
);
