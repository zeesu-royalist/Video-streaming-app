"use client";

import React from "react";
import Link from "next/link";
import { ArrowUp } from "lucide-react";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full border-t border-neutral-900 bg-[#0F0F0F] pt-16 pb-8 select-none relative z-10 text-left mt-16 md:mt-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col gap-12">
        {/* Top grid (6 spans: 2 + 1 + 1 + 1 + 1) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Logo & Description Column (2 spans) */}
          <div className="md:col-span-2 lg:col-span-2 flex flex-col gap-4">
            <span className="text-xl md:text-2xl font-bold tracking-tight text-white select-none">
              HodorFlix<span className="text-[#E50914]">.</span>
            </span>
            <p className="text-xs text-neutral-400 font-medium leading-relaxed max-w-sm">
              Watch thousands of blockbuster movies, trending series, exclusive originals, anime, documentaries, and live sports — all in one place. Your ultimate streaming hub.
            </p>
            {/* Social media icons */}
            <div className="flex items-center gap-3 mt-2">
              <a
                href="#"
                className="h-8.5 w-8.5 rounded-full border border-neutral-850 bg-neutral-900/35 flex items-center justify-center text-neutral-400 hover:text-white hover:border-[#E50914]/40 hover:shadow-[0_0_10px_rgba(229,9,20,0.2)] transition-all duration-300"
                aria-label="Twitter link"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a
                href="#"
                className="h-8.5 w-8.5 rounded-full border border-neutral-850 bg-neutral-900/35 flex items-center justify-center text-neutral-400 hover:text-white hover:border-[#E50914]/40 hover:shadow-[0_0_10px_rgba(229,9,20,0.25)] transition-all duration-300"
                aria-label="Instagram link"
              >
                <svg className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a
                href="#"
                className="h-8.5 w-8.5 rounded-full border border-neutral-850 bg-neutral-900/35 flex items-center justify-center text-neutral-400 hover:text-white hover:border-[#E50914]/40 hover:shadow-[0_0_10px_rgba(229,9,20,0.25)] transition-all duration-300"
                aria-label="Youtube link"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.524 3.545 12 3.545 12 3.545s-7.525 0-9.388.51a3.002 3.002 0 0 0-2.11 2.108C0 8.029 0 12 0 12s0 3.971.502 5.837a3.003 3.003 0 0 0 2.11 2.108c1.863.51 9.388.51 9.388.51s7.524 0 9.388-.51a3.002 3.002 0 0 0 2.11-2.108C24 15.971 24 12 24 12s0-3.971-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              <a
                href="#"
                className="h-8.5 w-8.5 rounded-full border border-neutral-850 bg-neutral-900/35 flex items-center justify-center text-neutral-400 hover:text-white hover:border-[#E50914]/40 hover:shadow-[0_0_10px_rgba(229,9,20,0.25)] transition-all duration-300"
                aria-label="Github link"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links Column (1 span) */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Quick Links
            </h4>
            <nav className="flex flex-col gap-2.5 text-xs font-semibold text-neutral-400">
              <Link href="/" className="hover:text-[#E50914] transition-colors">
                Home
              </Link>
              <Link href="/videos" className="hover:text-[#E50914] transition-colors">
                Movies & TV
              </Link>
              <Link href="/documents" className="hover:text-[#E50914] transition-colors">
                Documents
              </Link>
              <Link href="/dashboard" className="hover:text-[#E50914] transition-colors">
                Dashboard
              </Link>
            </nav>
          </div>

          {/* Categories Column (1 span) */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Genres
            </h4>
            <nav className="flex flex-col gap-2.5 text-xs font-semibold text-neutral-400">
              <Link href="/videos" className="hover:text-[#E50914] transition-colors">
                Action
              </Link>
              <Link href="/videos" className="hover:text-[#E50914] transition-colors">
                Comedy
              </Link>
              <Link href="/videos" className="hover:text-[#E50914] transition-colors">
                Horror
              </Link>
              <Link href="/videos" className="hover:text-[#E50914] transition-colors">
                Anime
              </Link>
              <Link href="/videos" className="hover:text-[#E50914] transition-colors">
                Sci-Fi
              </Link>
            </nav>
          </div>

          {/* Support Column (1 span) */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Support
            </h4>
            <nav className="flex flex-col gap-2.5 text-xs font-semibold text-neutral-450">
              <Link href="#" className="hover:text-[#E50914] transition-colors">
                FAQ
              </Link>
              <Link href="#" className="hover:text-[#E50914] transition-colors">
                Help Center
              </Link>
              <Link href="#" className="hover:text-[#E50914] transition-colors">
                Contact Support
              </Link>
              <Link href="#" className="hover:text-[#E50914] transition-colors">
                Platform Status
              </Link>
            </nav>
          </div>

          {/* Newsletter Column (1 span) */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Newsletter
            </h4>
            <p className="text-[11px] text-neutral-400 font-medium leading-relaxed">
              Subscribe to get release updates and exclusive streaming news.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-2.5 mt-1">
              <input
                required
                type="email"
                placeholder="Enter email"
                className="w-full rounded-xl bg-neutral-950/40 border border-neutral-800/80 px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-all"
              />
              <button
                type="submit"
                className="w-full rounded-xl bg-[#E50914] hover:bg-[#b8070f] text-white text-xs font-bold py-2.5 transition-all shadow-[0_4px_14px_rgba(229,9,20,0.25)] cursor-pointer text-center"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Separator */}
        <div className="w-full h-px bg-neutral-900/60" />

        {/* Bottom footer bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-[11px] font-semibold text-neutral-500">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-2">
            <span>&copy; {new Date().getFullYear()} HodorFlix. All rights reserved.</span>
            <Link href="#" className="hover:text-neutral-350 transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-neutral-350 transition-colors">
              Terms of Service
            </Link>
            <span>Contact: support@hodorflix.com</span>
          </div>

          {/* Back to Top */}
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 hover:text-white hover:border-[#E50914]/40 hover:bg-[#E50914]/5 transition-all cursor-pointer text-neutral-400 border border-neutral-800 bg-neutral-900/20 px-4 py-2 rounded-full"
          >
            <span>Back to Top</span>
            <ArrowUp size={12} />
          </button>
        </div>
      </div>
    </footer>
  );
}
