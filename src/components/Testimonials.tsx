"use client";

import React from "react";

export default function Testimonials() {
  const reviews = [
    {
      name: "Marcus K.",
      review: "The streaming quality is out of this world. Even on mobile networks, there's absolutely zero buffer times!",
      rating: 5,
    },
    {
      name: "Sophia L.",
      review: "AI recommendations finally work! HodorFlix suggested some of the best anime shows that I've ever watched.",
      rating: 5,
    },
    {
      name: "Elena R.",
      review: "Perfect offline mode. I download movies before my long flights, and the UI remains super fast even without WiFi.",
      rating: 5,
    },
    {
      name: "Pragati Z.",
      review: "Best value streaming service available. The 4K HDR fidelity on my TV is indistinguishable from physical discs.",
      rating: 5,
    },
    {
      name: "Chloe W.",
      review: "My kids love the user profiles. It separates my watchlist from their animated series seamlessly. Excellent design!",
      rating: 5,
    },
    {
      name: "Liam O.",
      review: "The interface is simply gorgeous. It's clean, minimalist, responsive, and incredibly fast to navigate.",
      rating: 5,
    },
  ];

  // Duplicate the list to allow for seamless loop wrapping in CSS marquee track
  const duplicatedReviews = [...reviews, ...reviews];

  return (
    <section className="w-full py-16 md:py-24 select-none overflow-hidden relative">
      <div className="flex flex-col gap-2 mb-12 text-left px-6 md:px-12 max-w-7xl mx-auto">
        <span className="text-[#E50914] text-xs font-bold uppercase tracking-wider">
          Testimonials
        </span>
        <h2 className="font-serif text-3xl md:text-4xl font-normal text-white">
          Loved by Viewers Worldwide
        </h2>
        <p className="text-neutral-400 text-sm max-w-xl font-medium mt-1">
          Hear from our global subscribers about their premium cinematic experiences on HodorFlix.
        </p>
      </div>

      {/* Marquee horizontal container with fade overlay masks */}
      <div className="relative w-full overflow-hidden py-4">

        {/* Left Mask */}
        <div className="absolute top-0 bottom-0 left-0 w-20 sm:w-32 md:w-48 bg-gradient-to-r from-[#0F0F0F] to-transparent z-10 pointer-events-none" />

        {/* Right Mask */}
        <div className="absolute top-0 bottom-0 right-0 w-20 sm:w-32 md:w-48 bg-gradient-to-l from-[#0F0F0F] to-transparent z-10 pointer-events-none" />

        {/* Marquee Track */}
        <div className="animate-marquee flex gap-6">
          {duplicatedReviews.map((rev, i) => {
            const initial = rev.name.trim()?.[0] ?? "?";
            return (
              <div
                key={i}
                className="w-[280px] sm:w-[320px] p-6 rounded-2xl border border-neutral-800/80 bg-neutral-900/25 backdrop-blur-md shrink-0 flex flex-col gap-4 text-left shadow-lg"
              >
                {/* Header: user info, stars */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#E50914] to-red-700 text-xs font-bold text-white shadow-[0_0_8px_rgba(229,9,20,0.35)]">
                      {initial}
                    </span>
                    <span className="text-xs font-bold text-neutral-200">{rev.name}</span>
                  </div>

                  {/* Glowing unicode stars */}
                  <div className="flex text-amber-500 gap-0.5">
                    {[...Array(rev.rating)].map((_, idx) => (
                      <span key={idx} className="text-xs">★</span>
                    ))}
                  </div>
                </div>

                {/* Review Text */}
                <p className="text-xs leading-relaxed text-neutral-400 font-medium italic">
                  &ldquo;{rev.review}&rdquo;
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
