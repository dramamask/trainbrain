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
    const body = await response.json();
    if (hasErrorMessage(body)) {
      throw new Error(body.messages.error);
    }

    console.error("Unexpected response body format", response);
    throw new Error(`Unknown error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

// Check if the body has an error message where we expect it to be (body.message.error)
function hasErrorMessage(
  body: unknown
): body is { messages: { error: string } } {
  return (
    typeof body === "object" &&
    body !== null &&
    "messages" in body &&
    typeof (body as any).messages === "object" &&
    (body as any).messages !== null &&
    "error" in (body as any).messages
  );
}
