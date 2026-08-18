"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Registration failed");
      setLoading(false);
      return;
    }

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Account created, but login failed. Please log in manually.");
        setLoading(false);
        router.push("/login");
        return;
      }

      window.location.href = "/dashboard";
    } catch {
      setError("Account created, but automatic login failed. Please log in manually.");
      setLoading(false);
      router.push("/login");
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-8 rounded-2xl border border-neutral-800/80 bg-neutral-900/35 backdrop-blur-xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)]">
      <h1 className="font-serif text-3xl font-normal text-white mb-2">Create account</h1>
      <p className="text-neutral-400 text-sm mb-8 font-medium">
        Create a HodorFlix account to start sharing videos and documents.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5 block">Name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg bg-neutral-950/40 border border-neutral-800/80 px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-all"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5 block">Email</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg bg-neutral-950/40 border border-neutral-800/80 px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-all"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5 block">
            Password
          </label>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg bg-neutral-950/40 border border-neutral-800/80 px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-all"
            placeholder="At least 6 characters"
          />
        </div>

        {error && <p className="text-xs font-semibold text-red-500 mt-1">{error}</p>}

        <button
          disabled={loading}
          className="w-full rounded-lg bg-[#E50914] hover:bg-[#b8070f] disabled:opacity-60 text-white font-bold py-3.5 transition-all shadow-[0_4px_20px_rgba(229,9,20,0.35)] cursor-pointer"
        >
          {loading ? "Creating..." : "Create account"}
        </button>
      </form>

      <p className="text-sm text-neutral-400 mt-6 font-medium">
        Already have an account?{" "}
        <Link href="/login" className="text-[#E50914] hover:text-red-400 hover:underline font-semibold transition-colors">
          Login
        </Link>
      </p>
    </div>
  );
}
