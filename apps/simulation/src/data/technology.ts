import type { Archetype, CompetitiveLandscape, HardwareProfile, Platform, WorkloadStack } from "@/lib/types";

const reviewedAt = "2026-08-18";

export const hardwareProfiles: Record<Platform, HardwareProfile> = {
  nano: {
    platform: "nano",
    name: "HP ZGX Nano",
    positioning: "Local AI development, experimentation, validation, and focused inference.",
    superchip: "NVIDIA GB10 Grace Blackwell Superchip",
    cpuMemory: "128 GB coherent unified LPDDR5X",
    gpuMemory: "Shared coherent unified memory architecture",
    memoryBandwidth: "Up to 273 GB/s",
    operatingSystem: "NVIDIA DGX OS / Ubuntu 24.04",
    software: ["HP ZGX Toolkit", "NVIDIA AI Software Stack", "CUDA ecosystem", "Containerized AI runtimes"],
    limitations: ["Actual capacity depends on precision, context, cache, framework overhead, and workload design.", "Model fit does not guarantee acceptable latency or throughput."],
    sourceUrl: "https://h20195.www2.hp.com/v2/getpdf.aspx/c09212373.pdf",
    reviewedAt,
  },
  fury: {
    platform: "fury",
    name: "HP ZGX Fury",
    positioning: "Departmental-scale development and production inference for frontier-class models and concurrent users.",
    superchip: "NVIDIA GB300 Grace Blackwell Ultra Desktop Superchip",
    cpuMemory: "Up to 496 GB LPDDR5X CPU memory",
    gpuMemory: "Up to 252 GB HBM3e GPU memory; 748 GB coherent memory total",
    memoryBandwidth: "GPU up to 7.1 TB/s; CPU up to 396 GB/s",
    operatingSystem: "Ubuntu with NVIDIA AI Developer Tools",
    software: ["HP ZGX Toolkit", "NVIDIA AI Software Stack", "CUDA ecosystem", "Production inference runtimes"],
    limitations: ["Concurrent-user capacity varies by model size, quantization, context, batching, and latency target.", "Published platform capability is not a benchmark for this simulated application."],
    sourceUrl: "https://www.hp.com/us-en/workstations/ai-stations.html",
    reviewedAt,
  },
};

const baseFit: Record<Platform, string[]> = {
  nano: ["128 GB coherent memory can accommodate substantial quantized model weights while leaving working memory for inference.", "A single-user or focused-team workflow limits competing KV-cache and request overhead.", "Local execution keeps governed prompts, embeddings, and source material within the chosen environment."],
  fury: ["252 GB of high-bandwidth GPU memory supports much larger working sets and model weights close to the accelerator.", "748 GB of coherent memory provides headroom for retrieval indexes, multimodal inputs, agents, and model-serving overhead.", "The production-oriented platform is designed for concurrency, but actual user capacity must be benchmarked against latency targets."],
};

const stack = (archetype: Archetype, layers: string[], models: WorkloadStack["models"], extra: Partial<Record<Platform, string>> = {}): WorkloadStack => ({
  archetype,
  layers,
  models,
  fit: {
    nano: [...baseFit.nano, ...(extra.nano ? [extra.nano] : [])],
    fury: [...baseFit.fury, ...(extra.fury ? [extra.fury] : [])],
  },
  reviewedAt,
});

