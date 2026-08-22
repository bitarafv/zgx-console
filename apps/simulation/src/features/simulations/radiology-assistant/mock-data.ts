export type Disposition = "pending" | "confirmed" | "rejected" | "uncertain";
export type AiStatus = "queued" | "attention" | "clear" | "error";

export interface Finding {
  id: string;
  name: string;
  location: string;
  laterality: string;
  priority: "Urgent" | "Routine";
  confidence: string;
  evidence: string;
  suggestion: string;
  cautiousSuggestion: string;
  box: { left: number; top: number; width: number; height: number };
}

export interface Study {
  id: string;
  patient: string;
  ageSex: string;
  accession: string;
  modality: "DX";
  exam: string;
  priority: "STAT" | "Routine";
  time: string;
  indication: string;
  comparison: string;
  aiStatus: AiStatus;
  finding?: Finding;
}

export const studies: Study[] = [
  { id: "study-urgent", patient: "Morgan, Avery", ageSex: "67 / F", accession: "SYN-260818-041", modality: "DX", exam: "Chest 1 view", priority: "STAT", time: "08:42", indication: "Acute dyspnea; portable examination.", comparison: "Synthetic prior · 2 days earlier", aiStatus: "queued", finding: { id: "right-opacity", name: "Suspected focal airspace opacity", location: "Upper lung zone", laterality: "Right", priority: "Urgent", confidence: "High attention · 0.87", evidence: "Scripted asymmetric density in the right upper lung zone on the synthetic frontal view.", suggestion: "New focal right upper lung airspace opacity.", cautiousSuggestion: "Subtle right upper lung opacity is indeterminate; correlate clinically and consider follow-up imaging.", box: { left: 59, top: 25, width: 18, height: 20 } } },
  { id: "study-routine", patient: "Lee, Jordan", ageSex: "52 / M", accession: "SYN-260818-055", modality: "DX", exam: "Chest 2 views", priority: "Routine", time: "09:06", indication: "Persistent cough.", comparison: "No synthetic prior available", aiStatus: "attention", finding: { id: "left-blunting", name: "Suspected mild costophrenic blunting", location: "Costophrenic angle", laterality: "Left", priority: "Routine", confidence: "Moderate attention · 0.64", evidence: "Scripted mild blunting at the left lateral costophrenic angle.", suggestion: "Mild left costophrenic angle blunting, which may reflect a small pleural effusion.", cautiousSuggestion: "Minimal left costophrenic angle blunting is equivocal.", box: { left: 22, top: 69, width: 15, height: 13 } } },
  { id: "study-clear", patient: "Patel, Riley", ageSex: "39 / X", accession: "SYN-260818-063", modality: "DX", exam: "Chest 2 views", priority: "Routine", time: "09:21", indication: "Pre-employment screening.", comparison: "Synthetic prior · 1 year earlier", aiStatus: "clear" },
];

export const initialAudit = ["09:21 · Study received from simulated RIS", "09:21 · Synthetic images available"];

export const reportContext = `Original scripted context\nClinical indication: Acute dyspnea; portable examination.\nSimulated finding: asymmetric right upper lung density.\nPrior: synthetic comparison from two days earlier without this density.`;

export function buildReport(study: Study, disposition: Disposition) {
  const finding = study.finding;
  const findingText = !finding || disposition === "rejected" || disposition === "pending"
    ? "No scripted focal airspace opacity, pleural effusion, or pneumothorax included in the draft."
    : disposition === "uncertain" ? finding.cautiousSuggestion : finding.suggestion;
  const impression = !finding || disposition === "rejected" || disposition === "pending"
    ? "No simulated acute cardiopulmonary finding."
    : disposition === "uncertain" ? `Indeterminate ${finding.laterality.toLowerCase()} ${finding.location.toLowerCase()} opacity. Radiologist correlation required.` : finding.suggestion;
  return `Draft for radiologist review — simulated content\n\nEXAMINATION\n${study.exam}\n\nCLINICAL INDICATION\n${study.indication}\n\nTECHNIQUE\nSynthetic frontal chest radiograph.\n\nCOMPARISON\n${study.comparison}.\n\nFINDINGS\n${findingText}\n\nIMPRESSION\n${impression}`;
}
