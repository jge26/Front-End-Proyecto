import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { appSettings } from '../settings/appsettings';
import { UserRegister } from '../interfaces/UserRegister';
import { Observable } from 'rxjs';
import { ResponseAcceso } from '../interfaces/RespondeAcceso';
import { MedicRegister } from '../interfaces/MedicRegister';
import { Login } from '../interfaces/Login';

@Injectable({
  providedIn: 'root'
})
export class AccesoService {
  enviarCorreo(email: any) {
    throw new Error('Method not implemented.');
  }
  private http = inject(HttpClient);
  private baseUrl: string = appSettings.apiUrl;

  constructor() { }

  private getHeaders() {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }

  // <-- Metodo para registrar usuarios -->
  registrarUsuario(objeto: UserRegister): Observable<ResponseAcceso> {
    const headers = this.getHeaders();
    return this.http.post<ResponseAcceso>(`${this.baseUrl}/register`, objeto, { headers });
  }

  // <-- Metodo para registrar medicos -->
  registrarMedico(objeto: MedicRegister): Observable<ResponseAcceso> {
    const headers = this.getHeaders();
    return this.http.post<ResponseAcceso>(`${this.baseUrl}/register/medico`, objeto, { headers });
  }

  // <-- Metodo para logear usuarios -->
  login(objeto: Login): Observable<ResponseAcceso> {
    const headers = this.getHeaders();
    return this.http.post<ResponseAcceso>(`${this.baseUrl}/login`, objeto, { headers });
  }

// <-- Metodo para solicitar recuperación de contraseña -->
  recoverPassword(email: string): Observable<ResponseAcceso> {
    const headers = this.getHeaders();
    return this.http.post<ResponseAcceso>(`${this.baseUrl}/forgot-password`, { email }, { headers });
  }

// <-- Metodo para restablecer la contraseña -->
  resetPassword(token: string, password: string): Observable<ResponseAcceso> {
    const headers = this.getHeaders();
    return this.http.post<ResponseAcceso>(`${this.baseUrl}/reset-password`, { token, password }, { headers });
  }
}
