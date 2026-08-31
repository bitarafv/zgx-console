import type { Metadata } from "next";
import "./globals.css";
import "./insights.css";
import "./enterprise-guide.css";
import "./workload-problem-tooltip.css";

export const metadata: Metadata = {
  title: "ZGX Console",
  applicationName: "ZGX Console",
  description: "Explore, operate, learn, and compare AI on ZGX hardware.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-theme="light" suppressHydrationWarning><body>{children}</body></html>;
}
