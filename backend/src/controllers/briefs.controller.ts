import type { Request, Response } from "express";
import { generateBrief } from "../services/briefGeneration.service.js";
import {
  listRecentSubmissions,
  saveSubmission,
} from "../services/briefStorage.service.js";
import { validateBriefInput } from "../services/briefValidation.service.js";
import type { ApiErrorResponse } from "../types/brief.js";

export async function createBrief(req: Request, res: Response): Promise<void> {
  const validation = validateBriefInput(req.body);

  if (!validation.success) {
    const body: ApiErrorResponse = {
      success: false,
      error: {
        message: "Validation failed",
        fieldErrors: validation.fieldErrors,
      },
    };
    res.status(400).json(body);
    return;
  }

  const result = await generateBrief(validation.data);
  saveSubmission(validation.data, result);

  res.status(201).json({
    success: true,
    data: result,
  });
}

export function listBriefs(_req: Request, res: Response): void {
  const submissions = listRecentSubmissions();
  res.status(200).json({
    success: true,
    data: submissions,
  });
}
