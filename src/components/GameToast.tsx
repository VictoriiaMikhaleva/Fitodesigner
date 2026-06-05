import { useEffect } from "react";

export type ToastMessage = {
  id: string;
  text: string;
  tone?: "success" | "info" | "warning";
};

type GameToastProps = {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
};

const TONE_CLASS = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  info: "border-sage-200 bg-white text-sage-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
};

export function GameToast({ toasts, onDismiss }: GameToastProps) {
  useEffect(() => {
    if (toasts.length === 0) return;

    const timers = toasts.map((toast) =>
      window.setTimeout(() => onDismiss(toast.id), 2800),
    );

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [toasts, onDismiss]);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[min(360px,calc(100%-2rem))] flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`animate-toast-in pointer-events-auto rounded-2xl border px-4 py-3 text-sm shadow-lg ${TONE_CLASS[toast.tone ?? "info"]}`}
        >
          {toast.text}
        </div>
      ))}
    </div>
  );
}
