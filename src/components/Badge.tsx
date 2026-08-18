import React from "react";

interface BadgeProps {
  text: string;
  dotColor?: "red" | "green" | "yellow" | "blue";
  className?: string;
}

export default function Badge({ text, dotColor = "red", className = "" }: BadgeProps) {
  const dotColorClasses = {
    red: "bg-[#E50914] shadow-[0_0_8px_rgba(229,9,20,0.8)] animate-pulse",
    green: "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse",
    yellow: "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)] animate-pulse",
    blue: "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse",
  };

  const borderClass =
    dotColor === "red"
      ? "border-[#E50914]/30 bg-[#E50914]/5"
      : "border-neutral-800 bg-neutral-900/40";

  return (
    <div
      className={`inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border ${borderClass} backdrop-blur-md text-[11px] font-bold tracking-wider text-neutral-200 ${className}`}
    >
      <span className={`h-2 w-2 rounded-full ${dotColorClasses[dotColor]}`} />
      <span className="uppercase">{text}</span>
    </div>
  );
}
