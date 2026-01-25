import { rtrim } from "../helpers";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface JsonBodyWithMessage {
  error: string,
}

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

// Funtion to make a POST, PUT or DELETE call to an API enpoint
export async function apiCall<T>(method: HttpMethod, endpoint: string, data: object): Promise<T> {
  const uri = `${getApiBaseUrl()}${endpoint}`;

  const response = await fetch(uri, {
    method: method,
    headers: {'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify(data),
  });

  return handleResponse<T>(response);
}

// Handle the response form a fetch call
async function handleResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    return await response.json();
  }

  // Handle different error response types
  let jsonBody: JsonBodyWithMessage = {} as JsonBodyWithMessage;
  let textBody = "";
  let textBodyReceived = false;

  try {
    textBody = await response.text();
  } catch (error) {
    logError("Error while reading API respone body.", error, null, response);
    throw new Error(`Unexpected error. ${response.status} ${response.statusText}`);
  }

  try {
    jsonBody = JSON.parse(textBody);
  } catch (error) {
    textBodyReceived = true;
  }

  if (textBodyReceived) {
    logError(
      "Error response received. Response has no json body, text body instead.",
      null,
      textBody,
      response,
    );
    throw new Error(`Unexpected error. ${response.status} ${response.statusText}: ${textBody}`);
  }

  let errorMessage = "";

  try {
    errorMessage = jsonBody.error;
  } catch(error) {
    logError(
      "Error response received. Response body is json but has no error attribute.",
      error,
      jsonBody,
      response,
    );
    throw new Error(`Unexpected error. ${response.status} ${response.statusText}`);
  }

  throw new Error(errorMessage);
}

// Log an error with a lot of extra information attached to it
function logError(message: string, error: any, responseBody: any, response: Response) {
  console.error(message, {
    status: response.status,
    statusText: response.statusText,
    error: (error instanceof Error ? error.message : error),
    responebody: responseBody,
    response: response,
  });
}
