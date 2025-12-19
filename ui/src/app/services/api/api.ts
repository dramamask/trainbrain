import { rtrim } from "../helpers";

// Get the base URL for the server
function getApiBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (baseUrl) {
    return rtrim(baseUrl, "/");
  }

  throw new Error("API base URL not defined");
}

// Function to make a GET call to an API endpoint
export async function apiGet<T>(endpoint: string): Promise<T> {
  const uri = `${getApiBaseUrl()}${endpoint}`;

  const response = await fetch(uri);

  return handleResponse(response);
}

// Funtion to make a POST call to an API enpoint
export async function apiPost<T>(endpoint: string, data: object): Promise<T> {
  const uri = `${getApiBaseUrl()}${endpoint}`;

  const response = await fetch(uri, {
    method: 'POST',
    headers: {'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}

// Handle a fetch response
async function handleResponse(response: Response): Promise<T> {
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
