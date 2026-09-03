import type { SVGProps } from "react";

/**
 * Stroke-style icons used only by the Orders page (Feather-style, matching the
 * admin shell icon set). `currentColor` lets the surrounding CSS tint them.
 */

export type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const baseProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

export function SearchIcon({ size = 16, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

export function CheckIcon({ size = 16, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function CloseIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export function MapPinIcon({ size = 16, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
