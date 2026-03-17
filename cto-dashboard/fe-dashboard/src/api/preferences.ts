import { type ThemeSettings } from '../types/customization';
import type { WidgetConfig } from '../types/dashboard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/graphql';

async function gql(query: string, variables: Record<string, unknown>): Promise<any> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) {
    console.error('[preferences] GraphQL errors:', json.errors);
    return null;
  }
  return json.data;
}

export interface UserPreferencesPayload {
  userId: string;
  layoutJson: string;  // JSON-serialised string[]
  themeJson: string;   // JSON-serialised ThemeSettings
}

export async function fetchUserPreferences(userId: string): Promise<UserPreferencesPayload | null> {
  const data = await gql(
    `query GetPrefs($userId: ID!) {
       userPreferences(userId: $userId) {
         userId
         layoutJson
         themeJson
       }
     }`,
    { userId }
  );
  return data?.userPreferences ?? null;
}

export async function persistUserPreferences(
  userId: string,
  widgetOrder: WidgetConfig[],
  theme: ThemeSettings
): Promise<boolean> {
  const layoutJson = JSON.stringify(widgetOrder.map((w) => w.id));
  const themeJson = JSON.stringify(theme);
  const data = await gql(
    `mutation SavePrefs($userId: ID!, $layoutJson: String!, $themeJson: String!) {
       saveUserPreferences(userId: $userId, layoutJson: $layoutJson, themeJson: $themeJson) {
         userId
       }
     }`,
    { userId, layoutJson, themeJson }
  );
  return !!data?.saveUserPreferences;
}
