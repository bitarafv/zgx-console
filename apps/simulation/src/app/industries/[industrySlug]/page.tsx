import { notFound, redirect } from "next/navigation";
import { getIndustry, industries } from "@/data/catalog";

export function generateStaticParams() { return industries.map((industry) => ({ industrySlug: industry.slug })); }
export default async function LegacyIndustryPage({ params }: { params: Promise<{ industrySlug: string }> }) {
  const { industrySlug } = await params; if (!getIndustry(industrySlug)) notFound(); redirect(`/nano/${industrySlug}`);
}
