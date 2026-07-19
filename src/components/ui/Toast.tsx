"use client";

import { useEffect, useState } from "react";

export type ToastVariant = "success" | "error" | "info" | "warning";

interface ToastProps {
  message: string;
  variant?: ToastVariant;
  duration?: number;
  onClose: () => void;
}

/* DESIGN.md: Color blocking — tiap varian punya background warna solid */
const variantConfig: Record<ToastVariant, { bg: string; icon: string; label: string }> = {
  success: { bg: "bg-retro-green text-ink", icon: "✓", label: "Sukses" },
  error: { bg: "bg-destructive text-white", icon: "✗", label: "Error" },
  info: { bg: "bg-pond-green text-ink", icon: "!", label: "Info" },
  warning: { bg: "bg-warning text-ink", icon: "⚠", label: "Perhatian" },
};

/**
 * Calm Retro Toast (DESIGN.md)
 * - border-2 border-ink, hard shadow (retro-md), rounded-card (12px)
 * - Warna solid per varian (tidak ada gradient/opacity)
 * - Accessible: role + aria-live
 */
export function Toast({ message, variant = "info", duration = 4000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(true);
  const config = variantConfig[variant];

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 200);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      aria-live={variant === "error" ? "assertive" : "polite"}
      aria-label={config.label}
      className={`
        neo-card flex items-start gap-4 min-w-[300px] max-w-sm p-4
        ${config.bg}
        transition-all duration-200 ease-out
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}
      `}
    >
      {/* Icon dalam bordered box kecil */}
      <span
        aria-hidden="true"
        className="
          shrink-0 w-8 h-8 flex items-center justify-center
          border-2 border-ink font-black text-sm
        "
      >
        {config.icon}
      </span>

      <p className={`text-sm font-bold leading-snug flex-1 ${variant === "error" ? "text-white" : "text-ink"}`}>{message}</p>

      <button
        onClick={() => {
          setVisible(false);
          setTimeout(onClose, 200);
        }}
        aria-label="Tutup notifikasi"
        className="
          shrink-0 w-7 h-7 flex items-center justify-center
          border-2 border-ink font-black text-xs
          bg-card-white text-ink
          hover:bg-deep-black hover:text-white
          active:translate-x-[2px] active:translate-y-[2px]
          transition-all duration-100
          focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-1
        "
      >
        ✕
      </button>
    </div>
  );
}


/* ── Toast Container & global showToast ───────────────────────── */

interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
}

let globalToastHandler: ((item: Omit<ToastItem, "id">) => void) | null = null;

/** Panggil dari mana saja: `showToast({ message: "...", variant: "success" })` */
export function showToast(item: Omit<ToastItem, "id">) {
  globalToastHandler?.(item);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    globalToastHandler = (item) => {
      setToasts((prev) => [...prev, { ...item, id: crypto.randomUUID() }]);
    };
    return () => {
      globalToastHandler = null;
    };
  }, []);

  function removeToast(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 items-end"
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          variant={toast.variant}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
