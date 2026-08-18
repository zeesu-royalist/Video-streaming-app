"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import Button from "./Button";

export default function CallToAction() {
  return (
    <section className="w-full py-16 md:py-24 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
        className="w-full rounded-3xl border border-neutral-800/80 bg-neutral-900/10 p-8 md:p-16 text-center backdrop-blur-md relative overflow-hidden shadow-2xl flex flex-col items-center gap-6"
      >
        {/* Animated background layer */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          {/* Moving blob 1 - top left, red */}
          <motion.div
            animate={{
              x: [0, 60, -30, 0],
              y: [0, -40, 30, 0],
              scale: [1, 1.15, 0.95, 1],
            }}
            transition={{
              duration: 14,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-[#E50914]/20 blur-[90px]"
          />

          {/* Moving blob 2 - bottom right, red/orange */}
          <motion.div
            animate={{
              x: [0, -50, 40, 0],
              y: [0, 30, -30, 0],
              scale: [1, 0.9, 1.2, 1],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
            className="absolute -bottom-24 -right-16 w-80 h-80 rounded-full bg-[#E50914]/15 blur-[100px]"
          />

          {/* Moving blob 3 - center, subtle white/gray for depth */}
          <motion.div
            animate={{
              x: [0, 30, -20, 0],
              y: [0, -20, 20, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 4,
            }}
            className="absolute top-1/3 left-1/2 -translate-x-1/2 w-56 h-56 rounded-full bg-neutral-500/5 blur-[80px]"
          />
        </div>

        {/* Subtle glowing red radial circle behind text (original pulse) */}
        <motion.div
          animate={{
            scale: [1, 1.12, 1],
            opacity: [0.35, 0.5, 0.35],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 md:w-96 h-64 md:h-96 rounded-full bg-[#E50914]/12 blur-[100px] pointer-events-none"
        />

        {/* Large Heading */}
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-white max-w-2xl leading-[1.15] relative z-10">
          Ready to Experience the Next Era of Entertainment?
        </h2>

        {/* Description */}
        <p className="text-neutral-400 text-sm sm:text-base max-w-lg leading-relaxed font-medium relative z-10">
          Join thousands of streaming viewers today. Sign up now and get unlimited access to movies, originals, documentaries, and live streaming sports.
        </p>

        {/* Start Watching button */}
        <div className="relative z-10 mt-2">
          <Link href="/videos">
            <Button variant="primary" className="group px-8 py-4 font-bold flex items-center gap-2">
              <Play size={16} fill="currentColor" className="text-white" />
              <span>Start Watching Now</span>
            </Button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}