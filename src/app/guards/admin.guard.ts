import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);

  // <-- Obtener el token -->
  const token = localStorage.getItem('token');
  const roleId = getRoleIdFromToken(token);

  // <-- Permitir solo si el rol es administrador -->
  if (token && roleId === 1) {
    return true;
  }

  // <-- Redirigir si no es admin -->
  router.navigate(['/home']);
  return false;
};

// <-- Función para decodificar el JWT y extraer el role_id -->
function getRoleIdFromToken(token: string | null): number {
  if (!token) return -1;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role_id;
  } catch {
    return -1;
  }
}
