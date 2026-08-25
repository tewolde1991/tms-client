import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  imports: [RouterLink],
   template: `
    <h2>Access Denied</h2>
    <p>You do not have permission to view this page.</p>
    <a routerLink="/dashboard">Go to Dashboard</a>
  `,
  styles: [`
    :host { display: block; text-align: center; padding: 2rem; }
  `]
})
export class Unauthorized {}
