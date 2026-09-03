import type { SVGProps } from "react";

/**
 * Stroke-style icons used only by the dashboard (Feather-style, matching the
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

export function PrintIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <path d="M6 9V2h12v7" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" rx="1" />
    </svg>
  );
}

export function ChevronDownIcon({ size = 16, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export function EyeIcon({ size = 16, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function DownloadIcon({ size = 16, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}