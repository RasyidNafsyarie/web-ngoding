"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface ArticleCompletionButtonProps {
  articleId: string;
  initialIsCompleted?: boolean;
}

export function ArticleCompletionButton({
  articleId,
  initialIsCompleted = false,
}: ArticleCompletionButtonProps) {
  const router = useRouter();
  const { status } = useSession();
  const isLoggedIn = status === "authenticated";

  const [isCompleted, setIsCompleted] = useState(initialIsCompleted);
  const [isLoading, setIsLoading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [awardedXp, setAwardedXp] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch status penyelesaian saat user login di klien
  useEffect(() => {
    if (status === "authenticated") {
      fetch(`/api/complete-article?articleId=${encodeURIComponent(articleId)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data?.isCompleted) {
            setIsCompleted(true);
          }
        })
        .catch(() => {});
    }
  }, [articleId, status]);

  const handleComplete = async () => {
    if (!isLoggedIn) {
      // Redirect to login if unauthenticated
      const currentPath = typeof window !== "undefined" ? window.location.pathname : "/";
      router.push(`/login?callbackUrl=${encodeURIComponent(currentPath)}`);
      return;
    }

    if (isCompleted || isLoading) return;

    setErrorMsg(null);
    setIsLoading(true);

    // Optimistic UI state update
    setIsCompleted(true);
    setShowCelebration(true);

    try {
      const response = await fetch("/api/complete-article", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ articleId }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        // Rollback optimistic update on error
        setIsCompleted(false);
        setShowCelebration(false);
        setErrorMsg(data.error?.message || "Gagal menyimpan progres. Silakan coba lagi.");
      } else {
        const earned = data.data?.xpEarned ?? 0;
        setAwardedXp(earned);
        // Auto hide celebration toast after 3.5s
        setTimeout(() => {
          setShowCelebration(false);
        }, 3500);
        router.refresh();
      }
    } catch (error) {
      console.error("Network error during complete-article:", error);
      setIsCompleted(false);
      setShowCelebration(false);
      setErrorMsg("Koneksi gagal. Periksa jaringan Anda dan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isCompleted) {
    return (
      <div className="relative inline-flex flex-col items-center">
        <div
          className="
            inline-flex items-center gap-2 px-5 py-3
            border-2 border-ink bg-pond-green text-ink rounded-lg font-pixel text-xs sm:text-sm
            shadow-retro-sm cursor-default select-none
          "
        >
          <span className="text-base" role="img" aria-label="Selesai">
            ✅
          </span>
          <span>Artikel Telah Selesai</span>
        </div>

        {showCelebration && (
          <div
            className="
              absolute -top-12 animate-bounce
              bg-retro-green text-ink border-2 border-ink px-3 py-1 rounded-full
              font-pixel text-xs shadow-retro-sm whitespace-nowrap z-10
            "
          >
            {awardedXp > 0 ? `🎉 +${awardedXp} XP Didapatkan!` : `✅ Status Selesai Tersimpan`}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="inline-flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={handleComplete}
        disabled={isLoading}
        aria-label="Tandai artikel ini sebagai selesai"
        className="
          inline-flex items-center gap-2 px-6 py-3.5
          border-2 border-ink bg-retro-green text-ink rounded-lg
          font-pixel text-xs sm:text-sm shadow-retro-md
          hover:bg-soft-green hover:shadow-retro-lg hover:-translate-x-[1px] hover:-translate-y-[1px]
          active:translate-x-[1px] active:translate-y-[1px] active:shadow-retro-pressed
          disabled:opacity-60 disabled:cursor-not-allowed
          transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink
        "
      >
        {isLoading ? (
          <>
            <span className="animate-spin text-sm">⏳</span>
            <span>Menyimpan...</span>
          </>
        ) : (
          <>
            <span className="text-base">✦</span>
            <span>{isLoggedIn ? "Tandai Selesai (+100 XP)" : "Login untuk Tandai Selesai"}</span>
          </>
        )}
      </button>

      {errorMsg && (
        <span className="text-xs font-semibold text-destructive mt-1 bg-destructive/10 px-2 py-1 border border-destructive/30 rounded">
          ⚠️ {errorMsg}
        </span>
      )}
    </div>
  );
}
