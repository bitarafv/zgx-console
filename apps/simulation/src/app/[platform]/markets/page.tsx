import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { isPlatform, markets, platformIndustries } from "@/data/catalog";
import { PlatformSelectionSync } from "@/components/platform-selection-sync";

export function generateStaticParams() { return [{ platform: "nano" }, { platform: "fury" }]; }
export default async function PlatformMarketsPage({ params }: { params: Promise<{ platform: string }> }) {
  const { platform: value } = await params; if (!isPlatform(value)) notFound();
  const platform = value; const industries = platformIndustries[platform];
  return <div className="shell pt-10"><PlatformSelectionSync platform={platform}/><p className="eyebrow">ZGX {platform === "nano" ? "Nano" : "Fury"} solution landscape</p><div className="mt-2 flex flex-col justify-between gap-2 sm:flex-row sm:items-end"><h1 className="text-3xl font-black tracking-[-.035em]">Solutions by market</h1><p className="muted text-sm">{platform === "nano" ? "Focused local AI experiences." : "Departmental production AI experiences."}</p></div>
    <div className="mt-9 grid gap-8 lg:grid-cols-2">{markets.map((market) => <section key={market} className="relative overflow-hidden rounded-[1.75rem] border border-[var(--line)] bg-[var(--panel)]/45 p-5 md:p-6"><div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/60 to-transparent"/><div className="mb-4 flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-blue-500/10 text-blue-500">{market === "Commercial" ? "◫" : "◆"}</span><div><h2 className="text-xl font-black">{market}</h2><p className="muted text-xs">{industries.filter((item) => item.market === market && item.demos.length).length} industries</p></div></div>
      <div className="divide-y divide-[var(--line)]">{industries.filter((item) => item.market === market && item.demos.length).map((industry) => <Link href={`/${platform}/${industry.slug}`} key={industry.slug} className="group relative block py-5"><div className="flex items-center gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--bg)] text-xl" style={{ color: industry.accent }}>{industry.icon}</span><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{industry.name}</h3><ArrowUpRight size={17}/></div><p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-blue-500">{industry.demos.length} experiences</p><p className="industry-description muted mt-0 max-h-0 overflow-hidden text-sm leading-5 opacity-0 transition-all duration-300 group-hover:mt-2 group-hover:max-h-20 group-hover:opacity-100 group-focus-visible:mt-2 group-focus-visible:max-h-20 group-focus-visible:opacity-100 max-lg:mt-2 max-lg:max-h-20 max-lg:opacity-100">{industry.description}</p></div></div></Link>)}</div>
    </section>)}</div></div>;
}
