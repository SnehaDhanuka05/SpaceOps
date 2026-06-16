const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
  
  const headers = new Headers(options?.headers);
  if (!headers.has("Content-Type") && !(options?.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(
      `API error: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  return response.json() as Promise<T>;
}
