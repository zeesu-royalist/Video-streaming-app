"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "outline";
  children: React.ReactNode;
  className?: string;
}

export default function Button({
  variant = "primary",
  children,
  className = "",
  ...props
}: ButtonProps) {
  const baseClasses =
    "relative inline-flex items-center justify-center font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-950 rounded-lg cursor-pointer select-none";

  const variants = {
    primary:
      "bg-[#E50914] text-white hover:bg-[#b8070f] shadow-[0_4px_20px_rgba(229,9,20,0.35)] focus:ring-[#E50914] px-6 py-3.5 gap-2",
    secondary:
      "bg-neutral-900/60 text-neutral-200 border border-neutral-800/80 hover:bg-neutral-800/80 hover:border-neutral-700 hover:text-white focus:ring-neutral-700 backdrop-blur-sm px-6 py-3.5 gap-2",
    outline:
      "bg-transparent text-neutral-300 border border-neutral-800 hover:border-neutral-600 hover:text-white focus:ring-neutral-800 px-5 py-2.5 gap-2",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
