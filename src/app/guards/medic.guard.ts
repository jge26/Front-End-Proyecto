import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const medicGuard: CanActivateFn = () => {
  const router = inject(Router);

  // <-- Obtener el token desde localStorage -->
  const token = localStorage.getItem('token');

  // <-- Obtener el role_id almacenado tras el login -->
  const roleId = Number(localStorage.getItem('role_id'));

  // <-- Permitir acceso solo si existe token y el rol es médico -->
  if (token && roleId === 3) {
    return true;
  }

  // <-- Redirigir al home si no es médico o no hay token -->
  router.navigate(['/home']);
  return false;
};
