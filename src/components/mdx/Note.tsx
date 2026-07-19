import type { ReactNode } from "react";

interface NoteProps {
  children: ReactNode;
}

export function Note({ children }: NoteProps) {
  return (
    <div
      className="
        my-6 flex gap-4 p-4 border-2 border-ink rounded-xl bg-pond-green/25 text-ink shadow-retro-sm
      "
    >
      <div className="text-ink pt-0.5" aria-hidden="true">
        <svg
          className="h-5 w-5 shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      </div>
      <div className="flex-1 text-sm font-medium leading-relaxed prose-p:my-0">
        <span className="font-bold uppercase tracking-wider text-xs block mb-1">Catatan:</span>
        {children}
      </div>
    </div>
  );
}
