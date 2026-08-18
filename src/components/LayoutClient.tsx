"use client";

import { usePathname } from "next/navigation";
import NavBar from "@/components/NavBar";
import BackgroundEffects from "@/components/BackgroundEffects";
import Footer from "@/components/Footer";

interface LayoutClientProps {
  children: React.ReactNode;
  session: { user?: { id: string; name?: string | null; email?: string | null; role?: string } } | null;
}

export default function LayoutClient({ children, session }: LayoutClientProps) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  return (
    <div className="relative min-h-screen flex flex-col bg-[#0F0F0F]">
      <BackgroundEffects />
      
      {!isLanding && <NavBar session={session} />}
      
      <main className={`relative z-10 flex-1 w-full px-0 ${isLanding ? "py-0" : "py-6"}`}>
        {children}
      </main>

      <Footer />
    </div>
  );
}
