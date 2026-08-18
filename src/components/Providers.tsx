"use client";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
  session?: unknown;
}) {
  return <>{children}</>;
}
