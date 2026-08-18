"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Incorrect email/password, or the account is blocked.");
        setLoading(false);
        return;
      }

      window.location.href = "/dashboard";
    } catch {
      setError("Incorrect email/password, or the account is blocked.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-8 rounded-2xl border border-neutral-800/80 bg-neutral-900/35 backdrop-blur-xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)]">
      <h1 className="font-serif text-3xl font-normal text-white mb-2">Login</h1>
      <p className="text-neutral-400 text-sm mb-8 font-medium">
        Sign back into your HodorFlix account.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5 block">Email Address</label>
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
            placeholder="Password"
          />
        </div>

        {error && <p className="text-xs font-semibold text-red-500 mt-1">{error}</p>}

        <button
          disabled={loading}
          className="w-full rounded-lg bg-[#E50914] hover:bg-[#b8070f] disabled:opacity-60 text-white font-bold py-3.5 transition-all shadow-[0_4px_20px_rgba(229,9,20,0.35)] cursor-pointer"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="text-sm text-neutral-400 mt-6 font-medium">
        No account?{" "}
        <Link href="/register" className="text-[#E50914] hover:text-red-400 hover:underline font-semibold transition-colors">
          Sign up
        </Link>
      </p>

      <div className="mt-8 p-4 rounded-xl border border-neutral-800/80 bg-neutral-950/30 text-xs text-neutral-400 leading-relaxed">
        <span className="font-bold text-white block mb-1">Super Admin Demo Credentials</span>
        Email: <b className="text-neutral-200">admin@platform.com</b><br />
        Password: <b className="text-neutral-200">Admin@123</b>
      </div>
    </div>
  );
}
