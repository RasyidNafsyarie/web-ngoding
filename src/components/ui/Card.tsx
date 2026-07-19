import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Padding override — default "p-6" */
  padding?: string;
  /** Tambah hover lift effect */
  hoverable?: boolean;
}

/**
 * Calm Retro Card (DESIGN.md)
 * - bg-card-white, border-2 border-ink, rounded-card (12px)
 * - Hard shadow: 3px 3px 0px 0px var(--color-ink)
 * - Hover: lift up gently (-translate-y-0.5) + shadow grows to 4px 4px
 */
export function Card({
  children,
  className = "",
  padding = "p-6",
  hoverable = true,
  ...props
}: CardProps) {
  return (
    <div
      className={`neo-card ${padding} ${hoverable ? "" : "hover:transform-none hover:shadow-retro-md"} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

