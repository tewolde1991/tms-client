import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { authGuard } from './guards/auth.guard';
import { CourseListComponent } from './features/course-list/course-list';
import { roleGuard } from './guards/role.guard';
import { Unauthorized } from './features/unauthorized/unauthorized';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'dashboards',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/student-dashboard/student-dashboard').then(
        (m) => m.StudentDashboardComponent,
      ),
  },

  {
    path: 'courses/:id',
    loadComponent: () =>
      import('./features/course-detail/course-detail').then((m) => m.CourseDetail),
  },
  {
    path: 'enroll',
    loadComponent: () =>
      import('./features/enrollment-form/enrollment-form').then((m) => m.EnrollmentFormComponent),
  },
  {
    path: 'enrollments',
    loadComponent: () =>
      import('./features/enrollment-list/enrollment-list').then((m) => m.EnrollmentListComponent),
  },
  {
    path: 'courses',
    loadComponent: () =>
      import('./features/course-list/course-list').then((m) => m.CourseListComponent),
    canActivate: [roleGuard('Admin')]

  },
  {path: 'register',
    loadComponent: () => import('./features/student-form/student-form').then((m)=>m.StudentFormComponent),
  },
  {path: 'dashboard',
    loadComponent: () => import('./features/instructor-dashboard/instructor-dashboard').then((m)=>m.InstructorDashboardComponent),
  },
  {
path: 'grade-submission',
loadComponent: () =>
import('./features/grade-submission/grade-submission.component').then(m => m.GradeSubmissionComponent)
},
{
  path: 'unauthorized',   
  loadComponent: () =>
    import('./features/unauthorized/unauthorized').then(m => m.Unauthorized)
},
  {
    path:'', redirectTo: 'dashboard', pathMatch:'full'
  }
];
