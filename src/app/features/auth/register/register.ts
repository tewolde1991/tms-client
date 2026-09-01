import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';

// Custom validator — passwords must match
function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return password === confirm ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  readonly currentYear = new Date().getFullYear();

  registerForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    role: ['Student']
  }, { validators: passwordMatchValidator });

  isLoading = false;
  serverErrors: string[] = [];
  successMessage = '';
  showPassword = false;
  showConfirm = false;

  // Password strength
  get passwordValue() {
    return this.registerForm.get('password')?.value ?? '';
  }

  get strength(): 'weak' | 'medium' | 'strong' {
    const p = this.passwordValue;
    const hasUpper = /[A-Z]/.test(p);
    const hasLower = /[a-z]/.test(p);
    const hasNum = /[0-9]/.test(p);
    const hasSpecial = /[^A-Za-z0-9]/.test(p);
    const long = p.length >= 12;
    const score = [hasUpper, hasLower, hasNum, hasSpecial, long].filter(Boolean).length;
    if (score <= 2) return 'weak';
    if (score <= 3) return 'medium';
    return 'strong';
  }

  get strengthLabel() {
    return { weak: 'Weak', medium: 'Medium', strong: 'Strong' }[this.strength];
  }

  get suggestions(): string[] {
    const p = this.passwordValue;
    const hints: string[] = [];
    if (p.length < 8)          hints.push('At least 8 characters');
    if (!/[A-Z]/.test(p))      hints.push('Add an uppercase letter (A–Z)');
    if (!/[a-z]/.test(p))      hints.push('Add a lowercase letter (a–z)');
    if (!/[0-9]/.test(p))      hints.push('Add a number (0–9)');
    if (!/[^A-Za-z0-9]/.test(p)) hints.push('Add a special character (@, #, !, …)');
    return hints;
  }

  async onSubmit() {
    if (this.registerForm.invalid) return;
    this.isLoading = true;
    this.serverErrors = [];
    this.successMessage = '';

    const { email, password, firstName, lastName, role } = this.registerForm.value;

    try {
      await this.authService.register({
        email: email!,
        password: password!,
        firstName: firstName!,
        lastName: lastName!,
        role: role!
      });
      this.successMessage = 'Registration successful. Redirecting to login…';
      setTimeout(() => this.router.navigate(['/login']), 2000);
    } catch (err: any) {
      if (err.status === 400 && err.error?.errors) {
        this.serverErrors = err.error.errors;
      } else {
        this.serverErrors = ['Registration failed. Please try again.'];
      }
    } finally {
      this.isLoading = false;
    }
  }
}