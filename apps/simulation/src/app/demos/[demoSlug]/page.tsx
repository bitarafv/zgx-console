import { notFound, redirect } from "next/navigation";
import { getDemo, industries } from "@/data/catalog";

export function generateStaticParams() { return industries.flatMap((industry) => industry.demos).map((demo) => ({ demoSlug: demo.slug })); }
export default async function LegacyDemoPage({ params }: { params: Promise<{ demoSlug: string }> }) {
  const { demoSlug } = await params; const demo = getDemo(demoSlug); if (!demo) notFound();
  const industry = industries.find((item) => item.name === demo.industry); if (!industry) notFound();
  redirect(`/nano/${industry.slug}/${demo.slug}`);
}
