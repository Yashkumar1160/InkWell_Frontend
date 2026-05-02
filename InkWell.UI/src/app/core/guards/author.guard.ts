import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authorGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const role = authService.getUserRole();
  if (role === 'AUTHOR' || role === 'ADMIN') {
    return true;
  }

  router.navigate(['/']);
  return false;
};
