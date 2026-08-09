import type { SVGProps } from "react";

export function SunIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      {/* Icon from Material Line Icons by Vjacheslav Trushkin - https://github.com/cyberalien/line-md/blob/main/license.txt */}
      <path
        fill="currentColor"
        stroke="none"
        d="M12 6c3.31 0 6 2.69 6 6c0 3.31 -2.69 6 -6 6c-3.31 0 -6 -2.69 -6 -6c0 -3.31 2.69 -6 6 -6Z"
      >
        <animate
          fill="freeze"
          attributeName="d"
          dur="0.6s"
          values="M12 26c3.31 0 6 2.69 6 6c0 3.31 -2.69 6 -6 6c-3.31 0 -6 -2.69 -6 -6c0 -3.31 2.69 -6 6 -6Z;M12 6c3.31 0 6 2.69 6 6c0 3.31 -2.69 6 -6 6c-3.31 0 -6 -2.69 -6 -6c0 -3.31 2.69 -6 6 -6Z"
        />
      </path>
      <g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      >
        <path d="M12 21v1M21 12h1M12 3v-1M3 12h-1" opacity="0">
          <set fill="freeze" attributeName="opacity" begin="0.7s" to="1" />
          <animate
            fill="freeze"
            attributeName="d"
            begin="0.7s"
            dur="0.2s"
            values="M12 19v1M19 12h1M12 5v-1M5 12h-1;M12 21v1M21 12h1M12 3v-1M3 12h-1"
          />
        </path>
        <path
          d="M18.5 18.5l0.5 0.5M18.5 5.5l0.5 -0.5M5.5 5.5l-0.5 -0.5M5.5 18.5l-0.5 0.5"
          opacity="0"
        >
          <set fill="freeze" attributeName="opacity" begin="0.9s" to="1" />
          <animate
            fill="freeze"
            attributeName="d"
            begin="0.9s"
            dur="0.2s"
            values="M17 17l0.5 0.5M17 7l0.5 -0.5M7 7l-0.5 -0.5M7 17l-0.5 0.5;M18.5 18.5l0.5 0.5M18.5 5.5l0.5 -0.5M5.5 5.5l-0.5 -0.5M5.5 18.5l-0.5 0.5"
          />
        </path>
      </g>
    </svg>
  );
}

export function MoonIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      {/* Icon from Material Line Icons by Vjacheslav Trushkin - https://github.com/cyberalien/line-md/blob/main/license.txt */}
      <path
        fill="currentColor"
        fillOpacity="0"
        stroke="currentColor"
        strokeDasharray="56"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M7 6c0 6.08 4.92 11 11 11c0.53 0 1.05 -0.04 1.56 -0.11c-1.61 2.47 -4.39 4.11 -7.56 4.11c-4.97 0 -9 -4.03 -9 -9c0 -3.17 1.64 -5.95 4.11 -7.56c-0.07 0.51 -0.11 1.03 -0.11 1.56Z"
      >
        <animate
          fill="freeze"
          attributeName="stroke-dashoffset"
          dur="0.6s"
          values="56;0"
        />
        <animate
          fill="freeze"
          attributeName="fill-opacity"
          begin="0.7s"
          dur="0.4s"
          to="1"
        />
        {/* Drop stroke once filled so fill+stroke don't stack under translucent currentColor */}
        <animate
          fill="freeze"
          attributeName="stroke-opacity"
          begin="0.7s"
          dur="0.4s"
          to="0"
        />
      </path>
      <g
        fill="none"
        stroke="currentColor"
        strokeDasharray="4"
        strokeDashoffset="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      >
        <path d="M12 5h1.5M12 5h-1.5M12 5v1.5M12 5v-1.5">
          <animate
            fill="freeze"
            attributeName="stroke-dashoffset"
            begin="1.2s"
            dur="0.2s"
            to="0"
          />
        </path>
        <path d="M17 11h1.5M17 11h-1.5M17 11v1.5M17 11v-1.5">
          <animate
            fill="freeze"
            attributeName="stroke-dashoffset"
            begin="1.5s"
            dur="0.2s"
            to="0"
          />
        </path>
        <path d="M20 5h1.5M20 5h-1.5M20 5v1.5M20 5v-1.5">
          <animate
            fill="freeze"
            attributeName="stroke-dashoffset"
            begin="1.8s"
            dur="0.2s"
            to="0"
          />
        </path>
      </g>
    </svg>
  );
}
