import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async () => {

  const auth = inject(AuthService);
  const router = inject(Router);

  // Wait until refresh-token initialization finishes
  await auth.waitForInitialization();

  if (
    auth.authState() === 'authenticated' &&
    auth.currentUser()
  ) {
    return true;
  }

  return router.createUrlTree(['/login']);
};