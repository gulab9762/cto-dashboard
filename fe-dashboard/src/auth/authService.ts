/**
 * Simple username/password auth service.
 *
 * POST /auth/login  →  { token, username, orgId, roles }
 * Token is stored in localStorage and injected into every GraphQL request.
 */

import { config } from '../config';

export interface UserInfo {
  username: string;
  orgId: string;
  roles: string[];
  email?: string;
}

const STORAGE_TOKEN = 'cto_auth_token';
const STORAGE_USER  = 'cto_auth_user';

const AUTH_URL = config.authUrl;  // e.g. http://localhost:4000/auth/login

class AuthService {
  // ── Login ──────────────────────────────────────────────────────────────────
  async login(username: string, password: string): Promise<void> {
    const response = await fetch(AUTH_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error ?? 'Login failed. Please check your credentials.');
    }

    const data = await response.json();
    localStorage.setItem(STORAGE_TOKEN, data.token);
    localStorage.setItem(STORAGE_USER, JSON.stringify({
      username: data.username,
      orgId:    data.orgId,
      roles:    data.roles,
    } satisfies UserInfo));
  }

  // ── Token access ────────────────────────────────────────────────────────────
  getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_TOKEN);
  }

  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;
    try {
      // Decode payload — check expiry without a library
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  getUserInfo(): UserInfo | null {
    const raw = localStorage.getItem(STORAGE_USER);
    if (!raw) return null;
    try { return JSON.parse(raw) as UserInfo; }
    catch { return null; }
  }

  // ── Logout ─────────────────────────────────────────────────────────────────
  logout(): void {
    localStorage.removeItem(STORAGE_TOKEN);
    localStorage.removeItem(STORAGE_USER);
    window.location.href = '/';
  }

  // ── Stub for compatibility with graphql client ──────────────────────────────
  async refreshTokens(): Promise<boolean> {
    // Simple JWT auth has no refresh flow — user must log in again when token expires
    if (!this.isAuthenticated()) { this.logout(); return false; }
    return true;
  }
}

export const authService = new AuthService();
