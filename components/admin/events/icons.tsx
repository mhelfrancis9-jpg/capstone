import type { SVGProps } from "react";

/**
 * Stroke-style icons used only by the Events manager (Feather-style, matching
 * the admin shell and Orders/Products icon sets). `currentColor` lets the
 * surrounding CSS tint them.
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

export function CalendarIcon({ size = 22, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

export function CloseIcon({ size = 20, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export function ImageIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  );
}

export function PencilIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

export function PlusIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

export function TrashIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

export function SearchIcon({ size = 16, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function UploadIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="m17 8-5-5-5 5" />
      <path d="M12 3v12" />
    </svg>
  );
}
