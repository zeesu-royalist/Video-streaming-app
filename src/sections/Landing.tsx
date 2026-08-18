"use client";

import React from "react";
import Navbar from "@/components/LandingNavbar";
import Hero from "@/components/Hero";
import HeroCard from "@/components/HeroCard";
import Stats from "@/components/Stats";
import UIPreview from "@/components/UIPreview";
import WhyChooseUs from "@/components/WhyChooseUs";
import TrendingCategories from "@/components/TrendingCategories";
import Testimonials from "@/components/Testimonials";
import CallToAction from "@/components/CallToAction";

export default function Landing({ session }: { session: { user?: { id: string; name?: string | null; email?: string | null; role?: string } } | null }) {
  return (
    <div className="relative min-h-screen text-white overflow-x-hidden font-sans bg-transparent">
      {/* Top Fixed Navigation */}
      <Navbar session={session} />

      {/* Content wrapper */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-32 md:pt-36 flex flex-col justify-between min-h-[calc(100vh-80px)] mb-16">
        
        {/* Main 2-Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center my-auto pb-16">
          
          {/* Left Column: Hero badge, heading, buttons, and specs */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <Hero />
          </div>

          {/* Right Column: Floating movie card & red progress slide */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end items-center">
            <HeroCard />
          </div>
          
        </div>

        {/* Bottom Section: Separator line, statistics grid, scroll chevron */}
        <div className="w-full mt-auto">
          <Stats />
        </div>
        
      </div>

      {/* Landing Page Content Sections */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 flex flex-col gap-6">
        <UIPreview />
        <WhyChooseUs />
        <TrendingCategories />
        <Testimonials />
        <CallToAction />
      </div>
    </div>
  );
}
