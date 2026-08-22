import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getPlatformIndustry, isPlatform, platformIndustries } from "@/data/catalog";
import { PlatformSelectionSync } from "@/components/platform-selection-sync";

export function generateStaticParams() { return (["nano", "fury"] as const).flatMap((platform) => platformIndustries[platform].filter((industry) => industry.demos.length).map((industry) => ({ platform, industrySlug: industry.slug }))); }
export default async function PlatformIndustryPage({ params }: { params: Promise<{ platform: string; industrySlug: string }> }) {
  const { platform: value, industrySlug } = await params; if (!isPlatform(value)) notFound(); const platform = value;
  const industry = getPlatformIndustry(platform, industrySlug); if (!industry || !industry.demos.length) notFound();
  return <div className="shell pt-9"><PlatformSelectionSync platform={platform}/><Link href={`/${platform}/markets`} className="muted inline-flex items-center gap-2 text-sm font-bold"><ArrowLeft size={16}/> All markets</Link>
    <section className="mt-7"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="eyebrow">ZGX {platform === "nano" ? "Nano" : "Fury"} / {industry.name}</p><h1 className="mt-2 text-3xl font-black tracking-[-.035em]">Available experiences</h1></div><span className="muted text-sm">{industry.demos.length} demonstrations</span></div><div className="mt-5 grid gap-4 md:grid-cols-2">{industry.demos.map((demo, index) => <Link href={`/${platform}/${industry.slug}/${demo.slug}`} key={demo.slug} className="panel group rounded-2xl p-6 transition hover:-translate-y-1 hover:border-blue-500/50"><div className="flex items-center justify-between"><span className="rounded-full bg-blue-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-500">{demo.archetype}</span><span className="muted text-xs">{String(index + 1).padStart(2, "0")}</span></div><h2 className="mt-7 text-xl font-black">{demo.name}</h2><p className="muted mt-2 text-sm leading-6">{demo.value}</p><p className="mt-4 text-xs font-semibold leading-5 text-[var(--text)]/75">{demo.experienceScope?.[platform]}</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-blue-500">Launch simulation <ArrowRight size={16} className="transition group-hover:translate-x-1"/></span></Link>)}</div></section>
  </div>;
}
