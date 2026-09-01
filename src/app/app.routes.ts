import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // ── Instructor / Admin dashboard ──
  {
    path: 'dashboard',
    canActivate: [authGuard, roleGuard('Instructor', 'Admin')],
    loadComponent: () =>
      import('./features/instructor-dashboard/instructor-dashboard')
        .then(m => m.InstructorDashboardComponent),
  },

  // ── Student dashboard ──
  {
    path: 'student-dashboard',
    canActivate: [authGuard, roleGuard('Student')],
    loadComponent: () =>
      import('./features/student-dashboard/student-dashboard')
        .then(m => m.StudentDashboardComponent),
  },

  // ── Student: enroll ──
  {
    path: 'enroll',
    canActivate: [authGuard, roleGuard('Student')],
    loadComponent: () =>
      import('./features/enrollment-form/enrollment-form')
        .then(m => m.EnrollmentFormComponent),
  },

  // ── Student: my enrollments ──
  {
    path: 'enrollments',
    canActivate: [authGuard, roleGuard('Student')],
    loadComponent: () =>
      import('./features/enrollment-list/enrollment-list')
        .then(m => m.EnrollmentListComponent),
  },

  // ── Course list (Admin only) ──
  {
    path: 'courses',
    canActivate: [authGuard, roleGuard('Admin', 'Instructor')],
    loadComponent: () =>
      import('./features/course-list/course-list')
        .then(m => m.CourseListComponent),
  },

  // ── Course detail ──
  {
    path: 'courses/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/course-detail/course-detail')
        .then(m => m.CourseDetail),
  },

  // ── Grade submission ──
  {
    path: 'grade-submission',
    canActivate: [authGuard, roleGuard('Instructor', 'Admin')],
    loadComponent: () =>
      import('./features/grade-submission/grade-submission.component')
        .then(m => m.GradeSubmissionComponent),
  },

  { path: 'unauthorized', loadComponent: () =>
      import('./features/unauthorized/unauthorized').then(m => m.Unauthorized) },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];