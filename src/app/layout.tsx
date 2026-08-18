import type { Metadata } from "next";
import { Lora, Outfit } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import LayoutClient from "@/components/LayoutClient";
import { auth } from "@/auth";

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  weight: ["400", "500", "600", "700"],
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "HodorFlix - Unlimited Courses, Skills & Learning Resources",
  description: "Watch thousands of blockbuster movies, trending series, exclusive originals, anime, documentaries, and live sports — all in one place.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let session = null;
  try {
    session = await auth();
  } catch {
    session = null;
  }

  return (
    <html lang="en" className="h-full antialiased">
      <body className={`${lora.variable} ${outfit.variable} min-h-full flex flex-col bg-neutral-950 text-neutral-100 font-sans`}>
        <Providers session={session}>
          <LayoutClient session={session}>
            {children}
          </LayoutClient>
        </Providers>
      </body>
    </html>
  );
}
