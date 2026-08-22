export type TemplateId = "soap" | "general" | "problem";

export interface TranscriptLine {
  at: number;
  timestamp: string;
  speaker: "Dr. Maya Chen" | "Alex Example";
  text: string;
}

export const patient = {
  name: "Alex Example",
  age: 42,
  pronouns: "they/them",
  encounter: "Fictional primary-care visit",
};

export const transcript: TranscriptLine[] = [
  { at: 0, timestamp: "00:03", speaker: "Dr. Maya Chen", text: "Thanks for agreeing to this simulated recording. What brought you in today?" },
  { at: 1, timestamp: "00:09", speaker: "Alex Example", text: "I've had a dry cough and a blocked nose for about five days. The cough is keeping me awake." },
  { at: 2, timestamp: "00:18", speaker: "Dr. Maya Chen", text: "Any shortness of breath, chest pain, fever, or coughing up blood?" },
  { at: 3, timestamp: "00:25", speaker: "Alex Example", text: "No chest pain, trouble breathing, or blood. I felt warm the first night but didn't take my temperature." },
  { at: 4, timestamp: "00:34", speaker: "Dr. Maya Chen", text: "How severe is the cough, and is it changing?" },
  { at: 5, timestamp: "00:39", speaker: "Alex Example", text: "About a six out of ten at night and three in the day. It is a little better than two days ago." },
  { at: 6, timestamp: "00:49", speaker: "Dr. Maya Chen", text: "Tell me about medical conditions, medicines, and allergies." },
  { at: 7, timestamp: "00:55", speaker: "Alex Example", text: "I have mild asthma, but rarely need my albuterol inhaler. I take cetirizine 10 milligrams during allergy season. Penicillin gave me hives as a child." },
  { at: 8, timestamp: "01:08", speaker: "Dr. Maya Chen", text: "Have you needed the inhaler with this illness? Any sick contacts, smoking, or relevant family history?" },
  { at: 9, timestamp: "01:17", speaker: "Alex Example", text: "I used it once two nights ago and it helped a little. I don't smoke. My partner had a cold last week. My father has asthma too." },
  { at: 10, timestamp: "01:29", speaker: "Dr. Maya Chen", text: "This sounds most consistent with a viral upper respiratory infection with cough; your asthma symptoms appear mild from what you've reported. We did not perform a physical exam in this simulation." },
  { at: 11, timestamp: "01:43", speaker: "Dr. Maya Chen", text: "Rest, fluids, and honey or an over-the-counter cough remedy if appropriate. Continue albuterol only as previously prescribed. Seek urgent care for trouble breathing, chest pain, blue lips, confusion, or rapid worsening. Follow up in one week if not improving, sooner if worse." },
  { at: 12, timestamp: "02:02", speaker: "Alex Example", text: "That makes sense. I'll follow those instructions." },
];

export const templateLabels: Record<TemplateId, string> = {
  soap: "SOAP Note",
  general: "General Consultation Note",
  problem: "Problem-Oriented Note",
};

const shared = {
  reason: "Dry cough and nasal congestion for 5 days.",
  history: "Patient reports a 5-day dry cough with nasal congestion. Cough severity is 6/10 at night and 3/10 during the day, disrupts sleep, and is slightly improved over the last 2 days. Felt warm on the first night but did not measure temperature. Denies shortness of breath, chest pain, hemoptysis, or current worsening. Partner had a cold last week.",
  medical: "Mild asthma; rarely uses rescue inhaler. Family history: father with asthma. Does not smoke.",
  meds: "Cetirizine 10 mg during allergy season; albuterol inhaler as previously prescribed (used once two nights ago with some relief).",
  allergies: "Penicillin — patient reports childhood hives.",
  assessment: "Clinician assessment: presentation is most consistent with a viral upper respiratory infection with cough. Patient-reported asthma symptoms appear mild during this encounter.",
  plan: "Supportive care with rest, fluids, and honey or an over-the-counter cough remedy if appropriate. Continue albuterol only as previously prescribed. Seek urgent care for trouble breathing, chest pain, blue lips, confusion, or rapid worsening.",
  followUp: "Follow up in 1 week if symptoms are not improving, or sooner if symptoms worsen.",
};

export const notes: Record<TemplateId, string> = {
  soap: `Draft for clinician review — simulated content

SUBJECTIVE
${shared.reason}

${shared.history}

Relevant history: ${shared.medical}
Medications: ${shared.meds}
Allergies: ${shared.allergies}

OBJECTIVE
No physical examination or measured vital signs occurred in this simulated encounter.

ASSESSMENT
${shared.assessment}

PLAN
${shared.plan}
${shared.followUp}`,
  general: `Draft for clinician review — simulated content

REASON FOR CONSULTATION
${shared.reason}

HISTORY OF PRESENTING CONCERN
${shared.history}

RELEVANT MEDICAL HISTORY
${shared.medical}

MEDICATIONS AND ALLERGIES
${shared.meds}
${shared.allergies}

ASSESSMENT
${shared.assessment} No physical examination or measured vital signs occurred.

PLAN
${shared.plan}

FOLLOW-UP
${shared.followUp}`,
  problem: `Draft for clinician review — simulated content

PROBLEM 1 — ACUTE COUGH / NASAL CONGESTION
Patient report: ${shared.history}
Clinician assessment: likely viral upper respiratory infection with cough.
Plan: Rest, fluids, and honey or an over-the-counter cough remedy if appropriate. ${shared.followUp}

PROBLEM 2 — MILD ASTHMA
Patient report: Rare rescue-inhaler use; one use two nights ago gave some relief. No shortness of breath reported. Father has asthma.
Plan: Continue albuterol only as previously prescribed. Seek urgent care for trouble breathing, chest pain, blue lips, confusion, or rapid worsening.

CONTEXT
Medications: ${shared.meds}
Allergies: ${shared.allergies}
Objective data: No physical examination or measured vital signs occurred in this simulation.`,
};

export const generationStages = ["Organizing encounter facts", "Applying selected template", "Preparing clinician review draft"];
