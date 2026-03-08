import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

export const adminGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  if (authService.isAdmin()) {
    return true;
  }

  snackBar.open('Access denied. Admin privileges required.', 'OK', { duration: 3000 });
  router.navigate(['/login']);
  return false;
};

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  if (authService.isLoggedIn()) {
    return true;
  }

  snackBar.open('Please login to continue.', 'OK', { duration: 3000 });
  router.navigate(['/login']);
  return false;
};
