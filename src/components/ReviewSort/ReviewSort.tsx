import * as Select from "@radix-ui/react-select";
import { type ReviewSortOption } from "../../store/ui";
import { SortIcon } from "../icons";

export type { ReviewSortOption };

const SORT_OPTIONS: { value: ReviewSortOption; label: string }[] = [
  { value: "review-desc", label: "Newest review" },
  { value: "review-asc", label: "Oldest review" },
  { value: "release-desc", label: "Newest release" },
  { value: "release-asc", label: "Oldest release" },
  { value: "rating-desc", label: "Highest rated" },
  { value: "rating-asc", label: "Lowest rated" },
  { value: "title-asc", label: "Title A–Z" },
  { value: "title-desc", label: "Title Z–A" },
];

type ReviewSortProps = {
  value: ReviewSortOption;
  onChange: (sort: ReviewSortOption) => void;
  onOpenChange?: (open: boolean) => void;
};

export const ReviewSort = ({
  value,
  onChange,
  onOpenChange,
}: ReviewSortProps) => {
  return (
    <Select.Root
      value={value}
      onValueChange={(next) => onChange(next as ReviewSortOption)}
      onOpenChange={onOpenChange}
    >
      <Select.Trigger
        aria-label="Sort albums"
        className="inline-flex items-center gap-1.5 px-2 rounded-sm py-1 text-sm text-main/55 transition-colors hover:text-main focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-main/40 data-[state=open]:text-main"
      >
        <SortIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
        <Select.Value />
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={6}
          align="end"
          onCloseAutoFocus={(e) => e.preventDefault()}
          className="z-50 min-w-[10rem] overflow-hidden rounded-sm border border-main/15 bg-secondary shadow-subtle data-[state=open]:animate-[tooltip-in_160ms_ease-out]"
        >
          <Select.Viewport className="p-1">
            {SORT_OPTIONS.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                className="cursor-pointer rounded-sm px-2.5 py-1.5 text-sm text-main/75 outline-none data-[highlighted]:bg-main/5 data-[highlighted]:text-main data-[state=checked]:text-main"
              >
                <Select.ItemText>{option.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};
