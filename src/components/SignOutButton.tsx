"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="px-3 py-1.5 rounded-md text-sm text-neutral-300 hover:text-white hover:bg-neutral-800 transition"
    >
      Sign out
    </button>
  );
}
