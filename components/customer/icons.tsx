import type { SVGProps } from "react";

/**
 * Minimal inline icon set for the customer-facing storefront.
 * Stroke icons match the admin icon style (2px stroke, currentColor);
 * Facebook / Instagram are brand icons. No icon dependency is used.
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

export function CartIcon({ size = 20, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <circle cx="9" cy="21" r="1.6" />
      <circle cx="19" cy="21" r="1.6" />
      <path d="M2 3h2.1l2.3 12.2a2 2 0 0 0 2 1.6h9.6a2 2 0 0 0 2-1.6L21.5 7H5.2" />
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

export function ChevronLeftIcon({ size = 16, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

export function ChevronRightIcon({ size = 16, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export function MenuIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <path d="M3 6h18" />
      <path d="M3 12h18" />
      <path d="M3 18h18" />
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

export function MapPinIcon({ size = 14, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function MailIcon({ size = 14, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 6L2 7" />
    </svg>
  );
}

export function FacebookIcon({ size = 16, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...rest}
    >
      <path d="M24 12.073C24 5.446 18.627.073 12 .073S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073Z" />
    </svg>
  );
}

export function InstagramIcon({ size = 16, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.4" fill="currentColor" />
    </svg>
  );
}

export function TrashIcon({ size = 16, ...rest }: IconProps) {
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

export function ChevronDownIcon({ size = 16, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function ArrowRightIcon({ size = 16, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export function WrenchIcon({ size = 16, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-2.4 2.5-2.5Z" />
    </svg>
  );
}

export function OrdersIcon({ size = 16, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
      <path d="M10 9H8" />
    </svg>
  );
}

export function EventsIcon({ size = 16, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
    </svg>
  );
}

export function LogOutIcon({ size = 16, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...rest}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <path d="M21 12H9" />
    </svg>
  );
}
