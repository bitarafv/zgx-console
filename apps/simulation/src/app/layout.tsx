import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/components/app-provider";

export const metadata: Metadata = { title: { default: "ZGX Experiences", template: "%s | ZGX Experiences" }, description: "An interactive, simulated AI solution showcase." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-theme="light" suppressHydrationWarning><body><AppProvider><main>{children}</main><footer className="shell mt-24 flex flex-col gap-3 border-t border-[var(--line)] py-8 text-xs text-[var(--muted)] sm:flex-row sm:justify-between"><span>ZGX Experiences · Interactive solution explorer</span><span>Illustrative simulation · No real AI inference</span></footer></AppProvider></body></html>;
}
