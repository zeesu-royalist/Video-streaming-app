"use client";

import React from "react";
import { motion, Variants } from "framer-motion";

export default function TrendingCategories() {
  const categories = [
    {
      name: "Algorithms",
      count: "1,240+ Titles",
      gradient: "from-red-950/60 to-orange-900/30",
      borderGlow: "group-hover:border-red-500/30",
      glowColor: "rgba(239,68,68,0.1)",
      tag: "Adrenaline & Thrills",
      gif: "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExcjN6NzBweHJwcGc0bm5kaGNqOHZjNmgxd2F0ZzRpM3ZxdnpyMmE3aSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/1L9AwWrIhDFbBX9AZl/giphy.gif",
    },
    {
      name: "Physics",
      count: "850+ Titles",
      gradient: "from-yellow-950/40 to-amber-900/20",
      borderGlow: "group-hover:border-amber-500/30",
      glowColor: "rgba(245,158,11,0.1)",
      tag: "Non-stop Laughs",
      gif: "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExYWJtM292Y3ZsMHF5dXZ2YmRpMjVlZGJiYTEyMXRsYzJuNGRrMm52ZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/VsCDHa6wEOqAfhV1nX/giphy.gif",
    },
    {
      name: "Chemistry",
      count: "420+ Titles",
      gradient: "from-neutral-950 to-red-950/30",
      borderGlow: "group-hover:border-red-900/40",
      glowColor: "rgba(127,29,29,0.15)",
      tag: "Dark & Suspenseful",
      gif: "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExbTZkdTNpc25hN2xqYWN4dWtvYnpuanMybjc2dGkxaHdidHpvaTVvbyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Pjg8nWDkueIPX7W0cz/giphy.gif",
    },
    {
      name: "Mathematics",
      count: "680+ Titles",
      gradient: "from-purple-950/60 to-pink-900/20",
      borderGlow: "group-hover:border-pink-500/30",
      glowColor: "rgba(236,72,153,0.1)",
      tag: "Animated Masterpieces",
      gif: "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExamJobGZrMGl4ZW9xa2VoNGFtZ2dqbXh0dXVhcXljeGxkMWNwZzI3MSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/LRxbk6xYZzHSVrwHd5/giphy.gif",
    },
    {
      name: "Science",
      count: "930+ Titles",
      gradient: "from-indigo-950/60 to-cyan-900/20",
      borderGlow: "group-hover:border-cyan-500/30",
      glowColor: "rgba(6,182,212,0.1)",
      tag: "Futuristic Worlds",
      gif: "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExY2JrcXlyOXF0a21iYXprZ2xic3locTdubnV0aXFpZ2J5NG0xeWc5ayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xT9IglugGaqF5UW4Ug/giphy.gif",
    },
    {
      name: "Drawing",
      count: "1,100+ Titles",
      gradient: "from-emerald-950/50 to-teal-900/20",
      borderGlow: "group-hover:border-teal-500/30",
      glowColor: "rgba(20,184,166,0.1)",
      tag: "Emotional Stories",
      gif: "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExeTZtNG9qdjFmaDN0cjN4NjQ2Z2dhc29hNjN1MzAzdXFyZmY1cnVwZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/8m5255Q0miabxN1Ev0/giphy.gif",
    },
  ];

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" as const },
    },
  };

  return (
    <section className="w-full py-16 md:py-24 select-none">
      <div className="flex flex-col gap-2 mb-12 text-left">
        <span className="text-[#E50914] text-xs font-bold uppercase tracking-wider">
          Browse Genres
        </span>
        <h2 className="font-serif text-3xl md:text-4xl font-normal text-white">
          Trending Categories
        </h2>
        <p className="text-neutral-400 text-sm max-w-xl font-medium mt-1">
          Explore our massive catalog of movies and series organized by trending genres.
        </p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5"
      >
        {categories.map((cat, i) => (
          <motion.div
            key={i}
            variants={cardVariants}
            whileHover={{ scale: 1.05, y: -4 }}
            className={`group relative overflow-hidden rounded-2xl border border-neutral-800/80 p-5 backdrop-blur-md transition-all duration-300 ${cat.borderGlow} hover:shadow-[0_15px_30px_-10px_var(--glow)] flex flex-col justify-between aspect-[3/4] text-left cursor-pointer`}
            style={{ "--glow": cat.glowColor } as React.CSSProperties}
          >
            {/* GIF background */}
            <img
              src={cat.gif}
              alt={`${cat.name} background`}
              className="absolute inset-0 h-full w-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all duration-500 ease-out"
            />

            {/* Gradient overlay so text stays readable */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} bg-neutral-950/50 group-hover:bg-neutral-950/30 transition-colors duration-300`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Header info */}
            <div className="relative z-10 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-wider">
                {cat.count}
              </span>
              <h3 className="text-lg font-extrabold text-neutral-100 group-hover:text-white mt-1">
                {cat.name}
                
              </h3>
            </div>

            {/* Bottom details */}
            <div className="relative z-10 flex flex-col gap-1.5 mt-auto">
              <span className="text-[10px] font-semibold text-[#E50914] group-hover:text-red-400 transition-colors uppercase tracking-wider">
                {cat.tag}
              </span>
              <span className="text-[9px] font-bold text-neutral-400 group-hover:text-neutral-200 transition-colors uppercase tracking-[0.15em]">
                Explore →
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};