import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError, map, of } from 'rxjs';
import { appSettings } from '../settings/appsettings';
import { Specialty } from '../interfaces/Specialty';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private http = inject(HttpClient);
  private baseUrl: string = appSettings.apiUrl;

  private getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Método para obtener la lista de especialidades
  getSpecialties(): Observable<Specialty[]> {
    const headers = this.getHeaders();
    return this.http.get<{status: string, data: Specialty[]}>(`${this.baseUrl}/especialidades`, { headers })
      .pipe(
        catchError(this.handleError),
        map(response => response.data)
      );
  }

  // Método para registrar un nuevo médico
  registerDoctor(doctorData: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(`${this.baseUrl}/register2`, doctorData, { headers })
      .pipe(catchError(this.handleError));
  }

  // Método para verificar si un RUT ya existe
  checkRutExists(rut: string): Observable<boolean> {
    if (!rut || rut.length < 9) {
      return of(false);
    }

    const headers = this.getHeaders();
    const params = new HttpParams().set('rut', rut);

    return this.http.get<any>(`${this.baseUrl}/check-rut`, { headers, params })
      .pipe(
        map(response => response.exists),
        catchError(error => {
          console.error('Error al verificar RUT:', error);
          return of(false); // No bloqueamos la validación en caso de error
        })
      );
  }

  // Método para verificar si un email ya existe
  checkEmailExists(email: string): Observable<boolean> {
    if (!email || !email.includes('@')) {
      return of(false);
    }

    const headers = this.getHeaders();
    const params = new HttpParams().set('email', email);

    return this.http.get<any>(`${this.baseUrl}/check-email`, { headers, params })
      .pipe(
        map(response => response.exists),
        catchError(error => {
          console.error('Error al verificar email:', error);
          return of(false); // No bloqueamos la validación en caso de error
        })
      );
  }

  // Método para validar un RUT chileno
  validateChileanRut(rut: string): boolean {
    if (!rut || typeof rut !== 'string') {
      return false;
    }

    // Eliminar puntos y guiones
    const cleanRut = rut.replace(/[.-]/g, '');

    // Obtener dígito verificador
    const dv = cleanRut.slice(-1).toUpperCase();

    // Obtener cuerpo del RUT
    const rutBody = parseInt(cleanRut.slice(0, -1), 10);

    if (isNaN(rutBody)) {
      return false;
    }

    // Calcular dígito verificador esperado
    let sum = 0;
    let multiplier = 2;

    // Sumar los dígitos multiplicados por la secuencia 2, 3, 4, 5, 6, 7
    let rutBodyStr = rutBody.toString();
    for (let i = rutBodyStr.length - 1; i >= 0; i--) {
      sum += parseInt(rutBodyStr[i], 10) * multiplier;
      multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }

    // Calcular dígito verificador
    const expectedDV = 11 - (sum % 11);
    let calculatedDV;

    if (expectedDV === 11) calculatedDV = '0';
    else if (expectedDV === 10) calculatedDV = 'K';
    else calculatedDV = expectedDV.toString();

    // Comparar dígito calculado con el proporcionado
    return calculatedDV === dv;
  }

  private handleError(error: any) {
    let errorMessage = 'Ha ocurrido un error desconocido';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      console.error('Error del servidor:', error);

      // Manejar errores específicos
      if (error.status === 422) {
        if (error.error?.errors?.rut && error.error.errors.rut.includes('ya ha sido registrado')) {
          return throwError(() => new Error('El RUT ya está registrado en el sistema'));
        }
        if (error.error?.errors?.email && error.error.errors.email.includes('ya ha sido registrado')) {
          return throwError(() => new Error('El correo electrónico ya está registrado en el sistema'));
        }

        const validationErrors = Object.values(error.error.errors || {}).flat().join(', ');
        errorMessage = validationErrors || error.error?.message || `Error ${error.status}`;
      } else {
        errorMessage = error.error?.message || `Código de error: ${error.status}, mensaje: ${error.message}`;
      }
    }

    console.error('Error completo:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
