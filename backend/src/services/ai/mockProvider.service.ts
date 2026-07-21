import type { BriefSubmissionInput, BriefSummary } from "../../types/brief.js";
import type { AiProvider } from "./aiProvider.interface.js";

const SECTOR_QUESTIONS: Record<string, string[]> = {
  Technology: [
    "What existing tech stack or platforms does your team currently use?",
    "Are there integration requirements with third-party APIs or legacy systems?",
    "What are your scalability and uptime expectations for launch?",
  ],
  Healthcare: [
    "Are there HIPAA or regional compliance requirements we must account for?",
    "Who are the primary clinical or administrative stakeholders for sign-off?",
    "What patient or provider workflows must the solution support on day one?",
  ],
  Finance: [
    "What regulatory or audit requirements apply to this initiative?",
    "Which data sources and reporting cadences are required post-launch?",
    "What level of security review or penetration testing is expected?",
  ],
  Retail: [
    "Which sales channels (online, in-store, marketplace) should we prioritize?",
    "How do you currently measure conversion and customer lifetime value?",
    "What inventory or fulfillment systems need to integrate with the solution?",
  ],
  Education: [
    "Who are the primary learners or administrators using this solution?",
    "Are there accessibility (WCAG) or LMS integration requirements?",
    "What does success look like for student or faculty adoption?",
  ],
  Manufacturing: [
    "Which operational workflows or ERP systems must we integrate with?",
    "What are your lead times and production constraints around the deadline?",
    "How will frontline staff be trained on the new solution?",
  ],
  Other: [
    "What does success look like 90 days after launch?",
    "Who are the internal decision-makers and approvers for this project?",
    "What risks or blockers should we plan for upfront?",
  ],
};

const SERVICE_QUESTIONS: Record<string, string> = {
  "Web Design":
    "Do you have brand guidelines or an existing design system we should follow?",
  Branding: "How would you describe your brand personality in three words?",
  SEO: "What keywords or competitors should we benchmark against?",
  Content: "Who will own content creation and approval after launch?",
  Ads: "Which channels (search, social, display) have performed best for you historically?",
  "App Dev":
    "Do you need native mobile apps, or is a responsive web app sufficient?",
};

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function pickQuestions(input: BriefSubmissionInput): string[] {
  const sectorQs = SECTOR_QUESTIONS[input.sector] ?? SECTOR_QUESTIONS.Other;
  const serviceQs = input.neededServices.map(
    (s) => SERVICE_QUESTIONS[s] ?? `What outcomes do you expect from ${s}?`,
  );

  const combined = [
    `What is the single most important metric for ${input.companyName} to achieve with this project?`,
    ...sectorQs,
    ...serviceQs,
    `How does your ${input.budgetRange} budget align with the scope and timeline you have in mind?`,
    `Who on your team will be the day-to-day point of contact through the ${input.deadline} deadline?`,
  ];

  const unique = [...new Set(combined)];
  const seed = hashString(
    `${input.companyName}|${input.sector}|${input.objective}|${input.audience}|${input.neededServices.join(",")}`,
  );

  const selected: string[] = [];
  for (let i = 0; i < unique.length && selected.length < 5; i++) {
    const q = unique[(seed + i) % unique.length];
    if (!selected.includes(q)) {
      selected.push(q);
    }
  }

  const fallbackQuestions = [
    "What does success look like 90 days after launch?",
    "Who are the internal decision-makers for this project?",
    "What risks or blockers should we plan for upfront?",
    "What is the biggest constraint we should design around?",
  ];

  for (const q of fallbackQuestions) {
    if (selected.length >= 4) break;
    if (!selected.includes(q)) selected.push(q);
  }

  return selected.slice(0, Math.min(5, Math.max(4, selected.length)));
}

export class MockProvider implements AiProvider {
  async generateBrief(input: BriefSubmissionInput): Promise<BriefSummary> {
    const services = input.neededServices.join(", ");
    const headline = `Strategic Brief for ${input.companyName}: ${input.objective.slice(0, 60)}${input.objective.length > 60 ? "…" : ""}`;

    const keyPoints = [
      `Sector focus: ${input.sector} — tailored discovery for industry-specific needs.`,
      `Target audience: ${input.audience}.`,
      `Services requested: ${services}.`,
      `Budget bracket: ${input.budgetRange}; target deadline: ${input.deadline}.`,
      `Primary objective: ${input.objective}`,
    ];

    const recommendedApproach = `We recommend a phased approach for ${input.companyName}: begin with discovery workshops aligned to your ${input.sector} context, deliver a scoped proposal within your ${input.budgetRange} range, and stage delivery milestones leading to ${input.deadline}. Prioritize ${input.neededServices[0]} as the anchor capability, with ${services} integrated into a cohesive go-to-market plan for ${input.audience}.`;

    const discoveryQuestions = pickQuestions(input);

    return {
      headline,
      keyPoints,
      recommendedApproach,
      discoveryQuestions,
    };
  }
}

export const mockProvider = new MockProvider();
