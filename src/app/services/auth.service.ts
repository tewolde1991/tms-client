import { inject, Injectable, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";

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

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private accessToken = signal<string | null>(null);
  private apiUrl = 'http://localhost:5298/api/auth'; // adjust to your proxy if needed

  currentUser = signal<TmsUser | null>(null);

  getAccessToken(): string | null {
    return this.accessToken();
  }

  hasRole(role: string): boolean {
    const user = this.currentUser();
    // Admin has all permissions, or check exact role match
    return user?.role === role || user?.role === 'Admin';
  }

  async login(credentials: LoginRequest): Promise<void> {
    const response = await firstValueFrom(
      this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
    );

    // Store the access token
    this.accessToken.set(response.accessToken);

    // Decode JWT payload
    const payload = JSON.parse(atob(response.accessToken.split('.')[1]));
    console.log('🔑 Decoded JWT payload:', payload); // <-- DEBUG: check console

    // --- Extract role from payload (handles multiple formats) ---
    let role = 
      payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || // standard .NET claim
      payload['role'] ||                     // simple "role" key
      payload['Roles']?.[0] ||               // if it's an array, take first
      payload['Role'] ||                     // capitalised variant
      'Student';                             // fallback

    // If it's still an array (edge case), convert to string
    if (Array.isArray(role)) {
      role = role[0] || 'Student';
    }

    // Set current user with extracted claims
    this.currentUser.set({
      email: payload.email || payload.sub,
      displayName: payload.name || payload.email || 'User',
      role: role
    });

    console.log('✅ AuthService: currentUser set to', this.currentUser());
  }

  async register(request: RegisterRequest): Promise<void> {
    await firstValueFrom(this.http.post(`${this.apiUrl}/register`, request));
  }

  logout(): void {
    this.accessToken.set(null);
    this.currentUser.set(null);
  }
}