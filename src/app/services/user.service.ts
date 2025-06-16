import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { appSettings } from '../settings/appsettings';
import { UserManage, UserManageResponse } from '../models/user.model';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = `${appSettings.apiUrl}`;

constructor(private http: HttpClient) {}

  // <-- Cabeceras con token JWT -->
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // <-- Obtener todos los usuarios -->
  getAllUsers(): Observable<UserManageResponse> {
    const headers = this.getAuthHeaders();
    return this.http.get<UserManageResponse>(`${this.apiUrl}/admin/users`, { headers });
  }

  // <-- Activar o desactivar cuenta de un usuario -->
  toggleStatus(rut: string, is_active: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.put(`${this.apiUrl}/admin/users/${rut}/toggle`, { is_active }, { headers });
}

  // <-- Actualizar datos del usuario -->
  updateUser(data: Partial<UserManage>): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.put(`${this.apiUrl}/users/${data.id}`, data, { headers });
  }
}
