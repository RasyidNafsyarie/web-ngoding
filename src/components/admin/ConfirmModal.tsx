"use client";

import { ReactNode } from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = "Ya, Hapus",
  cancelLabel = "Batal",
  isLoading = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs">
      <div
        className="
          w-full max-w-md border-4 border-ink bg-card-white rounded-2xl p-6 shadow-retro-lg
          flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-150
        "
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-center gap-3 border-b-2 border-ink pb-3">
          <span className="text-2xl">⚠️</span>
          <h3 id="modal-title" className="font-pixel text-xs sm:text-sm text-ink uppercase">
            {title}
          </h3>
        </div>

        <div className="text-xs sm:text-sm text-ink leading-relaxed font-semibold">{message}</div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-ink/20">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="
              px-4 py-2 border-2 border-ink rounded-lg bg-card-white text-ink text-xs font-bold
              hover:bg-container/50 disabled:opacity-50 cursor-pointer transition-colors
            "
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="
              px-5 py-2 border-2 border-ink rounded-lg bg-destructive text-card-white text-xs font-bold
              shadow-retro-sm hover:opacity-90 active:translate-x-[1px] active:translate-y-[1px]
              disabled:opacity-50 cursor-pointer transition-all flex items-center gap-2
            "
          >
            {isLoading ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>Memproses...</span>
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
