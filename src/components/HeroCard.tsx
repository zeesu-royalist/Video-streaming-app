"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import Badge from "./Badge";

export default function HeroCard() {
  return (
    <div className="relative flex items-center gap-6 select-none shrink-0">
      {/* Floating Card */}
      <motion.div
        initial={{ x: 60, opacity: 0 }}
        animate={{
          x: 0,
          opacity: 1,
          y: [0, -8, 0],
        }}
        transition={{
          x: { duration: 0.8, ease: "easeOut" },
          opacity: { duration: 0.8 },
          y: {
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
        className="w-full max-w-[360px] md:max-w-[380px] p-6 rounded-2xl border border-neutral-800/80 bg-neutral-900/35 backdrop-blur-xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85),0_0_40px_rgba(229,9,20,0.02)] hover:border-neutral-700/60 hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_50px_rgba(229,9,20,0.05)] transition-all duration-500"
      >
        <div className="flex flex-col gap-4">
          {/* Badge */}
          <div>
            <Badge
              text="NOW STREAMING"
              dotColor="green"
              className="border-green-500/20 bg-green-500/5 text-green-400 text-[10px]"
            />
          </div>

          {/* Title & Genres */}
          <div className="flex flex-col gap-1 mt-1">
            <h3 className="text-2xl font-bold text-white tracking-wide uppercase">
              Stranger Things
            </h3>
            <span className="text-[#E50914] text-xs font-bold tracking-wider uppercase">
              Sci-Fi • Mystery • Drama
            </span>
          </div>

          {/* Stars & IMDb */}
          <div className="flex items-center gap-3">
            <div className="flex text-amber-500 gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} fill="currentColor" stroke="none" />
              ))}
            </div>
            <div className="text-[10px] font-bold text-neutral-300 bg-neutral-800/50 px-2 py-0.5 rounded border border-neutral-700/60">
              IMDb 8.7
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-neutral-400 leading-relaxed font-medium">
            Dive into a world of mystery, supernatural events, and unforgettable
            adventures. Follow a group of young friends in a small town as they
            uncover a government conspiracy, a portal to an alternate dimension,
            and a girl with psychokinetic powers.
          </p>

          {/* Bottom Action */}
          <Link href="/videos" className="w-full">
            <div className="border-t border-neutral-800/60 pt-4 mt-1 flex items-center justify-between group cursor-pointer">
              <span className="text-xs font-semibold text-neutral-300 group-hover:text-white transition-colors">
                Watch Now
              </span>
              <div className="h-7 w-7 rounded-full bg-neutral-800 group-hover:bg-[#E50914] flex items-center justify-center transition-all duration-300 text-neutral-400 group-hover:text-white shadow-[0_0_15px_rgba(0,0,0,0.2)]">
                <ArrowRight
                  size={14}
                  className="group-hover:translate-x-0.5 transition-transform duration-200"
                />
              </div>
            </div>
          </Link>
        </div>
      </motion.div>

      {/* Decorative vertical red slider indicator on the right */}
      <motion.div
        initial={{ opacity: 0, scaleY: 0.8 }}
        animate={{ opacity: 1, scaleY: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="hidden md:flex flex-col items-center justify-between h-[300px] w-2.5 rounded-full border border-neutral-800/80 bg-neutral-950/60 py-1"
      >
        <motion.div
          animate={{
            y: [0, 230, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-1.5 h-12 rounded-full bg-gradient-to-b from-[#E50914] to-red-600 shadow-[0_0_12px_rgba(229,9,20,0.9)]"
        />
      </motion.div>
    </div>
  );
}
