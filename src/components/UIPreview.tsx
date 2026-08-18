"use client";

import React from "react";
import { motion, Variants } from "framer-motion";

export default function UIPreview() {
  const sidebarItems = [1, 2, 3, 4, 5];
  const categoryChips = [
    { width: "w-14" },
    { width: "w-20" },
    { width: "w-16" },
    { width: "w-24" },
    { width: "w-12" },
    { width: "w-28" },
    { width: "w-16" },
    { width: "w-22" },
  ];
  const videoCards = [1, 2, 3, 4, 5, 6, 7, 8];

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  return (
    <section className="w-full py-16 md:py-24 select-none">
      <div className="flex flex-col gap-2 mb-12 text-left px-4 md:px-0">
        <span className="text-[#E50914] text-xs font-bold uppercase tracking-wider">
          Performance Mockup
        </span>
        <h2 className="font-serif text-3xl md:text-4xl font-normal text-white">
          Simulated Load Experience
        </h2>
        <p className="text-neutral-400 text-sm max-w-xl font-medium mt-1">
          HodorFlix loads instantly across devices. Preview our premium, shimmer-animated interface skeleton mimicking YouTube&apos;s loading structure.
        </p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="w-full rounded-none md:rounded-2xl border-0 md:border border-neutral-800/80 bg-neutral-900/10 backdrop-blur-md overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] flex flex-col"
      >
        {/* Mock Application Top Header */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 border-b border-neutral-900 bg-neutral-950/20 gap-2 sm:gap-0">
          <div className="flex items-center gap-2 sm:gap-6 min-w-0">
            {/* Hamburger menu & logo placeholder */}
            <div className="flex flex-col gap-1 w-4 sm:w-5 shrink-0">
              <div className="h-0.5 w-full bg-neutral-800 rounded" />
              <div className="h-0.5 w-full bg-neutral-800 rounded" />
              <div className="h-0.5 w-full bg-neutral-800 rounded" />
            </div>
            <div className="h-4 sm:h-5 w-14 sm:w-24 rounded premium-shimmer shrink-0" />
          </div>

          {/* Central Search Box - now always visible, shrinks on small screens */}
          <div className="block flex-1 max-w-[90px] sm:max-w-[220px] md:max-w-[400px] h-7 sm:h-8 md:h-9 mx-2 sm:mx-4 rounded-full border border-neutral-800 bg-neutral-950/40 relative overflow-hidden">
            <div className="absolute inset-y-0 right-0 w-8 sm:w-12 md:w-16 border-l border-neutral-800 bg-neutral-900/40 flex items-center justify-center">
              <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5 rounded-full border border-neutral-800" />
            </div>
          </div>

          {/* User profile avatar - username now always visible */}
          <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
            <div className="hidden xs:block h-3 sm:h-4 w-8 sm:w-12 rounded premium-shimmer" />
            <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full premium-shimmer shrink-0" />
          </div>
        </div>

        {/* Lower Main Panels (Sidebar + Content area) */}
        <div className="flex flex-1 min-h-[380px] sm:min-h-[460px]">

          {/* Left Navigation Sidebar Skeleton - always visible, compact on mobile */}
          <div className="flex flex-col gap-3.5 sm:gap-6 w-14 sm:w-40 lg:w-56 border-r border-neutral-900 p-2.5 sm:p-4 lg:p-5 bg-neutral-950/10 shrink-0">
            {sidebarItems.map((item) => (
              <div key={item} className="flex items-center gap-0 sm:gap-3 lg:gap-4 py-1">
                <div className="h-4 w-4 sm:h-5 sm:w-5 rounded-lg premium-shimmer shrink-0" />
                <div className="hidden sm:block h-3 w-16 lg:w-24 rounded premium-shimmer" />
              </div>
            ))}
            <div className="h-px bg-neutral-900 my-1 sm:my-2" />
            <div className="hidden sm:block h-3.5 w-24 lg:w-32 rounded premium-shimmer mb-2" />
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center gap-0 sm:gap-3 lg:gap-4 py-1">
                <div className="h-4 w-4 sm:h-5 sm:w-5 rounded-full premium-shimmer shrink-0" />
                <div className="hidden sm:block h-3 w-14 lg:w-20 rounded premium-shimmer" />
              </div>
            ))}
          </div>

          {/* Right Content Panel */}
          <div className="flex-1 p-3 sm:p-6 md:p-8 flex flex-col gap-4 sm:gap-8 bg-neutral-950/5 min-w-0">

            {/* Category Chips row */}
            <div className="flex flex-nowrap sm:flex-wrap items-center gap-1.5 sm:gap-3 overflow-x-auto sm:overflow-visible pb-1 sm:pb-0">
              {categoryChips.map((chip, idx) => (
                <div
                  key={idx}
                  className={`h-5 sm:h-7 ${chip.width} rounded-full premium-shimmer border border-white/20 shrink-0 scale-90 sm:scale-100`}
                />
              ))}
            </div>

            {/* Video Cards Grid - fewer cards on mobile, full set on larger screens */}
            <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-6">
              {videoCards.map((card) => (
                <div
                  key={card}
                  className={`flex-col gap-1.5 sm:gap-3.5 ${
                    card > 4 ? "hidden sm:flex" : "flex"
                  }`}
                >
                  {/* 16:9 main video thumbnail container */}
                  <div className="w-full aspect-video rounded-md sm:rounded-xl premium-shimmer border border-white/50 relative overflow-hidden" />

                  {/* Avatar & Text columns */}
                  <div className="flex gap-1.5 sm:gap-3 px-0.5 sm:px-1">
                    {/* User profile avatar circle */}
                    <div className="w-5 h-5 sm:w-9 sm:h-9 rounded-full premium-shimmer border border-white/20 shrink-0" />

                    {/* Title & metadata lines */}
                    <div className="flex-1 flex flex-col justify-start min-w-0">
                      <div className="h-2.5 sm:h-4 w-[90%] rounded premium-shimmer mb-1 sm:mb-2.5" />
                      <div className="h-2 sm:h-3.5 w-[65%] rounded premium-shimmer mb-1 sm:mb-2" />
                      <div className="h-2 sm:h-3 w-[45%] rounded premium-shimmer" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>

      </motion.div>
    </section>
  );
}