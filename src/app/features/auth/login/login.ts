import { Component, inject } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  private fb = inject(NonNullableFormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
readonly currentYear = new Date().getFullYear();
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  isLoading = false;
  errorMessage = '';

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    try {
      await this.authService.login(this.loginForm.getRawValue());
      
      // Role-based redirect
      const user = this.authService.currentUser();
      if (user?.role === 'Student') {
        await this.router.navigate(['/student-dashboard']);
      } else {
        await this.router.navigate(['/dashboard']);
      }
    } catch (err: any) {
      if (err.status === 423) {
        this.errorMessage = 'Account locked due to multiple failed login attempts. Try again in 15 minutes.';
      } else if (err.status === 401) {
        this.errorMessage = 'Invalid email or password.';
      } else {
        this.errorMessage = 'An unexpected error occurred. Please try again.';
      }
    } finally {
      this.isLoading = false;
    }
  }
}