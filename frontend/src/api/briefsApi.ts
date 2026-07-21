import type {
  ApiErrorResponse,
  ApiResponse,
  BriefCreateResponse,
  BriefSubmissionInput,
  StoredSubmission,
} from "../types/brief";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000";

export class NetworkError extends Error {
  constructor(message = "Network error. Please check your connection.") {
    super(message);
    this.name = "NetworkError";
  }
}

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  let body: ApiResponse<T>;
  try {
    body = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new NetworkError();
  }
  return body;
}

export async function submitBrief(
  input: BriefSubmissionInput,
): Promise<ApiResponse<BriefCreateResponse>> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/api/briefs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch {
    throw new NetworkError();
  }
  return handleResponse<BriefCreateResponse>(response);
}

export async function fetchRecentBriefs(): Promise<
  ApiResponse<StoredSubmission[]>
> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/api/briefs`);
  } catch {
    throw new NetworkError();
  }
  return handleResponse<StoredSubmission[]>(response);
}

export async function deleteBrief(
  id: number,
): Promise<ApiResponse<{ id: number; deleted: true }>> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/api/briefs/${id}`, {
      method: "DELETE",
    });
  } catch {
    throw new NetworkError();
  }
  return handleResponse<{ id: number; deleted: true }>(response);
}

export async function deleteAllBriefs(): Promise<
  ApiResponse<{ deletedCount: number }>
> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/api/briefs`, {
      method: "DELETE",
    });
  } catch {
    throw new NetworkError();
  }
  return handleResponse<{ deletedCount: number }>(response);
}

export function isApiError<T>(res: ApiResponse<T>): res is ApiErrorResponse {
  return !res.success;
}
