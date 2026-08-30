"use client";

import { DemoAccessModal } from "./DemoAccessModal";
import { useRouter } from "next/navigation";

export function BookingPageClient({ workloadId, workloadName }: { workloadId: string; workloadName: string }) {
  const router = useRouter();
  return <DemoAccessModal
    workloadId={workloadId}
    workloadName={workloadName}
    onClose={() => {
      if (window.history.length > 1) router.back();
      else router.push("/");
    }}
  />;
}
