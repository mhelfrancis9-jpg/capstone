import type { SVGProps } from "react";

/**
 * Stroke-style icon set for the admin shell (Feather-style, consistent
 * 2px stroke, `currentColor` so the active/hover states can tint them).
 * No icon package is used to avoid an unnecessary dependency.
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

export function GridIcon({ size = 22, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

export function CartIcon({ size = 22, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <circle cx="9" cy="21" r="1.6" />
      <circle cx="19" cy="21" r="1.6" />
      <path d="M2 3h2.1l2.3 12.2a2 2 0 0 0 2 1.6h9.6a2 2 0 0 0 2-1.6L21.5 7H5.2" />
    </svg>
  );
}

export function CubeIcon({ size = 22, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <path d="M21 8.4v7.2a2 2 0 0 1-1 1.73l-7 4a2 2 0 0 1-2 0l-7-4a2 2 0 0 1-1-1.73V8.4a2 2 0 0 1 1-1.73l7-4a2 2 0 0 1 2 0l7 4a2 2 0 0 1 1 1.73Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

export function UsersIcon({ size = 22, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function ExternalLinkIcon({ size = 22, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
    </svg>
  );
}

export function LogoutIcon({ size = 22, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

export function UserIcon({ size = 20, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function MenuIcon({ size = 22, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <path d="M3 6h18" />
      <path d="M3 12h18" />
      <path d="M3 18h18" />
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

export function CalendarIcon({ size = 22, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

export function TicketIcon({ size = 22, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4Z" />
      <path d="M13 6v12" />
    </svg>
  );
}

export function SettingsIcon({ size = 22, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  );
}

export function ImagePlusIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
      <path d="M12 5v6" />
      <path d="M9 8h6" />
    </svg>
  );
}

export function Trash2Icon({ size = 18, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

export function ImageIcon({ size = 22, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  );
}

