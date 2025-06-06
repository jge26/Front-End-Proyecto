import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { appSettings } from '../settings/appsettings';

export interface User {
  id: number;
  name: string;
  lastname: string;
  rut: string;
  phone: string;
  email: string;
  is_active: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = `${appSettings.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  // <-- Obtener todos los usuarios desde el backend -->
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  // <-- Actualizar los datos (nombre, teléfono, correo) de un usuario -->
  updateUser(user: Partial<User>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${user.id}`, user);
  }

  // <-- Activar o desactivar la cuenta de un usuario -->
  toggleStatus(id: number, is_active: boolean): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/status`, { is_active });
  }
}
