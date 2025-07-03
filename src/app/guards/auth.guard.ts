import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  // Si no está logueado, redirigir a login
  router.navigate(['/login']);
  return false;
};

export const dashboardGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.hasDashboardAccess()) {
    return true;
  }

  // Si está logueado pero no tiene acceso al dashboard, redirigir a acceso denegado
  if (authService.isLoggedIn()) {
    router.navigate(['/access-denied']);
    return false;
  }

  // Si no está logueado, redirigir a login
  router.navigate(['/login']);
  return false;
};
