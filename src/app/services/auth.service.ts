// auth.service.ts
import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface TmsUser {
  email: string;
  displayName: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export type AuthState = 'loading' | 'authenticated' | 'unauthenticated';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5298/api/auth'; // adjust to your proxy

  // Public state signals
  readonly authState = signal<AuthState>('loading');
  readonly currentUser = signal<TmsUser | null>(null);
  private accessToken = signal<string | null>(null);

  // Refresh token stored in localStorage (for lab purposes – HttpOnly cookie is better)
  private readonly REFRESH_TOKEN_KEY = 'tms_refresh_token';

  // Promise that resolves when initialization is complete
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    // Automatically initialize when the service is created (on app start)
    // this.initialize();
  }

  /** Get the current access token (used by interceptor) */
  getAccessToken(): string | null {
    return this.accessToken();
  }

  /** Check if the current user has a given role (Admin always wins) */
  hasRole(role: string): boolean {
    const user = this.currentUser();
    return user?.role === role || user?.role === 'Admin';
  }

  /** Wait for authentication initialization to finish */
  waitForInitialization(): Promise<void> {
    // If already initialized or currently loading, return the existing promise
    if (this.initializationPromise) {
      return this.initializationPromise;
    }
    // If already authenticated or unauthenticated, resolve immediately
    if (this.authState() !== 'loading') {
      return Promise.resolve();
    }
    // Otherwise, create a new promise (should not happen because constructor calls initialize)
    return this.initialize();
  }

  /** Initialize authentication by attempting to refresh the token */
  private async initialize(): Promise<void> {
    // Prevent multiple concurrent initializations
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = (async () => {
      this.authState.set('loading');
      const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);

      if (!refreshToken) {
        this.authState.set('unauthenticated');
        this.currentUser.set(null);
        this.accessToken.set(null);
        return;
      }

      try {
        // Call the refresh endpoint
        const response = await firstValueFrom(
          this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, { refreshToken }),
        );

        // Store new tokens
        this.accessToken.set(response.accessToken);
        localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);

        // Decode JWT to get user info
        const payload = JSON.parse(atob(response.accessToken.split('.')[1]));
        const role =
          payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
          payload['role'] ||
          payload['Roles']?.[0] ||
          payload['Role'] ||
          'Student';

        this.currentUser.set({
          email: payload.email || payload.sub,
          displayName: payload.name || payload.email || 'User',
          role: role,
        });

        this.authState.set('authenticated');
        console.log('✅ Authentication restored via refresh token.');
      } catch (error) {
        // Refresh failed – clear everything and go to unauthenticated
        console.warn('❌ Refresh failed, logging out.', error);
        localStorage.removeItem(this.REFRESH_TOKEN_KEY);
        this.accessToken.set(null);
        this.currentUser.set(null);
        this.authState.set('unauthenticated');
      }
    })();

    return this.initializationPromise;
  }
  async register(request: RegisterRequest): Promise<void> {
    await firstValueFrom(this.http.post(`${this.apiUrl}/register`, request));
  }
  /** Login – store tokens and user */
  async login(credentials: LoginRequest): Promise<void> {
    const response = await firstValueFrom(
      this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials),
    );

    this.accessToken.set(response.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);

    const payload = JSON.parse(atob(response.accessToken.split('.')[1]));
    const role =
      payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
      payload['role'] ||
      payload['Roles']?.[0] ||
      payload['Role'] ||
      'Student';

    this.currentUser.set({
      email: payload.email || payload.sub,
      displayName: payload.name || payload.email || 'User',
      role: role,
    });

    this.authState.set('authenticated');
    console.log('✅ Login successful.');
  }

  /** Logout – clear all tokens and state */
  logout(): void {
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    this.accessToken.set(null);
    this.currentUser.set(null);
    this.authState.set('unauthenticated');
    // Optionally call backend logout endpoint
  }

  /** Refresh the access token explicitly (used by interceptor) */
  async refreshToken(): Promise<string> {
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await firstValueFrom(
      this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, { refreshToken }),
    );

    this.accessToken.set(response.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);

    // Optionally update currentUser if claims changed (unlikely)
    return response.accessToken;
  }
}
