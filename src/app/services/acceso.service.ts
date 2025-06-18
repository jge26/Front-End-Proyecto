import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { appSettings } from '../settings/appsettings';
import { ResponseAcceso } from '../interfaces/ResponseAcceso';
import { Login } from '../interfaces/Login';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AccesoService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private baseUrl: string = appSettings.apiUrl;

  private getHeaders() {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }

  login(objeto: Login): Observable<ResponseAcceso> {
    console.log('AccesoService: Intentando iniciar sesión con:', objeto.email);
    const headers = this.getHeaders();
    return this.http.post<ResponseAcceso>(`${this.baseUrl}/login`, objeto, { headers })
      .pipe(
        tap(response => {
          console.log('AccesoService: Respuesta de login recibida:', response);
          // Verificar la estructura de la respuesta
          console.log('AccesoService: Status:', response.status);
          console.log('AccesoService: Datos de usuario presentes:', !!response.data?.user);

          // Esta es la parte clave: procesar la respuesta y establecer el usuario
          if (response.status === 'success') {
            try {
              console.log('AccesoService: Login exitoso, guardando usuario');
              this.authService.setCurrentUser(response);
            } catch (error: any) {
              console.error('AccesoService: Error al guardar el usuario:', error);
              // Si hay un error (como usuario deshabilitado), lanzarlo
              throw new Error(error.message);
            }
          } else {
            console.error('AccesoService: Login fallido, status no es success');
          }
        }),
        catchError(error => {
          console.error('AccesoService: Error en la solicitud de login:', error);
          return this.handleLoginError(error);
        })
      );
  }

  registrarse(usuario: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(`${this.baseUrl}/register`, usuario, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleLoginError(error: HttpErrorResponse) {
    // Si el backend devuelve el mensaje específico de cuenta deshabilitada
    if (error.error?.message?.includes('deshabilitada') || error.status === 403) {
      // Usar el mensaje exacto que devuelve el servidor si está disponible
      const errorMsg = error.error?.message || 'Su cuenta ha sido deshabilitada. Contacte al administrador.';
      return throwError(() => new Error(errorMsg));
    }

    // Otros tipos de errores...
    let errorMessage = 'Ha ocurrido un error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del servidor
      if (error.status === 422 && error.error) {
        // Error de validación
        if (error.error.errors) {
          const errorMessages = Object.values(error.error.errors)
            .flat()
            .join(', ');
          errorMessage = errorMessages || error.error.message;
        } else if (error.error.message) {
          errorMessage = error.error.message;
        }
      } else if (error.error?.message) {
        // Usar el mensaje de error directamente del servidor
        errorMessage = error.error.message;
      } else {
        errorMessage = `Código de error: ${error.status}, mensaje: ${error.message}`;
      }
    }

    console.error('Error de login:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ha ocurrido un error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del servidor
      if (error.status === 422 && error.error) {
        // Error de validación
        if (error.error.errors) {
          const errorMessages = Object.values(error.error.errors)
            .flat()
            .join(', ');
          errorMessage = errorMessages || error.error.message;
        } else if (error.error.message) {
          errorMessage = error.error.message;
        }
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Código de error: ${error.status}, mensaje: ${error.message}`;
      }
    }

    console.error('Error en la solicitud:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
