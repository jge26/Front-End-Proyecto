import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('AuthGuard: Verificando si el usuario tiene acceso');

  // Verificar si el usuario está autenticado
  if (authService.isLoggedIn()) {
    console.log('AuthGuard: Usuario autenticado, permitiendo acceso');
    return true;
  }

  console.log('AuthGuard: Usuario no autenticado, redirigiendo a login');
  // Si no está autenticado, redirigir al login
  return router.parseUrl('/login');
};

export const dashboardGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('DashboardGuard: Verificando acceso al dashboard');

  if (!authService.isLoggedIn()) {
    console.log('DashboardGuard: Usuario no autenticado, redirigiendo a login');
    return router.parseUrl('/login');
  }

  if (authService.hasDashboardAccess()) {
    console.log('DashboardGuard: Usuario con acceso al dashboard, permitiendo acceso');
    return true;
  }

  console.log('DashboardGuard: Usuario sin permisos para el dashboard, redirigiendo a unauthorized');
  return router.parseUrl('/unauthorized');
};
