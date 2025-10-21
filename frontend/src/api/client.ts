import { API_BASE_URL, API_TIMEOUT } from '../lib/config';

export class APIError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, data: unknown, message: string) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

interface FetchOptions extends RequestInit {
  timeout?: number;
  token?: string;
}

/**
 * Make API requests using native Fetch API
 */
async function fetchAPI<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const { timeout = API_TIMEOUT, token, ...fetchOptions } = options;

  const url = `${API_BASE_URL}${endpoint}`;

  // Set default headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Merge with provided headers if any
  if (fetchOptions.headers) {
    if (typeof fetchOptions.headers === 'object' && !Array.isArray(fetchOptions.headers)) {
      Object.assign(headers, fetchOptions.headers);
    }
  }

  // Add auth token if provided
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle non-OK responses
    if (!response.ok) {
      let errorData: unknown;
      try {
        errorData = await response.json();
      } catch {
        errorData = { detail: response.statusText };
      }

      throw new APIError(
        response.status,
        errorData,
        `API Error: ${response.status}`,
      );
    }

    // Parse response
    const data = await response.json();
    return data as T;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof APIError) {
      throw error;
    }

    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new APIError(0, null, 'Network error. Please check your connection.');
    }

    throw error;
  }
}

/**
 * GET request
 */
export function apiGet<T>(endpoint: string, token?: string): Promise<T> {
  return fetchAPI<T>(endpoint, {
    method: 'GET',
    token,
  });
}

/**
 * POST request
 */
export function apiPost<T>(
  endpoint: string,
  data?: Record<string, unknown>,
  token?: string,
): Promise<T> {
  return fetchAPI<T>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
    token,
  });
}

/**
 * PUT request
 */
export function apiPut<T>(
  endpoint: string,
  data?: Record<string, unknown>,
  token?: string,
): Promise<T> {
  return fetchAPI<T>(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
    token,
  });
}

/**
 * PATCH request
 */
export function apiPatch<T>(
  endpoint: string,
  data?: Record<string, unknown>,
  token?: string,
): Promise<T> {
  return fetchAPI<T>(endpoint, {
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
    token,
  });
}

/**
 * DELETE request
 */
export function apiDelete<T = void>(endpoint: string, token?: string): Promise<T> {
  return fetchAPI<T>(endpoint, {
    method: 'DELETE',
    token,
  });
}

export default fetchAPI;
