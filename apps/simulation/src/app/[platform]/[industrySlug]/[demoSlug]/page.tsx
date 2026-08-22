import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Target } from "lucide-react";
import { getPlatformDemo, getPlatformIndustry, isPlatform, platformIndustries } from "@/data/catalog";
import { SimulationRenderer } from "@/features/simulations/simulation-renderer";
import { TechnologyStackCard } from "@/components/technology-stack-card";
import { CompetitiveSoftware } from "@/components/competitive-software";
import { PlatformSelectionSync } from "@/components/platform-selection-sync";

export function generateStaticParams() { return (["nano", "fury"] as const).flatMap((platform) => platformIndustries[platform].flatMap((industry) => industry.demos.map((demo) => ({ platform, industrySlug: industry.slug, demoSlug: demo.slug })))); }
export default async function PlatformDemoPage({ params }: { params: Promise<{ platform: string; industrySlug: string; demoSlug: string }> }) {
  const { platform: value, industrySlug, demoSlug } = await params; if (!isPlatform(value)) notFound(); const platform = value;
  const industry = getPlatformIndustry(platform, industrySlug); const demo = getPlatformDemo(platform, industrySlug, demoSlug); if (!industry || !demo) notFound();
  return <div className="shell pt-10"><PlatformSelectionSync platform={platform}/><Link href={`/${platform}/${industry.slug}`} className="muted inline-flex items-center gap-2 text-sm font-bold"><ArrowLeft size={16}/> {demo.industry}</Link>
    <section className="grid items-end gap-8 py-10 lg:grid-cols-[1fr_340px]"><div><div className="flex flex-wrap gap-2"><span className="rounded-full bg-blue-500/10 px-3 py-1.5 text-xs font-bold text-blue-500">ZGX {platform === "nano" ? "Nano" : "Fury"}</span><span className="rounded-full border border-[var(--line)] px-3 py-1.5 text-xs font-bold">{demo.workload}</span></div><h1 className="gradient-text mt-5 text-4xl font-black tracking-[-.05em] md:text-6xl">{demo.name}</h1><p className="mt-4 max-w-2xl text-xl font-semibold leading-8">{demo.value}</p><p className="muted mt-3 max-w-2xl leading-7">{demo.problem}</p></div><div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5 text-sm leading-6"><p className="font-bold text-blue-500">Interactive simulation</p><p className="muted mt-1">Deterministic mock data only. Workflow indicators are illustrative—not hardware benchmarks.</p></div></section>
    <SimulationRenderer demo={demo} platform={platform} industrySlug={industrySlug}/>
    <div className="mt-16 grid gap-6 lg:grid-cols-[1fr_360px]"><div className="space-y-6"><section className="panel rounded-3xl p-7"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-blue-500/10 text-blue-500"><Target size={19}/></span><h2 className="text-xl font-black">Business challenge</h2></div><p className="muted mt-6 leading-7">{demo.problem} {demo.experienceScope?.[platform]}</p></section><CompetitiveSoftware demo={demo}/></div><aside><TechnologyStackCard demo={demo} platform={platform}/></aside></div>
  </div>;
}
