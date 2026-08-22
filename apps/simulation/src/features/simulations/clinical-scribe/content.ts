import type { CompetitiveLandscape, DiscussionGuide, WorkloadStack } from "@/lib/types";

export const researchDate = "2026-08-18";

export const competitive: CompetitiveLandscape = {
  category: "Ambient clinical documentation",
  priceRange: "$0–$180+",
  pricingBasis: "per clinician / month; enterprise vendors commonly require sales contact",
  currency: "USD",
  reviewedAt: researchDate,
  products: [
    { name: "Heidi", capabilities: ["Ambient transcription", "Standard and custom note templates", "Editable notes", "Evidence answers with citations"], deployment: "Cloud SaaS; individual, practice, and enterprise plans", differentiator: "Simple record-to-draft workflow with extensive template personalization; Free $0, Clinician $110, Practice $180 per user/month, Enterprise custom", sourceUrl: "https://www.heidihealth.com/en-us/pricing" },
    { name: "Abridge", capabilities: ["Ambient capture", "EHR-integrated draft notes", "Linked Evidence from note to transcript", "Clinician review"], deployment: "Enterprise cloud integrated with EHR workflows", differentiator: "Traceable note-to-source workflow through Linked Evidence; contact sales", sourceUrl: "https://www.abridge.com/product" },
    { name: "Nabla Copilot", capabilities: ["Ambient encounter capture", "Clinical notes in seconds", "Template customization", "Review and editing"], deployment: "Cloud SaaS and enterprise integrations", differentiator: "Fast, specialty-aware ambient documentation; contact sales", sourceUrl: "https://www.nabla.com/copilot" },
    { name: "Microsoft Dragon Copilot", capabilities: ["Ambient capture and dictation", "Specialty-specific templates", "Draft documentation", "EHR embedding and review"], deployment: "Enterprise cloud; standalone and embedded experiences", differentiator: "Broad voice, ambient, and Microsoft healthcare workflow integration; per-user or flex consumption licensing, contact sales", sourceUrl: "https://www.microsoft.com/en-us/health-solutions/clinical-workflow/dragon-copilot" },
  ],
};

export const discussion: DiscussionGuide = {
  personas: ["Chief Medical Information Officer", "Clinical Documentation Leader", "Primary Care Physician", "Privacy and Security Leader"],
  questions: ["Where should encounter audio, transcripts, and drafts be processed and retained?", "Which note templates and EHR workflows must a pilot support?", "How will clinicians verify, edit, and approve every draft?", "What latency and accuracy thresholds would make a bounded evaluation useful?"],
  painPoints: ["After-hours documentation burden", "Inconsistent note structure", "Loss of patient attention during manual charting", "Governance concerns around sensitive encounter data"],
  objections: [
    { objection: "Could the draft invent clinical findings?", response: "Constrain generation to the encounter, expose the transcript, explicitly state missing exams, and require clinician review and approval." },
    { objection: "Does local model fit prove this will be fast enough?", response: "No. Memory fit is only a starting hypothesis; benchmark end-to-end latency, quality, thermals, concurrency, and operational overhead with the selected models." },
    { objection: "Is this a medical device or production scribe?", response: "No. This is deterministic simulated content for workflow discussion, not certified clinical software or medical advice." },
  ],
  outcomes: ["More focused patient conversations", "Reviewable structured note drafts", "Clear human accountability", "A bounded local-AI validation plan"],
  nextStep: "Run a governed proof of concept with synthetic encounters, approved templates, clinician-defined quality criteria, and measured end-to-end performance.",
};

export const workload: WorkloadStack = {
  archetype: "copilot",
  layers: ["Consent-aware encounter UI and local audio buffer", "Whisper-family speech recognition", "Speaker segmentation / diarization", "Template and policy retrieval", "Quantized note-drafting model", "Local orchestration, audit, and review services"],
  models: [
    { name: "Whisper medium / distil-whisper", category: "Speech recognition", sizing: "~1–3 GB weights depending on model and precision", role: "Local transcription of a single encounter" },
    { name: "pyannote-style compact pipeline", category: "Speaker diarization", sizing: "~0.5–1.5 GB working budget", role: "Separate clinician and patient speech segments" },
    { name: "Llama 3.x 8B or Qwen 3 8B", category: "Language model", sizing: "~5–8 GB at 4-bit plus runtime buffers", role: "Draft a structured note from supported encounter facts" },
    { name: "BGE-small class", category: "Embedding model", sizing: "<1 GB optional", role: "Retrieve approved templates and local guidance" },
  ],
  fit: {
    nano: ["HP specifies 128 GB coherent unified LPDDR5X memory for ZGX Nano, directionally ample for this conservative single-encounter stack.", "Illustrative budget: 1–3 GB speech weights, 0.5–1.5 GB diarization, 5–8 GB quantized LLM weights, <1 GB embeddings, 4–12 GB KV cache/context, and 8–16 GB runtime/application overhead.", "This leaves substantial operating-system and contingency headroom, but actual allocation, latency, throughput, thermals, and note quality require measurement on the chosen runtime."],
    fury: ["The bounded single-encounter workflow does not require Fury-class capacity.", "Fury may be relevant for larger models, higher concurrency, or more demanding multi-service deployments after benchmarking."],
  },
  reviewedAt: researchDate,
};

export const researchSummary = [
  "Heidi: record/transcribe, generate from standard or advanced templates, then edit or use its assistant; citations apply to its Evidence capability. Public plans range from free to $180/user/month, with enterprise custom pricing.",
  "Abridge: ambient capture produces EHR-integrated drafts for clinician review; Linked Evidence connects note text back to transcript support. Pricing is contact sales.",
  "Nabla: ambient capture produces clinical notes in seconds with customizable templates and clinician review. Pricing is contact sales.",
  "Dragon Copilot: ambient recording and dictation produce draft documentation using specialty-specific/customized templates for review in standalone or embedded EHR workflows. Licensing is per-user or flex/consumption; purchase pricing is sales-led.",
];
