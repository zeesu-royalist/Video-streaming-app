"use client";

import React from "react";
import { motion, Variants } from "framer-motion";

export default function Stats() {
  const stats = [
    { value: "10K+", label: "Movies" },
    { value: "500+", label: "TV Shows" },
    { value: "100+", label: "Countries" },
    { value: "99%", label: "Viewer Satisfaction" },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <div className="w-full select-none relative">
      {/* Separator line */}
      <div className="w-full h-px bg-neutral-900/80 mb-8" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        {/* Left Side: Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-6 sm:gap-x-12 lg:gap-x-16 w-full md:w-auto"
        >
          {stats.map((stat, i) => (
            <motion.div key={i} variants={itemVariants} className="flex flex-col gap-1.5">
              <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {stat.value}
              </span>
              <span className="text-[10px] sm:text-xs text-neutral-400 font-bold uppercase tracking-wider">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
