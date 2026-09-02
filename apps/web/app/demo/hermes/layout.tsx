import type { Metadata } from "next";

export const metadata: Metadata = { title: "Hermes Browser TUI Demo | ZGX Console" };

export default function HermesDemoLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
