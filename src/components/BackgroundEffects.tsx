"use client";

import React from "react";
import { motion } from "framer-motion";

export default function BackgroundEffects() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Dark overall background overlay to prevent white space */}
      <div className="absolute inset-0 bg-[#0F0F0F]" />

      {/* Red ambient glow top left */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.4, 0.55, 0.4],
          x: [0, 20, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-[10%] -left-[10%] w-[60vw] h-[60vw] md:w-[45vw] md:h-[45vw] rounded-full bg-[#E50914]/15 blur-[120px]"
      />

      {/* Indigo/Violet ambient glow center right */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.3, 0.45, 0.3],
          x: [0, -30, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute top-[15%] -right-[5%] w-[60vw] h-[60vw] md:w-[45vw] md:h-[45vw] rounded-full bg-[#6366F1]/10 blur-[130px]"
      />

      {/* Red ambient glow bottom left */}
      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.25, 0.35, 0.25],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
        className="absolute -bottom-[10%] left-[15%] w-[50vw] h-[50vw] md:w-[35vw] md:h-[35vw] rounded-full bg-[#E50914]/8 blur-[110px]"
      />

      {/* Subtle overlay grid for texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      {/* Vignette effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-transparent to-[#0F0F0F]/50" />
    </div>
  );
}
