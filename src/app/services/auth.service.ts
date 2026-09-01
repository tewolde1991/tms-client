
import { Injectable, signal, inject } from '@angular/core';
import {
  HttpClient,
  HttpBackend
} from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

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

export type AuthState =
  | 'loading'
  | 'authenticated'
  | 'unauthenticated';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);

  // IMPORTANT:
  // This HttpClient bypasses Angular interceptors.
  // It prevents AuthService -> HttpClient -> interceptor -> AuthService
  // circular dependency during token refresh.
  private backendHttp = new HttpClient(inject(HttpBackend));

  private apiUrl = '/api/auth';

  readonly authState = signal<AuthState>('loading');
  readonly currentUser = signal<TmsUser | null>(null);

  private accessToken = signal<string | null>(null);

  private readonly REFRESH_TOKEN_KEY = 'tms_refresh_token';

  private initializationPromise: Promise<void> | null = null;

  constructor() {
    this.initialize();
  }

  getAccessToken(): string | null {
    return this.accessToken();
  }

  hasRole(role: string): boolean {
    const user = this.currentUser();
    return user?.role === role || user?.role === 'Admin';
  }

  waitForInitialization(): Promise<void> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    if (this.authState() !== 'loading') {
      return Promise.resolve();
    }

    return this.initialize();
  }

  private async initialize(): Promise<void> {

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = (async () => {

      this.authState.set('loading');

      const refreshToken =
        localStorage.getItem(this.REFRESH_TOKEN_KEY);

      if (!refreshToken) {
        this.setUnauthenticated();
        return;
      }

      try {

        // IMPORTANT:
        // Use backendHttp, NOT this.http
        const response = await firstValueFrom(
          this.backendHttp.post<AuthResponse>(
            `${this.apiUrl}/refresh`,
            { refreshToken }
          )
        );

        this.storeTokens(response);

        console.log(
          '✅ Authentication restored via refresh token.'
        );

      } catch (error) {

        console.warn(
          '❌ Refresh failed, logging out.',
          error
        );

        this.clearAuthentication();
      }

    })();

    return this.initializationPromise;
  }

  async login(
    credentials: LoginRequest,
    router?: any
  ): Promise<void> {

    const response = await firstValueFrom(
      this.backendHttp.post<AuthResponse>(
        `${this.apiUrl}/login`,
        credentials
      )
    );

    this.storeTokens(response);

    const role = this.currentUser()?.role;

    if (router) {

      if (role === 'Student') {
        await router.navigate(['/student-dashboard']);
      } else {
        await router.navigate(['/dashboard']);
      }

    }
  }

  async register(
    request: RegisterRequest
  ): Promise<void> {

    await firstValueFrom(
      this.backendHttp.post<void>(
        `${this.apiUrl}/register`,
        request
      )
    );
  }

  /**
   * Refresh access token.
   * This request bypasses all interceptors.
   */
  async refreshToken(): Promise<string> {

    const refreshToken =
      localStorage.getItem(this.REFRESH_TOKEN_KEY);

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await firstValueFrom(
      this.backendHttp.post<AuthResponse>(
        `${this.apiUrl}/refresh`,
        { refreshToken }
      )
    );

    this.storeTokens(response);

    console.log('🔄 Access token refreshed.');

    return response.accessToken;
  }

  logout(): void {
    this.clearAuthentication();
  }

  private storeTokens(response: AuthResponse): void {

    this.accessToken.set(response.accessToken);

    localStorage.setItem(
      this.REFRESH_TOKEN_KEY,
      response.refreshToken
    );

    const payload = JSON.parse(
      atob(response.accessToken.split('.')[1])
    );

    const role =
      payload[
        'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
      ] ||
      payload['role'] ||
      payload['Roles']?.[0] ||
      payload['Role'] ||
      'Student';

    this.currentUser.set({
      email: payload.email || payload.sub,
      displayName:
        payload.name ||
        payload.email ||
        'User',
      role
    });

    this.authState.set('authenticated');
  }

  private clearAuthentication(): void {

    localStorage.removeItem(
      this.REFRESH_TOKEN_KEY
    );

    this.accessToken.set(null);
    this.currentUser.set(null);
    this.authState.set('unauthenticated');
  }

  private setUnauthenticated(): void {
    this.accessToken.set(null);
    this.currentUser.set(null);
    this.authState.set('unauthenticated');
  }
}

