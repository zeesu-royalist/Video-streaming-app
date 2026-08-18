"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Film, FileText, LayoutDashboard, Shield, Menu, X, ArrowRight, Search } from "lucide-react";
import Button from "./Button";

interface NavBarProps {
  session: { user?: { id: string; name?: string | null; email?: string | null; role?: string } } | null;
}

export default function NavBar({ session }: NavBarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const isSearchablePage = pathname.startsWith("/videos") || pathname.startsWith("/documents");
      const query = isSearchablePage ? (params.get("q") || "") : "";
      const timer = setTimeout(() => {
        setSearchQuery((prev) => (prev !== query ? query : prev));
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    const isDocs = pathname.startsWith("/documents");
    const targetBase = isDocs ? "/documents" : "/videos";

    if (query) {
      router.push(`${targetBase}?q=${encodeURIComponent(query)}`);
    } else {
      router.push(targetBase);
    }
    setMobileMenuOpen(false);
  };

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Videos", href: "/videos", icon: Film },
    { name: "Documents", href: "/documents", icon: FileText },
  ];

  const items = [...navItems];
  if (session?.user) {
    items.push({ name: "My List", href: "/dashboard", icon: LayoutDashboard });
  }
  if (session?.user?.role === "SUPER_ADMIN") {
    items.push({ name: "Admin", href: "/admin", icon: Shield });
  }

  const initial = session?.user?.name?.trim()?.[0]?.toUpperCase() ?? "?";

  return (
    <header className="sticky top-0 left-0 right-0 z-50 border-b border-neutral-900/60 bg-[#0F0F0F]/65 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 md:px-12 h-20 flex items-center justify-between gap-3">
        {/* Left: Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/" className="text-xl md:text-2xl font-bold tracking-tight text-white select-none">
            HodorFlix<span className="text-[#E50914]">.</span>
          </Link>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1.5 px-2 py-1.5 rounded-full bg-neutral-950/40 border border-neutral-900/40 backdrop-blur-sm shadow-[0_4px_30px_rgba(0,0,0,0.2)]">
          {items.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative flex items-center gap-2.5 px-4.5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "text-white bg-neutral-900/90 border border-neutral-800 shadow-[0_2px_10px_rgba(0,0,0,0.6)]"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                <Icon
                  size={14}
                  className={isActive ? "text-[#E50914]" : "text-neutral-400 transition-colors"}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: Search, Desktop Auth, and Mobile Hamburger */}
        <div className="flex items-center gap-2 sm:gap-4.5">
          {/* Search Input - visible on both mobile and desktop */}
          <form onSubmit={handleSearch} className="relative flex items-center">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-3 sm:pl-4 pr-8 sm:pr-10 py-1.5 w-24 xs:w-32 sm:w-40 focus:w-32 xs:focus:w-44 sm:focus:w-56 transition-all duration-300 rounded-full border border-neutral-800 bg-neutral-950/50 text-[10px] sm:text-xs font-semibold text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914]/30"
            />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-[#E50914] hover:bg-[#b8070f] text-white transition-all duration-200 cursor-pointer shadow-[0_2px_6px_rgba(229,9,20,0.3)]"
            >
              <Search size={9} className="sm:hidden" />
              <Search size={11} className="hidden sm:block" />
            </button>
          </form>

          {/* Desktop Auth Section */}
          <div className="hidden lg:block">
            {session?.user ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 rounded-full border border-neutral-800/80 bg-neutral-900/30 hover:bg-neutral-900/60 hover:border-neutral-700/60 transition-all"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#E50914] to-red-700 text-[11px] font-bold text-white shadow-[0_0_8px_rgba(229,9,20,0.4)]">
                    {initial}
                  </span>
                  <span className="text-xs font-bold text-neutral-200">{session.user.name}</span>
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-xs font-bold text-neutral-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none outline-none"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-xs font-bold text-neutral-400 hover:text-white transition-colors">
                  Login
                </Link>
                <Link href="/register">
                  <Button
                    variant="outline"
                    className="group flex items-center gap-1.5 text-xs px-5 py-2.5 border-neutral-800 hover:border-neutral-700 bg-neutral-950/20"
                  >
                    <span>Sign Up</span>
                    <ArrowRight
                      size={13}
                      className="text-neutral-400 group-hover:text-white transition-transform group-hover:translate-x-0.5"
                    />
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-neutral-300 hover:text-white p-1 focus:outline-none cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-[#0F0F0F]/95 border-b border-neutral-900/80 backdrop-blur-lg overflow-hidden"
          >
            <div className="px-6 py-6 flex flex-col gap-4">
              <nav className="flex flex-col gap-2">
                {items.map((item) => {
                  const isActive =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? "text-white bg-neutral-900 border border-neutral-800"
                          : "text-neutral-400 hover:text-neutral-200"
                      }`}
                    >
                      <Icon
                        size={16}
                        className={isActive ? "text-[#E50914]" : "text-neutral-500"}
                      />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="border-t border-neutral-900 pt-4 mt-2">
                {session?.user ? (
                  <div className="flex flex-col gap-3">
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl border border-neutral-800 bg-neutral-900/20"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#E50914] to-red-700 text-xs font-bold text-white">
                        {initial}
                      </span>
                      <span className="text-sm font-semibold text-neutral-200">{session.user.name}</span>
                    </Link>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="w-full py-3.5 text-sm font-semibold text-neutral-400 hover:text-white bg-neutral-900/40 border border-neutral-800 rounded-xl transition cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-center py-2.5 text-sm font-bold text-neutral-400 hover:text-white">
                      Login
                    </Link>
                    <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="primary" className="w-full py-3.5 text-sm justify-center">
                        <span>Sign Up</span>
                        <ArrowRight size={15} />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
