"use client";

export type ToastState = {
  message: string;
  tone: "success" | "info" | "warning";
} | null;

type ToastProps = {
  toast: ToastState;
};

const toneClass = {
  success: "border-[#20b486] bg-[#eafff6] text-[#134f40]",
  info: "border-[#118ab2] bg-[#e9f8ff] text-[#123f55]",
  warning: "border-[#f78c2f] bg-[#fff4e5] text-[#5a3512]"
};

export function Toast({ toast }: ToastProps) {
  if (!toast) {
    return null;
  }

  return (
    <div className="fixed left-1/2 top-5 z-50 w-[min(92vw,420px)] -translate-x-1/2">
      <div className={`rounded-full border-l-4 px-5 py-3 text-sm font-semibold shadow-neon ${toneClass[toast.tone]}`}>
        {toast.message}
      </div>
    </div>
  );
}
