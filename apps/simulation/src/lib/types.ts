export type Platform = "nano" | "fury";
export type Market = "Commercial" | "Public Sector";
export type Archetype =
  | "copilot"
  | "documents"
  | "vision"
  | "research"
  | "workflow"
  | "developer"
  | "analytics";

export interface Demo {
  slug: string;
  name: string;
  industry: string;
  archetype: Archetype;
  problem: string;
  value: string;
  workload: string;
  concurrency: "Individual" | "Small team" | "Department" | "Enterprise";
  dataSize: "Small" | "Medium" | "Large";
  prompts: string[];
  outcomes: string[];
  personas: string[];
  questions: string[];
  painPoints: string[];
  objections: { objection: string; response: string }[];
  platforms: Platform[];
  experienceScope?: Partial<Record<Platform, string>>;
}

export interface Industry {
  slug: string;
  name: string;
  market: Market;
  icon: string;
  description: string;
  accent: string;
  demos: Demo[];
}

export interface Selection {
  platform: Platform;
}

export interface HardwareProfile {
  platform: Platform;
  name: string;
  positioning: string;
  superchip: string;
  cpuMemory: string;
  gpuMemory: string;
  memoryBandwidth: string;
  operatingSystem: string;
  software: string[];
  limitations: string[];
  sourceUrl: string;
  reviewedAt: string;
}

export interface ModelExample {
  name: string;
  category: string;
  sizing: string;
  role: string;
}

export interface WorkloadStack {
  archetype: Archetype;
  layers: string[];
  models: ModelExample[];
  fit: Record<Platform, string[]>;
  reviewedAt: string;
}

export interface CompetitiveProduct {
  name: string;
  capabilities: string[];
  deployment: string;
  differentiator: string;
  sourceUrl: string;
}

export interface CompetitiveLandscape {
  category: string;
  priceRange: string;
  pricingBasis: string;
  currency: string;
  products: CompetitiveProduct[];
  reviewedAt: string;
}

export interface DiscussionGuide {
  personas: string[];
  questions: string[];
  painPoints: string[];
  objections: { objection: string; response: string }[];
  outcomes: string[];
  nextStep: string;
}
