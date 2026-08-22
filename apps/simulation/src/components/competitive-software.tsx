import { ExternalLink, Scale } from "lucide-react";
import { getCompetitiveLandscape } from "@/data/technology";
import type { Demo } from "@/lib/types";

export function CompetitiveSoftware({ demo }: { demo: Demo }) {
  const landscape = getCompetitiveLandscape(demo.slug, demo.archetype);
  return <section className="panel rounded-3xl p-7"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-blue-500/10 text-blue-500"><Scale size={19}/></span><div><h2 className="text-xl font-black">Competitive software</h2><p className="muted mt-1 text-xs">{landscape.category}</p></div></div>
    <div className="mt-6 grid gap-3 md:grid-cols-2">{landscape.products.map((item)=><article key={item.name} className="rounded-2xl border border-[var(--line)] p-5"><div className="flex items-start justify-between gap-3"><h3 className="font-black">{item.name}</h3><a href={item.sourceUrl} target="_blank" rel="noreferrer" aria-label={`View ${item.name} product source`} className="muted"><ExternalLink size={15}/></a></div><p className="muted mt-3 text-sm leading-6">{item.capabilities.join(" · ")}</p><dl className="mt-4 space-y-2 text-xs"><div className="flex justify-between gap-3"><dt className="muted">Deployment</dt><dd className="text-right font-bold">{item.deployment}</dd></div><div className="flex justify-between gap-3"><dt className="muted">Notable focus</dt><dd className="max-w-[65%] text-right font-bold">{item.differentiator}</dd></div></dl></article>)}</div>
    <div className="mt-5 rounded-2xl bg-blue-500/6 p-5"><p className="eyebrow">Typical market range</p><p className="mt-2 text-2xl font-black">{landscape.priceRange} <span className="muted text-sm font-semibold">{landscape.currency}</span></p><p className="muted mt-1 text-sm">{landscape.pricingBasis}</p></div>
    <p className="muted mt-4 text-xs leading-5">Category estimate reviewed {landscape.reviewedAt}. Public packaging and enterprise agreements vary. Implementation, integration, usage, support, and negotiated contract costs may not be included. This is not a vendor quote or total-cost-of-ownership analysis.</p>
  </section>;
}
