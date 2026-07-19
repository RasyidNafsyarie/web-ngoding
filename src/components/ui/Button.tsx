import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "outline";
type Size = "sm" | "md" | "lg";

const sizeClasses: Record<Size, string> = {
  sm: "px-4 py-2 text-xs min-h-[40px] h-10",
  md: "px-6 py-2.5 text-sm min-h-[48px] h-12",
  lg: "px-8 py-3 text-sm md:text-base min-h-[52px] h-[52px]",
};

const variantClass: Record<ButtonVariant, string> = {
  primary: "btn-neo-primary",
  secondary: "btn-neo-secondary",
  outline: "btn-neo-outline",
};

interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: Size;
  children: ReactNode;
  className?: string;
}

type ButtonProps = ButtonBaseProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type AnchorProps = ButtonBaseProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; disabled?: boolean };

type Props = ButtonProps | AnchorProps;

/**
 * Calm Retro Button (DESIGN.md)
 * - Rectangular with slightly rounded corners (rounded-btn / 8px)
 * - border-2 border-ink, hard shadow (retro-md)
 * - Push effect on :active (translate X/Y by 2px + shadow-pressed)
 * - 3 variants: primary (dark black), secondary (retro-green), outline (card-white)
 */
export function Button({
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...props
}: Props) {
  const classes = `${variantClass[variant]} ${sizeClasses[size]} ${className}`;

  if ("href" in props && props.href !== undefined) {
    const { href, disabled, ...anchorRest } = props as AnchorProps;
    return (
      <a
        href={disabled ? undefined : href}
        aria-disabled={disabled}
        className={`${classes} ${disabled ? "pointer-events-none opacity-50" : ""}`}
        {...anchorRest}
      >
        {children}
      </a>
    );
  }

  const { disabled, ...buttonRest } = props as ButtonProps;
  return (
    <button
      disabled={disabled}
      className={`${classes} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      {...buttonRest}
    >
      {children}
    </button>
  );
}
