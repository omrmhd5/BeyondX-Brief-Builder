import { getDb } from "../db/sqlite.js";
import type { AiMode, BriefSummary } from "../types/brief.js";

export interface SubmissionRow {
  id: number;
  createdAt: string;
  companyName: string;
  sector: string;
  objective: string;
  audience: string;
  neededServices: string;
  budgetRange: string;
  deadline: string;
  summaryJson: string;
  aiModeUsed: AiMode;
  fallbackApplied: number;
}

export interface InsertSubmissionData {
  companyName: string;
  sector: string;
  objective: string;
  audience: string;
  neededServices: string[];
  budgetRange: string;
  deadline: string;
  summary: BriefSummary;
  aiModeUsed: AiMode;
  fallbackApplied: boolean;
}

export function insertSubmission(data: InsertSubmissionData): number {
  const db = getDb();
  const result = db
    .prepare(
      `INSERT INTO submissions (
        createdAt, companyName, sector, objective, audience,
        neededServices, budgetRange, deadline, summaryJson,
        aiModeUsed, fallbackApplied
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      new Date().toISOString(),
      data.companyName,
      data.sector,
      data.objective,
      data.audience,
      JSON.stringify(data.neededServices),
      data.budgetRange,
      data.deadline,
      JSON.stringify(data.summary),
      data.aiModeUsed,
      data.fallbackApplied ? 1 : 0,
    );

  return Number(result.lastInsertRowid);
}

export function getLastN(n = 5): SubmissionRow[] {
  const db = getDb();
  return db
    .prepare(`SELECT * FROM submissions ORDER BY id DESC LIMIT ?`)
    .all(n) as SubmissionRow[];
}

export function pruneOlderThanLastN(n = 5): void {
  const db = getDb();
  db.prepare(
    `DELETE FROM submissions
     WHERE id NOT IN (
       SELECT id FROM submissions ORDER BY id DESC LIMIT ?
     )`,
  ).run(n);
}
