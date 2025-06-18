import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { AuthService } from './services/auth.service';
import { appSettings } from './settings/appsettings';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  template: '<router-outlet></router-outlet>'
})
export class AppComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private http = inject(HttpClient);

  ngOnInit() {
    console.log('AppComponent: Inicializando aplicación');
    console.log('AppComponent: Token en localStorage:', !!localStorage.getItem('token'));
    console.log('AppComponent: Usuario en localStorage:', localStorage.getItem('currentUser'));
    console.log('AppComponent: URL API configurada:', appSettings.apiUrl);

    // Si hay un token guardado, verificar que el usuario sigue habilitado
    if (this.authService.isLoggedIn()) {
      console.log('AppComponent: Usuario está autenticado, verificando sesión...');
      // Verificar la sesión y el estado del usuario
      this.verifySession();
    } else {
      console.log('AppComponent: No hay usuario autenticado');
    }
  }

  private verifySession() {
    // Asumimos que tienes un endpoint para verificar la sesión
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('AppComponent: No se encontró token en localStorage');
      return;
    }

    console.log('AppComponent: Verificando sesión con el servidor...');
    const headers = { Authorization: `Bearer ${token}` };

    this.http.get<any>(`${appSettings.apiUrl}/verify-session`, { headers })
      .pipe(
        catchError(error => {
          console.error('AppComponent: Error verificando sesión:', error);
          console.log('AppComponent: Código de error:', error.status);
          console.log('AppComponent: Mensaje de error:', error.error?.message || error.message);

          // Si hay un error de autenticación o el usuario está deshabilitado
          if (error.status === 401 || error.status === 403) {
            console.log('AppComponent: Error de autenticación o autorización, cerrando sesión...');
            this.authService.logout();

            if (error.error?.message?.includes('deshabilitada')) {
              console.log('AppComponent: Usuario deshabilitado, guardando mensaje de error');
              sessionStorage.setItem('authError', 'Su cuenta ha sido deshabilitada. Contacte al administrador.');
            }

            console.log('AppComponent: Redirigiendo a login...');
            this.router.navigate(['/login']);
          }

          return of(null);
        })
      )
      .subscribe(response => {
        console.log('AppComponent: Respuesta de verificación de sesión:', response);

        // Si la respuesta es exitosa pero el usuario está deshabilitado
        if (response && response.data?.user?.enabled === 0) {
          console.log('AppComponent: Usuario deshabilitado en la respuesta, cerrando sesión...');
          this.authService.logout();
          sessionStorage.setItem('authError', 'Su cuenta ha sido deshabilitada. Contacte al administrador.');
          this.router.navigate(['/login']);
        } else if (response) {
          console.log('AppComponent: Sesión verificada correctamente');
        }
      });
  }
}