export const workloadStacks: Record<Archetype, WorkloadStack> = {
  copilot: stack("copilot", ["Application UI", "Prompt and policy layer", "Retrieval service", "Local inference runtime"], [
    { name: "Llama 3.x / Nemotron", category: "Language model", sizing: "8B–70B quantized starting range", role: "Reasoning, summarization, and response drafting" },
    { name: "Qwen 3", category: "Language model", sizing: "8B–32B quantized starting range", role: "Instruction following and multilingual assistance" },
    { name: "NVIDIA NV-Embed / BGE", category: "Embedding model", sizing: "Sub-billion parameter class", role: "Semantic retrieval from approved content" },
  ]),
  documents: stack("documents", ["Document viewer", "OCR and parsing", "Retrieval and extraction", "Local inference runtime"], [
    { name: "Qwen2.5-VL", category: "Vision-language model", sizing: "7B–32B quantized starting range", role: "Page, table, and image understanding" },
    { name: "Mistral Small", category: "Language model", sizing: "Quantized deployment", role: "Extraction, classification, and structured summaries" },
    { name: "BGE-M3", category: "Embedding model", sizing: "Compact retrieval model", role: "Multilingual document retrieval" },
  ]),
  vision: stack("vision", ["Image or video ingestion", "Detection pipeline", "Vision-language analysis", "Review workspace"], [
    { name: "YOLO family", category: "Vision model", sizing: "Task-tuned compact models", role: "Fast object or defect detection" },
    { name: "Qwen2.5-VL", category: "Vision-language model", sizing: "7B–32B quantized starting range", role: "Visual reasoning and scene explanation" },
    { name: "NVIDIA Cosmos", category: "Physical AI model family", sizing: "Workload-dependent", role: "Video and physical-world understanding experiments" },
  ], { fury: "High GPU bandwidth is valuable when image batches, video frames, and multiple review requests compete for accelerator time." }),
  research: stack("research", ["Source library", "Hybrid retrieval", "Reranking and citations", "Local reasoning model"], [
    { name: "Llama 3.x / Nemotron", category: "Language model", sizing: "8B–70B quantized starting range", role: "Evidence synthesis and cited drafting" },
    { name: "Qwen 3", category: "Language model", sizing: "14B–32B quantized starting range", role: "Long-form analysis and tool use" },
    { name: "BGE Reranker", category: "Reranking model", sizing: "Compact specialist model", role: "Improve relevance before generation" },
  ]),
  workflow: stack("workflow", ["Agent orchestration", "Tool and policy gateway", "Shared retrieval", "One or more local models"], [
    { name: "Nemotron", category: "Agentic language model", sizing: "Nano and larger variants", role: "Planning, tool use, and agent coordination" },
    { name: "Llama 3.x", category: "Language model", sizing: "8B–70B quantized starting range", role: "Specialized worker agents" },
    { name: "BGE-M3", category: "Embedding model", sizing: "Compact retrieval model", role: "Shared agent memory retrieval" },
  ], { fury: "Multiple resident models and parallel agent requests can consume memory and KV cache concurrently, making added headroom valuable." }),
  developer: stack("developer", ["Developer workspace", "Code index", "Model runtime", "Evaluation and observability"], [
    { name: "Qwen Coder", category: "Code model", sizing: "7B–32B quantized starting range", role: "Code explanation, generation, and refactoring" },
    { name: "DeepSeek Coder", category: "Code model", sizing: "7B–33B quantized starting range", role: "Repository-aware development assistance" },
    { name: "Code embeddings", category: "Embedding model", sizing: "Compact specialist model", role: "Semantic code search" },
  ]),
  analytics: stack("analytics", ["Operational data adapter", "Search and retrieval", "Analytical reasoning", "Dashboard experience"], [
    { name: "Mistral / Llama", category: "Language model", sizing: "8B–70B quantized starting range", role: "Narrative analysis and explanation" },
    { name: "Qwen 3", category: "Language model", sizing: "14B–32B quantized starting range", role: "Structured reasoning over retrieved signals" },
    { name: "BGE-M3", category: "Embedding model", sizing: "Compact retrieval model", role: "Signal and record retrieval" },
  ]),
};

const product = (name: string, capabilities: string[], deployment: string, differentiator: string, sourceUrl: string) => ({ name, capabilities, deployment, differentiator, sourceUrl });

