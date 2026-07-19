import type { ReactNode } from "react";

interface AlertProps {
  type?: "info" | "warning" | "success" | "danger";
  children: ReactNode;
}

const typeStyles = {
  info: {
    bg: "bg-sky-primary/25",
    border: "border-ink",
    text: "text-ink",
    iconColor: "text-ink",
    icon: (
      <svg
        className="h-5 w-5 shrink-0"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" x2="12" y1="16" y2="12" />
        <line x1="12" x2="12.01" y1="8" y2="8" />
      </svg>
    ),
  },
  warning: {
    bg: "bg-warning/20",
    border: "border-ink",
    text: "text-ink",
    iconColor: "text-ink",
    icon: (
      <svg
        className="h-5 w-5 shrink-0"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <line x1="12" x2="12" y1="9" y2="13" />
        <line x1="12" x2="12.01" y1="17" y2="17" />
      </svg>
    ),
  },
  success: {
    bg: "bg-retro-green/20",
    border: "border-ink",
    text: "text-ink",
    iconColor: "text-ink",
    icon: (
      <svg
        className="h-5 w-5 shrink-0"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  danger: {
    bg: "bg-destructive/20",
    border: "border-ink",
    text: "text-ink",
    iconColor: "text-ink",
    icon: (
      <svg
        className="h-5 w-5 shrink-0"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="15" x2="9" y1="9" y2="15" />
        <line x1="9" x2="15" y1="9" y2="15" />
      </svg>
    ),
  },
};

export function Alert({ type = "info", children }: AlertProps) {
  const styles = typeStyles[type] || typeStyles.info;

  return (
    <div
      role="alert"
      className={`
        my-6 flex gap-4 p-4 border-2 rounded-xl shadow-retro-sm
        ${styles.bg} ${styles.border} ${styles.text}
      `}
    >
      <div className={`${styles.iconColor} pt-0.5`} aria-hidden="true">
        {styles.icon}
      </div>
      <div className="flex-1 text-sm font-medium leading-relaxed prose-p:my-0">{children}</div>
    </div>
  );
}
