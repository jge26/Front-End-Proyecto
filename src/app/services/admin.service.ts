import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { appSettings } from '../settings/appsettings';
import { UserListResponse, UserListItem } from '../interfaces/UserList';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private http = inject(HttpClient);
  private baseUrl: string = appSettings.apiUrl;

  private getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  // Obtener lista de usuarios
  getUsers(): Observable<UserListResponse> {
    const headers = this.getHeaders();
    return this.http
      .get<UserListResponse>(`${this.baseUrl}/admin/users`, { headers })
      .pipe(catchError(this.handleError));
  }

  // Actualizar un usuario
  updateUser(userId: number, userData: Partial<UserListItem>): Observable<any> {
    const headers = this.getHeaders();
    // Corregir la URL para que coincida con el endpoint del backend
    return this.http
      .put<any>(`${this.baseUrl}/users/${userId}`, userData, { headers })
      .pipe(catchError(this.handleError));
  }

  // Habilitar/deshabilitar un usuario
  toggleUserStatus(userId: number, enabled: boolean): Observable<any> {
    const headers = this.getHeaders();
    // Cambiar la URL para que coincida con el endpoint del backend
    return this.http
      .put<any>(
        `${this.baseUrl}/admin/users/${userId}/toggle`,
        { enabled },
        { headers }
      )
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    let errorMessage = 'Ha ocurrido un error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del servidor
      console.error('Error del servidor:', error);
      if (error.status === 422 && error.error?.errors) {
        // Errores de validación
        const validationErrors = Object.values(error.error.errors).flat().join(', ');
        errorMessage = validationErrors || error.error?.message || `Error ${error.status}`;
      } else {
        errorMessage = error.error?.message || `Código de error: ${error.status}, mensaje: ${error.message}`;
      }
    }

    console.error('Error completo:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
