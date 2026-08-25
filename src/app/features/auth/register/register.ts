import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    role: ['Instructor', Validators.required]
  });

  isLoading = false;
  serverErrors: string[] = [];
  successMessage = '';

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
      this.successMessage = 'Registration successful. You can now log in.';
      // Optionally redirect to login after a delay
      setTimeout(() => this.router.navigate(['/login']), 2000);
    } catch (err: any) {
      if (err.status === 400 && err.error?.errors) {
        // Backend returns { errors: [ "Password must be at least 12 characters", ... ] }
        this.serverErrors = err.error.errors;
      } else {
        this.serverErrors = ['Registration failed. Please try again.'];
      }
    } finally {
      this.isLoading = false;
    }
  }
}