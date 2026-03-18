import { config } from '../config';
import { authService } from '../auth/authService';

interface GraphQLError {
  message: string;
  locations?: { line: number; column: number }[];
  path?: (string | number)[];
  extensions?: { classification?: string };
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: GraphQLError[];
}

/**
 * Authenticated GraphQL client.
 *
 * Automatically injects the OAuth2 Bearer token from the auth service.
 * On 401 (expired token), it attempts a silent refresh and retries once.
 */
export async function graphqlRequest<T>(
  query: string,
  variables: Record<string, unknown> = {},
  retry = true,
): Promise<T> {
  const apiUrl = config.apiUrl;
  const token  = authService.getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });

  // If the server says our token is invalid, try a silent refresh then retry once
  if (response.status === 401 && retry) {
    const refreshed = await authService.refreshTokens();
    if (refreshed) return graphqlRequest<T>(query, variables, false);
    // Refresh failed – redirect to login
    authService.logout();
    throw new Error('Session expired. Redirecting to login…');
  }

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result: GraphQLResponse<T> = await response.json();

  if (result.errors && result.errors.length > 0) {
    const firstError = result.errors[0];
    // Propagate UNAUTHORIZED errors clearly
    if (firstError.extensions?.classification === 'UNAUTHORIZED') {
      throw new Error('Access denied. You do not have permission to view this data.');
    }
    throw new Error(firstError.message);
  }

  if (!result.data) {
    throw new Error('No data returned from API');
  }

  return result.data;
}

