import { supabase } from "@/lib/supabase";

const API_URL = (import.meta.env["VITE_API_URL"] as string | undefined) || "http://localhost:5000";

export type HealthResponse = {
  status: string;
  message: string;
  timestamp: string;
};

export type RemoveBackgroundResult = {
  success: boolean;
  status: string;
  public_id: string;
  original_url: string;
  processed_url: string;
  remaining_credits?: number;
};

export type CreditsResponse = {
  success: boolean;
  credits: number;
  plan: string;
};

export type HistoryRecord = {
  id: string;
  original_url: string;
  processed_url: string;
  status: string;
  created_at: string;
};

export type HistoryResponse = {
  success: boolean;
  history: HistoryRecord[];
};

export class ApiError extends Error {
  public override name = "ApiError";
  public status?: number;

  constructor(message: string, status?: number) {
    super(message);
    if (status !== undefined) {
      this.status = status;
    }
  }
}

/**
 * Perform a health check request to the Express backend.
 */
export async function checkHealth(timeoutMs = 5000): Promise<HealthResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${API_URL}/api/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new ApiError(`Server responded with HTTP status ${response.status}`, response.status);
    }

    const data = (await response.json()) as HealthResponse;
    if (!data || typeof data.status !== "string") {
      throw new ApiError("Invalid response format received from backend");
    }

    return data;
  } catch (error: unknown) {
    clearTimeout(timeoutId);

    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("Health check request timed out");
    }

    if (error instanceof TypeError) {
      throw new ApiError("Network failure: Unable to reach backend server");
    }

    throw new ApiError("An unexpected error occurred while communicating with the backend");
  }
}

/**
 * Fetch authenticated user credits balance and plan from GET /api/credits
 */
export async function getCredits(): Promise<CreditsResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (!token) {
    throw new ApiError("Authentication required to fetch credit balance", 401);
  }

  const response = await fetch(`${API_URL}/api/credits`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new ApiError(data.error || "Failed to fetch credits", response.status);
  }

  return data as CreditsResponse;
}

/**
 * Fetch authenticated user processing history from GET /api/history
 */
export async function getHistory(): Promise<HistoryResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (!token) {
    throw new ApiError("Authentication required to fetch processing history", 401);
  }

  const response = await fetch(`${API_URL}/api/history`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new ApiError(data.error || "Failed to fetch processing history", response.status);
  }

  return data as HistoryResponse;
}

/**
 * Send an image file to the Express backend for AI background removal.
 * Attaches Supabase Bearer token for credit authorization.
 */
export async function removeBackground(file: File): Promise<RemoveBackgroundResult> {
  // Validate file type
  if (!file.type || !file.type.startsWith("image/")) {
    throw new ApiError("Invalid file type. Only image files (PNG, JPG, JPEG, WEBP) are allowed.");
  }

  // Validate file size (10 MB limit)
  const MAX_SIZE = 10 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    throw new ApiError("File size exceeds the 10MB limit. Please select a smaller image.");
  }

  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (!token) {
    throw new ApiError("Authentication required to perform background removal", 401);
  }

  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await fetch(`${API_URL}/api/remove-background`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      if (response.status === 403 || data.error?.includes("Insufficient credits")) {
        throw new ApiError("You're out of credits. Upgrade your plan to continue.", 403);
      }
      throw new ApiError(
        data.error || `Background removal failed (Status ${response.status})`,
        response.status,
      );
    }

    return data as RemoveBackgroundResult;
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof TypeError) {
      throw new ApiError("Unable to connect to backend server. Please check if server is running.");
    }

    throw new ApiError("An unexpected error occurred during background removal.");
  }
}
