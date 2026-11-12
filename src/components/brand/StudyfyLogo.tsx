import React from "react";

interface StudyfyLogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "ink" | "light";
  showTagline?: boolean;
  iconOnly?: boolean;
}

export function StudyfyLogo({
  size = "md",
  variant = "ink",
  showTagline = false,
  iconOnly = false,
}: StudyfyLogoProps) {
  const dimensions = {
    sm: { box: "w-8 h-8", text: "text-lg", tag: "text-xs" },
    md: { box: "w-9 h-9", text: "text-xl", tag: "text-xs" },
    lg: { box: "w-11 h-11", text: "text-2xl", tag: "text-sm" },
  }[size];

  const wordmarkColor =
    variant === "light"
      ? "text-white"
      : "text-[#111827] dark:text-white";

  const taglineColor =
    variant === "light"
      ? "text-emerald-200/80"
      : "text-slate-500 dark:text-slate-400";

  return (
    <div className="inline-flex items-center gap-3 select-none">
      {/* Sleek Curved Emerald 'S' Emblem matching the UI Mockup */}
      <div className="shrink-0 flex items-center justify-center" aria-hidden="true">
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-9 h-9"
        >
          <path
            d="M26 9.5C26 6.46 23.54 4 20.5 4H13C8.58 4 5 7.58 5 12C5 16.42 8.58 20 13 20H23C25.21 20 27 21.79 27 24C27 26.21 25.21 28 23 28H14C11.79 28 10 26.21 10 24"
            stroke="#22C55E"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="26" cy="9.5" r="2.2" fill="#86EFAC" />
          <circle cx="10" cy="24" r="2.2" fill="#86EFAC" />
        </svg>
      </div>

      {!iconOnly && (
        <div className="flex flex-col leading-tight">
          <span
            className={`font-bold tracking-tight text-xl ${wordmarkColor}`}
          >
            Studyfy
          </span>
          {showTagline && (
            <span className={`text-xs font-medium ${taglineColor}`}>
              Your Knowledge. Your Space.
            </span>
          )}
        </div>
      )}
    </div>
  );
}
