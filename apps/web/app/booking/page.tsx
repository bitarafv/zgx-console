import { BookingPageClient } from "@/components/BookingPageClient";

export default async function BookingPage({ searchParams }: { searchParams: Promise<{ workloadId?: string; workloadName?: string }> }) {
  const params = await searchParams;
  const workloadId = params.workloadId?.trim().slice(0, 100) || "demo";
  const workloadName = params.workloadName?.trim().slice(0, 160) || "Demo application";
  return <BookingPageClient workloadId={workloadId} workloadName={workloadName}/>;
}