const landscapes: Record<string, CompetitiveLandscape> = {
  clinical: { category: "Ambient clinical documentation", priceRange: "$99–$700+", pricingBasis: "per provider / month", currency: "USD", reviewedAt, products: [
    product("Microsoft Dragon Copilot", ["Ambient documentation", "Clinical workflow assistance"], "Cloud enterprise", "Microsoft healthcare and EHR ecosystem", "https://www.microsoft.com/en-us/health-solutions/clinical-workflow/dragon-copilot"),
    product("Abridge", ["Clinical note drafting", "Ambient conversation capture"], "Cloud enterprise", "Health-system workflow and evidence mapping", "https://www.abridge.com/product"),
    product("Nabla Copilot", ["Clinical notes", "Visit summaries"], "Cloud SaaS", "Clinician-focused ambient workflow", "https://www.nabla.com/copilot"),
  ]},
  radiology: { category: "Radiology AI assistance", priceRange: "$1,000–$10,000+", pricingBasis: "organization / month; often custom", currency: "USD", reviewedAt, products: [
    product("Aidoc", ["Triage", "Clinical AI workflows"], "Enterprise platform", "Broad clinical AI orchestration", "https://www.aidoc.com/ai-solutions/"),
    product("Viz.ai", ["Care coordination", "AI-powered detection workflows"], "Enterprise platform", "Workflow coordination around time-sensitive conditions", "https://www.viz.ai/"),
  ]},
  enterprise: { category: "Enterprise AI assistant", priceRange: "$20–$100+", pricingBasis: "user / month; enterprise tiers custom", currency: "USD", reviewedAt, products: [
    product("Microsoft 365 Copilot", ["Enterprise chat", "Work content assistance"], "Cloud SaaS", "Microsoft 365 integration", "https://www.microsoft.com/en-us/microsoft-365-copilot/business"),
    product("Glean", ["Enterprise search", "Knowledge assistant"], "Cloud enterprise", "Connectors and enterprise search graph", "https://www.glean.com/product/overview"),
    product("ChatGPT Enterprise", ["Enterprise chat", "Research and analysis"], "Cloud enterprise", "General-purpose multimodal workspace", "https://openai.com/chatgpt/enterprise/"),
  ]},
  document: { category: "Intelligent document processing", priceRange: "$500–$10,000+", pricingBasis: "organization / month or usage-based", currency: "USD", reviewedAt, products: [
    product("ABBYY Vantage", ["Document classification", "Data extraction"], "Cloud or enterprise", "Document skills and process automation", "https://www.abbyy.com/vantage/"),
    product("UiPath Document Understanding", ["OCR", "Extraction and validation"], "Cloud or self-managed", "Automation-platform integration", "https://www.uipath.com/product/document-understanding"),
    product("Azure AI Document Intelligence", ["OCR", "Prebuilt and custom extraction"], "Cloud usage-based", "Azure platform integration", "https://azure.microsoft.com/en-us/products/ai-services/ai-document-intelligence"),
  ]},
  vision: { category: "Computer vision quality inspection", priceRange: "$1,000–$15,000+", pricingBasis: "site / month; implementation often separate", currency: "USD", reviewedAt, products: [
    product("Landing AI", ["Visual inspection", "Vision model development"], "Cloud and edge", "Data-centric vision workflow", "https://landing.ai/landinglens"),
    product("Cognex VisionPro", ["Machine vision", "Defect inspection"], "Edge / industrial", "Industrial camera and automation ecosystem", "https://www.cognex.com/products/machine-vision/vision-software/visionpro-software"),
  ]},
  developer: { category: "AI developer assistance", priceRange: "$10–$60+", pricingBasis: "developer / month; enterprise tiers vary", currency: "USD", reviewedAt, products: [
    product("GitHub Copilot", ["Code completion", "Coding agent and chat"], "Cloud SaaS", "GitHub and IDE integration", "https://github.com/features/copilot"),
    product("Cursor", ["AI code editor", "Repository-aware assistance"], "Cloud SaaS", "AI-native editor workflow", "https://www.cursor.com/features"),
  ]},
  education: { category: "AI education assistant", priceRange: "$10–$40+", pricingBasis: "educator or user / month; institutional pricing custom", currency: "USD", reviewedAt, products: [
    product("Khanmigo", ["Guided tutoring", "Teacher tools"], "Cloud SaaS", "Khan Academy learning ecosystem", "https://www.khanmigo.ai/"),
    product("MagicSchool", ["Teacher planning", "Student learning tools"], "Cloud SaaS", "Education-specific workflow library", "https://www.magicschool.ai/"),
  ]},
  risk: { category: "AI risk analytics", priceRange: "$2,000–$25,000+", pricingBasis: "organization / month; typically custom", currency: "USD", reviewedAt, products: [
    product("SAS Viya", ["Risk analytics", "Model and decision workflows"], "Cloud or private deployment", "Established analytics and governance platform", "https://www.sas.com/en_us/software/viya.html"),
    product("DataRobot", ["Predictive AI", "AI governance and applications"], "Cloud or hybrid enterprise", "End-to-end enterprise AI lifecycle", "https://www.datarobot.com/platform/"),
  ]},
  claims: { category: "AI-assisted insurance claims", priceRange: "$5,000–$50,000+", pricingBasis: "organization / month; volume and implementation vary", currency: "USD", reviewedAt, products: [
    product("Guidewire ClaimCenter", ["Claims management", "Workflow automation"], "Cloud enterprise", "Core insurance workflow ecosystem", "https://www.guidewire.com/products/core-products/insurancesuite/claimcenter"),
    product("Shift Technology", ["Claims fraud detection", "Decision support"], "Cloud enterprise", "Insurance-focused AI decisioning", "https://www.shift-technology.com/products/claims-fraud-detection"),
  ]},
  engineering: { category: "Engineering AI copilot", priceRange: "$50–$300+", pricingBasis: "user / month; enterprise and CAD licensing vary", currency: "USD", reviewedAt, products: [
    product("Siemens Industrial Copilot", ["Industrial assistance", "Engineering workflow support"], "Enterprise industrial platform", "Siemens engineering and automation context", "https://www.siemens.com/global/en/products/automation/topic-areas/industrial-copilot.html"),
    product("Autodesk Fusion", ["Generative design", "Manufacturing and engineering workspace"], "Cloud SaaS", "Integrated CAD, CAM, and design workflows", "https://www.autodesk.com/products/fusion-360/overview"),
  ]},
  government: { category: "Digital citizen-service assistant", priceRange: "$2,000–$30,000+", pricingBasis: "organization / month; implementation typically separate", currency: "USD", reviewedAt, products: [
    product("ServiceNow Public Sector Digital Services", ["Case management", "Self-service workflows"], "Cloud enterprise", "Government workflow and service management platform", "https://www.servicenow.com/industries/public-sector.html"),
    product("Salesforce Public Sector Solutions", ["Constituent services", "Case and benefit workflows"], "Cloud enterprise", "CRM-based public-sector service platform", "https://www.salesforce.com/government/"),
  ]},
  permits: { category: "Digital permitting and plan review", priceRange: "$2,000–$25,000+", pricingBasis: "organization / month; modules and implementation vary", currency: "USD", reviewedAt, products: [
    product("OpenGov Permitting & Licensing", ["Digital permitting", "Licensing workflows"], "Cloud government SaaS", "Local-government permitting workflows", "https://opengov.com/products/permitting-licensing/"),
    product("Accela", ["Civic applications", "Permitting and licensing"], "Cloud government platform", "Broad civic-services platform", "https://www.accela.com/solutions/planning-building/"),
  ]},
  academic: { category: "AI research assistant", priceRange: "$10–$40+", pricingBasis: "researcher / month; institutional plans vary", currency: "USD", reviewedAt, products: [
    product("Elicit", ["Literature search", "Evidence extraction and synthesis"], "Cloud SaaS", "Systematic research workflow", "https://elicit.com/"),
    product("scite", ["Smart citations", "Research discovery"], "Cloud SaaS", "Citation context and supporting/contrasting evidence", "https://scite.ai/"),
  ]},
  intelligence: { category: "AI-assisted intelligence analysis", priceRange: "$10,000–$100,000+", pricingBasis: "organization / month; usually custom contract", currency: "USD", reviewedAt, products: [
    product("Palantir AIP", ["Data integration", "AI-assisted operational workflows"], "Enterprise platform", "Ontology-driven operational AI", "https://www.palantir.com/platforms/aip/"),
    product("Babel Street Insights", ["Publicly available information", "Risk and intelligence analysis"], "Enterprise platform", "Identity and open-source intelligence workflows", "https://www.babelstreet.com/products/babel-street-insights"),
  ]},
};

