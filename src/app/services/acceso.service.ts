import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { appSettings } from '../settings/appsettings';
import { UserRegister } from '../interfaces/UserRegister';
import { Observable } from 'rxjs';
import { ResponseAcceso } from '../interfaces/RespondeAcceso';
import { MedicRegister } from '../interfaces/MedicRegister';

@Injectable({
  providedIn: 'root'
})
export class AccesoService {
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

    return this.http.post<ResponseAcceso>(
      `${this.baseUrl}/register`, objeto, {headers}
    );
  }

 // <-- Metodo para registrar medicos -->
  registrarMedico(objeto: MedicRegister): Observable<ResponseAcceso> {
    const headers = this.getHeaders();
    return this.http.post<ResponseAcceso>(
      `${this.baseUrl}/register/medico`, objeto, { headers }
    );
  }
}
