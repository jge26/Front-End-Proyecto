import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { ResponseAcceso } from '../interfaces/ResponseAcceso';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { appSettings } from '../settings/appsettings';
import { catchError } from 'rxjs/operators';

export interface UserInfo {
  id: number;
  name: string;
  lastname: string;
  role_id: number;
  email: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<UserInfo | null>;
  public currentUser: Observable<UserInfo | null>;
  private baseUrl = `${appSettings.apiUrl}`;

  constructor(private http: HttpClient) {
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

  // Método para obtener la información del usuario autenticado
  getUserInfo(): Observable<UserInfo | null> {
    // Si ya tenemos la información del usuario en el BehaviorSubject, la devolvemos directamente
    if (this.currentUserValue) {
      return of(this.currentUserValue);
    }

    // Si no tenemos la información pero hay un token, intentamos obtener la información del usuario desde el servidor
    const token = localStorage.getItem('token');
    if (token) {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      });

      return this.http
        .get<any>(`${this.baseUrl}/user/profile`, { headers })
        .pipe(
          catchError((error) => {
            console.error('Error al obtener información del usuario', error);
            // Si hay un error, cerramos sesión para limpiar tokens inválidos
            this.logout();
            return of(null);
          })
        );
    }

    // Si no hay token, devolvemos null
    return of(null);
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
      throw new Error('Respuesta de autenticación inválida');
    }

    // Verificar si el usuario está habilitado
    if (response.data.user.enabled === 0) {
      console.error('AuthService: Usuario deshabilitado');
      throw new Error(
        'Su cuenta ha sido deshabilitada. Contacte al administrador.'
      );
    }

    const user: UserInfo = {
      id: response.data.user.id,
      name: response.data.user.name,
      lastname: response.data.user.lastname,
      role_id: response.data.user.role_id,
      email: response.data.user.email,
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

  // Método corregido para verificar si el usuario tiene acceso al dashboard
  hasDashboardAccess(): boolean {
    // Verificar si está logueado
    if (!this.isLoggedIn() || !this.currentUserValue) {
      console.log('No hay acceso al dashboard: Usuario no logueado');
      return false;
    }

    // Permitir acceso a Administradores (1), Médicos (2) y Pacientes (3)
    const roleId = this.currentUserValue.role_id;
    const hasAccess = [1, 2, 3].includes(roleId);

    console.log(
      `Verificando acceso al dashboard: Usuario con rol ${roleId}, tiene acceso: ${hasAccess}`
    );
    return hasAccess;
  }

  // También deberías corregir los otros métodos de verificación de rol
  isAdmin(): boolean {
    return !!this.currentUserValue && this.currentUserValue.role_id === 1;
  }

  isDoctor(): boolean {
    return !!this.currentUserValue && this.currentUserValue.role_id === 2;
  }

  isPatient(): boolean {
    return !!this.currentUserValue && this.currentUserValue.role_id === 3;
  }

  hasRole(roleId: number): boolean {
    return !!this.currentUserValue && this.currentUserValue.role_id === roleId;
  }

  // Cerrar sesión
  logout(): void {
    console.log('AuthService: Cerrando sesión del usuario');
    // Limpiar el localStorage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');

    // Limpiar el BehaviorSubject
    this.currentUserSubject.next(null);
    console.log('AuthService: Sesión cerrada correctamente');
  }
}
