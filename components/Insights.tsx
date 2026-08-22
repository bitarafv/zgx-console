import { ArrowRight, Bot, Building2, Layers3, WalletCards } from "lucide-react";

const sections = [
  { icon: Bot, n: "01", title: "From chat to action", text: "Move beyond answers. Ground agents in enterprise context, connect governed tools, and design workflows that complete measurable work." },
  { icon: WalletCards, n: "02", title: "The cost pressure", text: "Cloud accelerators are flexible, but sustained inference, data movement, and software licensing can turn experiments into recurring infrastructure expense." },
  { icon: Building2, n: "03", title: "Deployment requirements", text: "Evaluate privacy, latency, model fit, observability, power, availability, and operational ownership before choosing where AI runs." },
  { icon: Layers3, n: "04", title: "Choose the right tier", text: "Match individual exploration, team development, and production workloads to the smallest platform that meets memory, throughput, and governance needs." },
];

export function Insights() {
  return <><div className="hero compact"><div><p className="eyebrow">ENTERPRISE AI INSIGHTS</p><h1>Turn AI ambition into <span>operational value</span></h1><p>A structured guide to the choices between an idea and a dependable enterprise deployment.</p></div></div><div className="insight-grid">{sections.map((section) => <article key={section.n}><section.icon /><span>{section.n}</span><h2>{section.title}</h2><p>{section.text}</p><button disabled>Presentation material coming soon <ArrowRight size={15} /></button></article>)}</div><div className="content-note"><strong>Content import pending</strong><p>These sections are publication-safe placeholders. Enterprise slides will be converted into native web content only after permission and source review.</p></div></>;
}