const landscapeKeyByDemo: Record<string, keyof typeof landscapes> = {
  "clinical-scribe": "clinical", "radiology-assistant": "radiology", "risk-analyst-copilot": "risk", "claims-assistant": "claims", "defect-detection": "vision", "engineering-copilot": "engineering", "ai-developer-workspace": "developer", "ai-lab": "developer", "intelligence-analyst": "intelligence", "citizen-services-assistant": "government", "permit-review-assistant": "permits", "research-assistant": "academic", "teacher-assistant": "education", "student-learning-assistant": "education",
  "clinical-scribe-operations": "clinical", "radiology-operations-command-center": "radiology", "risk-intelligence-center": "risk", "claims-operations-center": "claims", "multi-line-vision-operations": "vision", "engineering-digital-twin-copilot": "engineering", "ai-model-factory": "developer", "departmental-knowledge-platform": "enterprise", "multi-agent-operations-center": "enterprise", "enterprise-research-center": "enterprise", "intelligence-exploitation-center": "intelligence", "mission-planning-copilot": "intelligence",
};

const furyModelExamples: Record<Archetype, WorkloadStack["models"]> = {
  copilot: [{ name: "Qwen3-235B-A22B", category: "Large language model", sizing: "NVFP4 deployment example; runtime and context must be benchmarked", role: "Larger-model reasoning with departmental serving headroom" }],
  documents: [{ name: "Large VLM + specialist OCR pipeline", category: "Concurrent multimodal stack", sizing: "Multiple resident services; validate HBM placement and coherent-memory spill", role: "Mixed-media extraction and evidence correlation" }],
  vision: [{ name: "Parallel detector and VLM services", category: "Multi-model vision", sizing: "Several optimized models with batched streams", role: "Concurrent inspection, segmentation, and visual reasoning" }],
  research: [{ name: "Frontier-class reasoning + retrieval stack", category: "Long-context RAG", sizing: "Large quantized model with reranker and substantial KV-cache budget", role: "Concurrent evidence synthesis over large private corpora" }],
  workflow: [{ name: "Nemotron / Llama agent pool", category: "Multi-agent models", sizing: "Multiple resident planners and specialist workers", role: "Parallel planning, tool use, policy review, and synthesis" }],
  developer: [{ name: "100B+ model development target", category: "Fine-tuning and evaluation", sizing: "Workload-specific precision, optimizer, adapter, and checkpoint budgets", role: "Departmental model experimentation and production preparation" }],
  analytics: [{ name: "Large reasoning model + analytical services", category: "Concurrent analytics", sizing: "Quantized large-model starting point with portfolio working sets", role: "Scenario reasoning across multiple analyst workspaces" }],
};

export function getCompetitiveLandscape(demoSlug: string, archetype: Archetype): CompetitiveLandscape {
  const key = landscapeKeyByDemo[demoSlug] ?? (archetype === "documents" ? "document" : archetype === "vision" ? "vision" : archetype === "developer" ? "developer" : "enterprise");
  return landscapes[key];
}

export function getWorkloadStack(archetype: Archetype) { return workloadStacks[archetype]; }
export function getPlatformModelExamples(archetype: Archetype, platform: Platform) { return platform === "fury" ? [...workloadStacks[archetype].models, ...furyModelExamples[archetype]] : workloadStacks[archetype].models; }
