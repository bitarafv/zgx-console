"use client";

import { CircleHelp } from "lucide-react";

const PROBLEM_STATEMENTS: Record<string, string> = {
  noteai: "For clinicians and care teams facing documentation burden after every encounter. It turns one consultation at a time into reviewable, evidence-linked notes, with the potential to return documentation time across an entire clinical service.",
  scribeai: "For professionals and care teams who lose hours replaying long recordings. It converts each recording into speaker-aware, reviewable text and can scale from individual sessions to recurring organization-wide transcription workflows.",
  dietplan: "For consumers, dietitians, and wellness teams navigating opaque food labels. It makes product nutrition understandable at the point of choice and can support repeated daily decisions across a household or served population.",
  dossierai: "For researchers, investigators, and analysts overwhelmed by large document collections. It turns scattered evidence into searchable, cited dossiers and can scale from one case to repeatable review workflows across a team.",
  "rag-legal-auditor": "For legal, procurement, and compliance teams whose manual clause review creates delay and inconsistency. It applies policy-aware retrieval and citation checks to individual agreements, with impact that can extend across an enterprise contract portfolio.",
  "aml-fraud-agent": "For financial-crime investigators screening high transaction volumes and complex entity relationships. It prioritizes suspicious activity and prepares reviewable case evidence, scaling from a transaction batch to institution-wide investigation queues.",
  "customer-support-router": "For support organizations slowed by misrouted tickets and fragmented account context. It combines SLA-aware routing with grounded troubleshooting, improving flow from one request through high-volume enterprise support queues.",
  "qwen-dev": "For developers who need private AI experimentation without cloud dependency or repeated environment setup. It provides a reusable local coding and inference workspace that can accelerate prototypes from one engineer to a development team.",
  hermes: "For operators who need a governed local agent across approved tools and channels. It centralizes reusable on-device inference for individual tasks while providing a controlled foundation for broader operational automation.",
};

export function WorkloadProblemTooltip({ workloadId, name, description }: { workloadId: string; name: string; description: string }) {
  const statement = PROBLEM_STATEMENTS[workloadId] ?? `For teams affected by the problem described by ${name}. The application addresses the immediate workflow and is designed to extend from individual use to repeatable team operations. ${description}`;
  const id = `problem-${workloadId}`;
  return <button type="button" className="workload-problem-help" aria-label={`Problem solved by ${name}`} aria-describedby={id} onKeyDown={event => { if (event.key === "Escape") event.currentTarget.blur(); }}><CircleHelp size={15}/><span role="tooltip" id={id}>{statement}</span></button>;
}
