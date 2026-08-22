import type { CompetitiveLandscape, DiscussionGuide, WorkloadStack } from "@/lib/types";

const reviewedAt = "2026-08-18";

export const discussion: DiscussionGuide = {
  personas: ["Chief Risk Officer", "Portfolio Risk Analyst", "Credit Risk Lead", "Insurance CIO", "Treasury Leader"],
  questions: [
    "Which approved risk engine produces your authoritative VaR and stress results today?",
    "Where do analysts lose time between an overnight alert and committee-ready evidence?",
    "Which policies, reports, and approvals must remain inside your controlled environment?",
    "What latency and concurrency would a focused pilot need to demonstrate?",
  ],
  painPoints: ["Fragmented risk evidence", "Manual scenario-to-memo handoffs", "Opaque alert explanations", "Sensitive portfolio data boundaries"],
  objections: [
    { objection: "Can the copilot calculate or approve risk?", response: "No. Validated deterministic engines calculate metrics; the copilot only retrieves, explains, compares, and drafts for human review." },
    { objection: "Does fitting in memory guarantee performance?", response: "No. Quantization, context, KV cache, portfolio scale, concurrency, and latency targets must be benchmarked." },
    { objection: "Is this production-ready financial modeling?", response: "No. The demonstration uses simplified fictional calculations. Production models require independent validation, controls, and governance." },
  ],
  outcomes: ["Faster alert investigation", "Traceable cited explanations", "Repeatable committee briefings", "Human-controlled escalation"],
  nextStep: "Run a bounded proof of concept using de-identified portfolio extracts, approved policy documents, and outputs from the customer’s validated risk engine.",
};

export const competitive: CompetitiveLandscape = {
  category: "Institutional portfolio risk and governance analytics",
  priceRange: "Contact sales",
  pricingBasis: "Enterprise license, modules, data, users, and implementation",
  currency: "USD",
  reviewedAt,
  products: [
    { name: "Bloomberg MARS", capabilities: ["Multi-asset portfolio analytics", "Market and counterparty risk", "Scenario analysis and stress testing"], deployment: "Bloomberg Terminal and MARS API", differentiator: "Integrated Bloomberg market data, pricing, and broad asset coverage", sourceUrl: "https://professional.bloomberg.com/products/risk/mars/" },
    { name: "SAS Risk Management / Viya", capabilities: ["Enterprise stress testing", "Credit and liquidity risk", "Model governance and reporting"], deployment: "Cloud or private deployment", differentiator: "Governed analytics lifecycle with configurable risk workflows", sourceUrl: "https://www.sas.com/en_us/solutions/risk-management.html" },
    { name: "Moody's Credit Portfolio Management", capabilities: ["Credit concentration", "Scenario loss analysis", "Limits and early warning"], deployment: "Enterprise SaaS", differentiator: "Credit data, models, portfolio steering, and committee reporting", sourceUrl: "https://www.moodys.com/web/en/us/solutions/portfolio-management/credit-portfolio-management.html" },
    { name: "IBM OpenPages", capabilities: ["GRC workflows", "Risk and control monitoring", "Audit and policy traceability"], deployment: "Any cloud or on-premises", differentiator: "Modular governance workflow, configurable controls, and embedded AI", sourceUrl: "https://www.ibm.com/products/openpages" },
    { name: "MSCI BarraOne", capabilities: ["Holdings-based multi-asset risk", "VaR and stress testing", "Risk and performance attribution"], deployment: "Enterprise platform with data and API integrations", differentiator: "Unified factor-based risk, attribution, what-if, and reporting", sourceUrl: "https://www.msci.com/data-and-analytics/portfolio-management/barra-one" },
    { name: "MSCI AI Portfolio Insights", capabilities: ["Plain-language portfolio questions", "Risk-driver narratives", "Anomaly and limit monitoring"], deployment: "Cloud-enabled warehouse and connected client workflows", differentiator: "AI-assisted analysis grounded in calculated portfolio analytics", sourceUrl: "https://www.msci.com/our-solutions/analytics/risk-management/ai-portfolio-insights/" },
  ],
};

export const workload: WorkloadStack = {
  archetype: "analytics",
  reviewedAt,
  layers: [
    "Institutional risk workspace and human approval controls",
    "TypeScript or Python deterministic risk adapter; DuckDB/Polars local analytics",
    "Local hybrid retrieval, citations, policy controls, and audit logging",
    "Quantized 14B–32B language model for explanation and drafting only",
    "Compact embedding model with optional reranker",
  ],
  models: [
    { name: "Qwen 3 14B–32B or comparable", category: "Quantized language model", sizing: "Approximately 10–24 GB at 4–6 bit plus runtime buffers", role: "Explain validated outputs and draft cited committee material" },
    { name: "BGE-M3 / NV-Embed class", category: "Embedding model", sizing: "Approximately 1–3 GB", role: "Retrieve fictional policy and risk-report evidence" },
    { name: "Compact BGE reranker", category: "Optional reranker", sizing: "Approximately 1–2 GB", role: "Improve evidence ordering before generation" },
  ],
  fit: {
    nano: [
      "Illustrative memory budget: 24 GB language-model weights; 3 GB embedding/reranking; 12 GB KV cache and context; 4 GB indexes and portfolio data; 10 GB analytical engine; 15 GB runtime overhead; 30 GB OS/application headroom — about 98 GB total of 128 GB coherent unified memory.",
      "The deterministic engine—not the language model—calculates VaR, expected shortfall, stress impact, limits, concentration, counterparty exposure, and liquidity effects.",
      "Model fit does not guarantee acceptable latency. Long context, KV cache, portfolio size, and concurrent users materially affect throughput.",
    ],
    fury: [
      "Additional accelerator and coherent-memory headroom can support larger contexts, models, indexes, and concurrent requests.",
      "Actual capacity and latency still require workload-specific benchmarking.",
      "Production financial-risk calculations require independent validation; the copilot cannot replace approved engines or human oversight.",
    ],
  },
};
