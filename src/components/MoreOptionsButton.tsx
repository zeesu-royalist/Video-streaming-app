"use client";

export default function MoreOptionsButton() {
  return (
    <button
      className="shrink-0 self-start mt-1 text-neutral-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-100 p-1 rounded-full hover:bg-white/10"
      onClick={(e) => e.preventDefault()}
      title="More options"
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="5" r="1.5" />
        <circle cx="12" cy="12" r="1.5" />
        <circle cx="12" cy="19" r="1.5" />
      </svg>
    </button>
  );
}
