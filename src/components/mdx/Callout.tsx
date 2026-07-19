import type { ReactNode } from "react";

interface CalloutProps {
  children: ReactNode;
}

export function Callout({ children }: CalloutProps) {
  return (
    <div
      className="
        my-6 flex gap-4 p-4 border-2 border-ink rounded-xl bg-soft-green/20 text-ink shadow-retro-sm
      "
    >
      <div className="text-ink pt-0.5" aria-hidden="true">
        {/* Retro spark / star icon */}
        <svg
          className="h-5 w-5 shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z" />
        </svg>
      </div>
      <div className="flex-1 text-sm font-medium leading-relaxed prose-p:my-0">{children}</div>
    </div>
  );
}
