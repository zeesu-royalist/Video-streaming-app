"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { Tv, Sparkles, Smartphone, Download, Heart, Zap } from "lucide-react";

export default function WhyChooseUs() {
  const features = [
    {
      icon: Tv,
      title: "4K Ultra HD Streaming",
      description: "Experience cinema-quality visual fidelity right in your living room with full 4K UHD and HDR support.",
    },
    {
      icon: Sparkles,
      title: "AI Movie Recommendations",
      description: "Discover new favorites tailored to your viewing tastes using our state-of-the-art suggestion engine.",
    },
    {
      icon: Smartphone,
      title: "Multi-Device Support",
      description: "Stream seamlessly across smartphones, tablets, laptops, game consoles, and smart TVs without interruptions.",
    },
    {
      icon: Download,
      title: "Watch Offline",
      description: "Download titles directly to your device and take your entertainment library with you on the go, offline.",
    },
    {
      icon: Heart,
      title: "Personalized Watchlist",
      description: "Curate your own perfect watch queue, save titles for later, and keep track of trending show seasons.",
    },
    {
      icon: Zap,
      title: "Lightning Fast Streaming",
      description: "Stream instantly with zero buffer times or delay, powered by our premium content delivery networks.",
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
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as const },
    },
  };

  return (
    <section className="w-full py-16 md:py-24 select-none">
      <div className="flex flex-col gap-2 mb-12 text-left">
        <span className="text-[#E50914] text-xs font-bold uppercase tracking-wider">
          Features
        </span>
        <h2 className="font-serif text-3xl md:text-4xl font-normal text-white">
          Why Choose HodorFlix
        </h2>
        <p className="text-neutral-400 text-sm max-w-xl font-medium mt-1">
          We bring you next-generation streaming technologies and premium user experiences to satisfy your entertainment cravings.
        </p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {features.map((feat, i) => {
          const Icon = feat.icon;

          return (
            <motion.div
              key={i}
              variants={cardVariants}
              whileHover={{ y: -6 }}
              className="group rounded-2xl border border-neutral-800/80 bg-neutral-900/25 p-8 backdrop-blur-md transition-all duration-300 hover:border-[#E50914]/30 hover:bg-neutral-900/45 hover:shadow-[0_20px_50px_-20px_rgba(229,9,20,0.15)] flex flex-col items-start gap-4 text-left"
            >
              {/* Icon Container with glowing background */}
              <div className="h-12 w-12 rounded-xl bg-neutral-950/60 border border-neutral-800 flex items-center justify-center text-[#E50914] group-hover:scale-110 group-hover:border-[#E50914]/40 group-hover:shadow-[0_0_15px_rgba(229,9,20,0.25)] transition-all duration-300">
                <Icon size={20} strokeWidth={2} />
              </div>

              {/* Title & Description */}
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-bold text-neutral-100 group-hover:text-white transition-colors">
                  {feat.title}
                </h3>
                <p className="text-xs leading-relaxed text-neutral-400 font-medium">
                  {feat.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
