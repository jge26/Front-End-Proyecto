import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ResponseAcceso } from '../interfaces/ResponseAcceso';

interface UserInfo {
  id: number;
  name: string;
  lastname: string;
  role_id: number;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<UserInfo | null>;
  public currentUser: Observable<UserInfo | null>;

  constructor() {
    // Recuperar el usuario del localStorage al iniciar el servicio
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<UserInfo | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): UserInfo | null {
    return this.currentUserSubject.value;
  }

  // Verificar si un usuario está habilitado
  checkUserEnabled(response: ResponseAcceso): boolean {
    if (response && response.data && response.data.user) {
      return response.data.user.enabled === 1;
    }
    return false;
  }

  // Establecer el usuario actual después del login
  setCurrentUser(response: ResponseAcceso): void {
    console.log('AuthService: Guardando usuario autenticado', response);

    if (!response || !response.data || !response.data.user) {
      console.error('AuthService: Datos de usuario incompletos');
      throw new Error("Respuesta de autenticación inválida");
    }

    // Verificar si el usuario está habilitado
    if (response.data.user.enabled === 0) {
      console.error('AuthService: Usuario deshabilitado');
      throw new Error("Su cuenta ha sido deshabilitada. Contacte al administrador.");
    }

    const user: UserInfo = {
      id: response.data.user.id,
      name: response.data.user.name,
      lastname: response.data.user.lastname,
      role_id: response.data.user.role_id,
      email: response.data.user.email
    };

    // Guardar en localStorage y actualizar el BehaviorSubject
    console.log('AuthService: Guardando datos de usuario en localStorage');
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('token', response.data.token);

    // Actualizar el BehaviorSubject
    console.log('AuthService: Actualizando BehaviorSubject');
    this.currentUserSubject.next(user);
  }

  // Verificar si el usuario está autenticado
  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    const currentUser = localStorage.getItem('currentUser');
    console.log('AuthService: Verificando si hay sesión activa');
    console.log('AuthService: Token existe:', !!token);
    console.log('AuthService: Usuario existe:', !!currentUser);
    return !!token && !!currentUser;
  }

  // Verificar si el usuario tiene un rol específico
  hasRole(roleId: number): boolean {
    return this.currentUserValue?.role_id === roleId;
  }

  // Verificar si el usuario es administrador (role_id = 1)
  isAdmin(): boolean {
    return this.hasRole(1);
  }

  // Verificar si el usuario es doctor (role_id = 2)
  isDoctor(): boolean {
    return this.hasRole(2);
  }

  // Verificar si el usuario es paciente (role_id = 3)
  isPatient(): boolean {
    return this.hasRole(3);
  }

  // Verificar si el usuario tiene acceso al dashboard (admin o doctor)
  hasDashboardAccess(): boolean {
    const userRole = this.currentUserValue?.role_id;
    return userRole === 1 || userRole === 2; // 1=admin, 2=doctor
  }

  // Cerrar sesión
  logout(): void {
    console.log('AuthService: Cerrando sesión del usuario');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    console.log('AuthService: Sesión cerrada correctamente');
  }
}
