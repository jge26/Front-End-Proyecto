import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { appSettings } from '../settings/appsettings';
import { Disponibilidad } from '../interfaces/disponibilidad.interface';

@Injectable({
  providedIn: 'root'
})
export class DisponibilidadService {
  private http = inject(HttpClient);
  private baseUrl = `${appSettings.apiUrl}`;

  private getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Obtener disponibilidad del médico
  obtenerDisponibilidad(): Observable<{ disponibilidad: Disponibilidad[] }> {
    const headers = this.getHeaders();
    return this.http.get<{ disponibilidad: Disponibilidad[] }>(`${this.baseUrl}/doctor/disponibilidad`, { headers })
      .pipe(catchError(this.handleError));
  }

  // Crear disponibilidad para el médico
  crearDisponibilidad(disponibilidad: Disponibilidad[]): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.baseUrl}/doctor/disponibilidad`, { disponibilidad }, { headers })
      .pipe(catchError(this.handleError));
  }

  // Actualizar disponibilidad del médico
  actualizarDisponibilidad(disponibilidad: Disponibilidad[]): Observable<any> {
    const headers = this.getHeaders();
    return this.http.put(`${this.baseUrl}/doctor/disponibilidad`, { disponibilidad }, { headers })
      .pipe(catchError(this.handleError));
  }

  // Desactivar bloques de disponibilidad - Estructura corregida exactamente igual al ejemplo
  desactivarBloques(bloques: any[]): Observable<any> {
    const headers = this.getHeaders();

    // Enviamos el objeto exacto requerido por la API
    const payload = { bloques };

    return this.http.post(`${this.baseUrl}/doctor/disponibilidad/desactivar`, payload, { headers })
      .pipe(catchError(this.handleError));
  }

  // Activar bloques de disponibilidad - Estructura corregida exactamente igual al ejemplo
  activarBloques(bloques: any[]): Observable<any> {
    const headers = this.getHeaders();

    // Enviamos el objeto exacto requerido por la API
    const payload = { bloques };

    return this.http.post(`${this.baseUrl}/doctor/disponibilidad/activar`, payload, { headers })
      .pipe(catchError(this.handleError));
  }

  // Eliminar bloques de disponibilidad permanentemente - Estructura corregida
  eliminarBloques(bloques: any[]): Observable<any> {
    const headers = this.getHeaders();

    // Para DELETE con cuerpo, debemos usar esta estructura
    const options = {
      headers,
      body: { bloques }
    };

    return this.http.delete(`${this.baseUrl}/doctor/disponibilidad/eliminar`, options)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('Error en la solicitud:', error);
    let errorMsg = 'Ha ocurrido un error en el servidor';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMsg = `Error: ${error.error.message}`;
    } else if (error.status) {
      // El servidor retornó un código de error
      errorMsg = error.error?.message || `Error ${error.status}: ${error.statusText}`;
    }

    return throwError(() => new Error(errorMsg));
  }
}
