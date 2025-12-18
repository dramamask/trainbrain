import { rtrim } from "../helpers";

// Get the base URL for the server
function getApiBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (baseUrl) {
    return rtrim(baseUrl, "/");
  }

  throw new Error("API base URL not defined");
}

// Common fetch function for API calls to the back-end server
export async function apiFetch<T>(endpoint: string): Promise<T> {
  const uri = `${getApiBaseUrl()}${endpoint}`;

  console.log('Calling ' + uri);

  const response = await fetch(uri);

  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}
