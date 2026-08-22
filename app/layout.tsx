import type { Metadata } from "next";
import "./globals.css";
import "./insights.css";

export const metadata: Metadata = {
  title: "ZGX Console",
  description: "Explore, operate, learn, and compare AI on ZGX hardware.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}

