"use client";

import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { useApp } from "./app-provider";

export function Header() {
  const { selection, theme, toggleTheme } = useApp();
  return <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[color:var(--bg)]/80 backdrop-blur-xl">
    <div className="shell flex h-16 items-center gap-4">
      <Link href="/" className="flex items-center gap-3 font-black tracking-tight"><span className="grid size-8 place-items-center rounded-lg bg-blue-600 text-xs text-white">ZGX</span><span className="hidden sm:inline">DEMO DISPLAY</span></Link>
      <nav className="ml-auto hidden items-center gap-6 text-sm font-semibold md:flex"><Link href={selection ? `/${selection.platform}/markets` : "/"}>Solutions</Link><Link href="/discussion">Discussion</Link><Link href="/about">About</Link></nav>
      <Link href="/discussion" className="ml-auto text-xs font-bold md:hidden">Discussion</Link>
      {selection && <Link href="/" className="rounded-full border border-[var(--line)] px-3 py-1.5 text-xs font-bold md:ml-4">ZGX {selection.platform === "nano" ? "Nano" : "Fury"}</Link>}
      <button aria-label="Toggle theme" onClick={toggleTheme} className="grid size-9 place-items-center rounded-full border border-[var(--line)]">{theme === "dark" ? <Sun size={16}/> : <Moon size={16}/>}</button>
    </div>
  </header>;
}
