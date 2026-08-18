"use client";

import React from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { Play, Library } from "lucide-react";
import Button from "./Button";
import Badge from "./Badge";

export default function Hero() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.15,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { x: -35, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col text-left max-w-2xl select-none"
    >
      {/* Badge */}
      <motion.div variants={itemVariants} className="mb-6">
        <Badge text="Streaming Worldwide" dotColor="red" />
      </motion.div>

      {/* Main Heading */}
      <motion.h1
        variants={itemVariants}
        className="font-serif text-[38px] sm:text-5xl md:text-[56px] font-normal leading-[1.15] text-white tracking-tight mb-6"
      >
        Unlimited Courses,<br />
        <span className="font-sans font-bold bg-gradient-to-r from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
          Skills & Learning
        </span> &<br />
        <span className="italic font-serif">Live Resources</span>
      </motion.h1>

      {/* Description */}
      <motion.p
        variants={itemVariants}
        className="text-sm sm:text-base text-neutral-400 leading-relaxed max-w-lg mb-8 font-medium"
      >
        Watch thousands of blockbuster movies, trending series, exclusive
        originals, anime, documentaries, and live sports — all in one place.
      </motion.p>

      {/* Action Buttons */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mb-9">
        <Link href="/videos" className="w-full sm:w-auto">
          <Button variant="primary" className="group w-full">
            <Play size={16} fill="currentColor" className="text-white" />
            <span>Start Watching</span>
          </Button>
        </Link>
        <Link href="/documents" className="w-full sm:w-auto">
          <Button variant="secondary" className="group w-full">
            <Library
              size={16}
              className="text-neutral-400 group-hover:text-white transition-colors duration-200"
            />
            <span>Browse Library</span>
          </Button>
        </Link>
      </motion.div>

      {/* Features list below buttons */}
      <motion.div
        variants={itemVariants}
        className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-neutral-400 font-semibold tracking-wide"
      >
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#E50914]" />
          4K Ultra HD
        </span>
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#E50914]" />
          No Ads
        </span>
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#E50914]" />
          Unlimited Streaming
        </span>
      </motion.div>
    </motion.div>
  );
}
