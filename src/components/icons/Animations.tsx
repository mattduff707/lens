import type { SVGProps } from "react";

/** Sparkles — animations enabled. */
export function AnimationsOnIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 1.5c.4 0 .74.24.88.61l1.7 4.4 4.4 1.7a.95.95 0 0 1 0 1.76l-4.4 1.7-1.7 4.4a.95.95 0 0 1-1.76 0l-1.7-4.4-4.4-1.7a.95.95 0 0 1 0-1.76l4.4-1.7 1.7-4.4A.95.95 0 0 1 12 1.5Z" />
      <path d="M5.25 13.75c.28 0 .53.17.64.43l.9 2.16 2.16.9a.7.7 0 0 1 0 1.28l-2.16.9-.9 2.16a.7.7 0 0 1-1.28 0l-.9-2.16-2.16-.9a.7.7 0 0 1 0-1.28l2.16-.9.9-2.16a.7.7 0 0 1 .64-.43Z" />
      <path d="M18.5 14.5c.25 0 .47.15.57.38l.65 1.5 1.5.65a.6.6 0 0 1 0 1.14l-1.5.65-.65 1.5a.6.6 0 0 1-1.14 0l-.65-1.5-1.5-.65a.6.6 0 0 1 0-1.14l1.5-.65.65-1.5a.6.6 0 0 1 .57-.38Z" />
    </svg>
  );
}

/** Sparkles with slash — animations disabled. */
export function AnimationsOffIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.47 2.47a.75.75 0 0 1 1.06 0l18 18a.75.75 0 1 1-1.06 1.06l-3.12-3.12-.2.47a.6.6 0 0 1-1.14 0l-.65-1.5-.9-.39-2.28 2.28.12.32a.95.95 0 0 1-1.76 0l-1.7-4.4-4.4-1.7a.95.95 0 0 1 0-1.76l.32-.12L4.53 9.28l-.8-.33a.7.7 0 0 1 0-1.28l2.16-.9.33-.8L2.47 3.53a.75.75 0 0 1 0-1.06Zm5.94 7.28-.9.37a.7.7 0 0 0 0 1.28l2.16.9.9 2.16c.06.14.17.25.3.3l3.55-3.55-1.98-.76-1.7-4.4-.14-.05-1.19 1.75Zm6.52-2.1 1.75-1.75.05.14 1.7 4.4 1.98.76-3.86 3.86-.37-.14-1.7-4.4-.76-1.98 1.21-.89Zm5.42 5.42 1.48-1.48.05.12.65 1.5 1.5.65a.6.6 0 0 1 0 1.14l-.65.28-3.03-.21Z"
      />
      <path d="M12.88 2.11a.95.95 0 0 0-1.76 0l-1 2.6 2.1 2.1.66-1.72 1.7-.66a.95.95 0 0 0 .14-1.76l-.14-.06-1.7-.5Z" />
    </svg>
  );
}
