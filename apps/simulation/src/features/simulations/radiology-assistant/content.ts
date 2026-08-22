import type { SimulationContent } from "../contracts";

const reviewedAt = "2026-08-18";

export const radiologyContent: SimulationContent = {
  discussion: {
    personas: ["Chief Medical Information Officer", "Radiology Chair", "PACS Administrator", "AI Governance Lead"],
    questions: ["Where are worklist priority and study-complete events managed today?", "Which findings are appropriate for notification versus prioritization?", "How are radiologist overrides audited?", "What retrospective validation and latency target would define a successful evaluation?"],
    painPoints: ["Growing study volume and uneven worklist urgency", "Context switching across PACS, RIS, AI viewers, and reporting", "Manual transfer of reviewed findings into report drafts", "Limited visibility into adoption, overrides, and workflow impact"],
    objections: [
      { objection: "Is this diagnosing the patient?", response: "No. Position the concept as scripted decision support requiring radiologist review; a real product needs validation and authorization for its specific intended use." },
      { objection: "Can one Nano support our department?", response: "This is a focused single-workstation sizing concept. Concurrency, resolution, batching, and latency must be benchmarked before capacity claims." },
    ],
    outcomes: ["Faster review of time-sensitive studies", "Fewer workflow interruptions", "Traceable radiologist confirmation and override", "Structured drafts that remain under radiologist control"],
    nextStep: "Select one bounded chest X-ray workflow, define retrospective acceptance criteria, and benchmark the full pipeline with governance and radiology stakeholders.",
  },
  competitive: {
    category: "Radiology AI workflow and reporting",
    priceRange: "Contact sales",
    pricingBasis: "Enterprise agreements; modules, volume, integration, and region vary",
    currency: "USD",
    reviewedAt,
    products: [
      { name: "Aidoc aiOS", capabilities: ["PACS-connected triage", "Results summaries", "Override tracking and analytics"], deployment: "Enterprise clinical AI platform", differentiator: "Orchestration across imaging and care workflows", sourceUrl: "https://www.aidoc.com/platform/aios/" },
      { name: "Harrison.ai CXR (formerly Annalise.ai)", capabilities: ["Worklist prioritization", "Finding localization", "Confidence presentation"], deployment: "PACS/RIS-integrated enterprise software", differentiator: "Broad scripted CXR finding coverage and synchronized viewer", sourceUrl: "https://annalise.ai/cxr/" },
      { name: "Gleamer Copilot", capabilities: ["X-ray and cross-sectional imaging assistance", "Chest and bone workflows"], deployment: "Enterprise radiology AI suite", differentiator: "Multi-modality portfolio", sourceUrl: "https://www.gleamer.ai/" },
      { name: "Viz Radiology", capabilities: ["Worklist prioritization", "PACS image review", "Care-team coordination"], deployment: "Cloud-native enterprise platform", differentiator: "Coordination around time-sensitive care pathways", sourceUrl: "https://www.viz.ai/radiology" },
      { name: "Rad AI Reporting", capabilities: ["Structured report generation", "Existing template support", "PACS/RIS/EHR workflow integration"], deployment: "Zero-footprint cloud reporting platform", differentiator: "Radiology-specialized reporting workflow", sourceUrl: "https://www.radai.com/reporting" },
    ],
  },
  workload: {
    archetype: "vision",
    layers: ["Local DICOM/RIS adapter", "Compact CXR classifier/detector", "Localization model", "Quantized report-drafting model", "Review UI and immutable audit service"],
    models: [
      { name: "DenseNet-121 / EfficientNet-class CXR model", category: "Imaging model", sizing: "~0.1–0.5 GB weights", role: "Specialized finding classification or triage experiment" },
      { name: "Compact U-Net / detection head", category: "Localization model", sizing: "~0.2–1 GB weights", role: "Attention-region mask or bounding-box localization" },
      { name: "Llama 3.x 8B-class, 4-bit", category: "Language model", sizing: "~5–7 GB weights", role: "Constrained explanation and structured draft generation" },
      { name: "BGE-small-class", category: "Embedding model", sizing: "<0.5 GB weights", role: "Optional retrieval of approved templates and prior-report text" },
    ],
    fit: {
      nano: ["Illustrative allocation: 2 GB imaging/localization weights, 8 GB quantized language weights, 10 GB tensors and activations, 8 GB KV cache/context, 20 GB runtime/framework overhead, and 36 GB OS/application headroom—about 84 GB total, leaving about 44 GB unallocated within 128 GB unified memory.", "Specialized imaging models avoid requiring a large general-purpose vision-language model for every image.", "Model fit does not guarantee target latency or throughput; image resolution, batch size, context, and concurrent users change memory and scheduling pressure."],
      fury: ["A larger workstation could provide more accelerator-local memory and concurrency headroom, but is outside this single-Nano demonstration boundary.", "Clinical deployment still requires workload-specific benchmarking, security review, validation, and operational monitoring."],
    },
    reviewedAt,
  },
};

export const hardwareNote = {
  name: "HP ZGX Nano G1n AI Station",
  specification: "NVIDIA GB10 Grace Blackwell · 128 GB coherent unified LPDDR5X · 273 GB/s",
  sourceUrl: "https://h20195.www2.hp.com/v2/getpdf.aspx/c09212373.pdf",
  disclaimer: "Educational sizing only. Regulatory clearance applies to a specific product and intended use—not a generic model or hardware platform.",
};
