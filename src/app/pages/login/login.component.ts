import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AccesoService } from '../../services/acceso.service';
import { AuthService } from '../../services/auth.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { MatTooltipModule } from '@angular/material/tooltip';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatTooltipModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('0.3s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private accesoService = inject(AccesoService);
  private authService = inject(AuthService);
  private router = inject(Router);

  formLogin!: FormGroup;
  errorMessage: string = '';
  loading: boolean = false;
  submitted: boolean = false;
  loginSuccess: boolean = false; // Nueva propiedad para el éxito del login

  constructor() {
    this.formLogin = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    console.log('Inicializando componente Login');

    // Verificar si hay un mensaje de error guardado en sessionStorage
    const savedError = sessionStorage.getItem('authError');
    if (savedError) {
      this.errorMessage = `<div class="flex items-center">
        <svg class="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z" clip-rule="evenodd"></path>
        </svg>
        <span class="font-medium">${savedError}</span>
      </div>`;
      sessionStorage.removeItem('authError');
    }

    // Si el usuario ya está autenticado, redirigir según su rol
    if (this.authService.isLoggedIn()) {
      console.log('Usuario ya autenticado, redirigiendo...');

      if (this.authService.hasDashboardAccess()) {
        console.log('Usuario con acceso al dashboard, redirigiendo a /dashboard');
        this.router.navigate(['/dashboard']);
      } else {
        console.log('Usuario sin acceso al dashboard, redirigiendo a /');
        this.router.navigate(['/']);
      }
    } else {
      console.log('Usuario no autenticado, mostrando formulario de login');
    }
  }

  // Método para verificar si un campo no es válido
  campoNoValido(campo: string): boolean {
    return Boolean(this.formLogin.get(campo)?.invalid && (this.formLogin.get(campo)?.touched || this.submitted));
  }

  // Método para obtener mensajes de error
  getMensajeError(campo: string): string {
    if (!this.formLogin.get(campo)) return '';

    const errors = this.formLogin.get(campo)?.errors;
    if (!errors) return '';

    if (errors['required']) {
      return 'Este campo es obligatorio';
    } else if (errors['email']) {
      return 'Debe ser un email válido';
    }
    return '';
  }

  iniciarSesion() {
    console.log('Iniciando proceso de login');
    this.submitted = true;
    this.errorMessage = '';

    if (this.formLogin.invalid) {
      console.log('Formulario inválido, deteniendo login');

      // Agregar una clase para mostrar animación de error
      document.querySelectorAll('.input-error').forEach(el => {
        el.classList.add('error-shake');
        setTimeout(() => {
          el.classList.remove('error-shake');
        }, 820);
      });

      return;
    }

    this.loading = true;

    const loginData = {
      email: this.formLogin.value.email,
      password: this.formLogin.value.password
    };

    console.log('Enviando solicitud de login para:', loginData.email);

    this.accesoService.login(loginData).subscribe({
      next: (response) => {
        console.log('Respuesta de login exitosa:', response);

        // Redireccionar según el rol del usuario
        this.handleLoginSuccess(response);

        this.loading = false;
      },
      error: (error) => {
        console.error('Error en login:', error);

        // Destacar el mensaje si es sobre una cuenta deshabilitada
        if (error.message.includes('deshabilitada')) {
          this.errorMessage = `<div class="flex items-center">
            <svg class="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z" clip-rule="evenodd"></path>
            </svg>
            <span class="font-medium">${error.message}</span>
          </div>`;
        } else {
          this.errorMessage = `<div class="flex items-center">
            <svg class="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z" clip-rule="evenodd"></path>
            </svg>
            <span class="font-medium">${error.message}</span>
          </div>`;
        }
        this.loading = false;
      }
    });
  }

  // Nuevo método para manejar el éxito en el inicio de sesión
  handleLoginSuccess(response: any) {
    try {
      // Guardar datos de autenticación
      this.authService.setCurrentUser(response);

      // Obtener el rol del usuario y redirigir según corresponda
      const userRole = response.data.user.role_id;

      // Redirigir según el rol
      switch (userRole) {
        case 1: // Admin
          this.router.navigate(['/dashboard']);
          break;
        case 2: // Doctor
          this.router.navigate(['/dashboard']);
          break;
        case 3: // Paciente
          this.router.navigate(['/dashboard']); // Todos al dashboard, la UI cambiará según el rol
          break;
        default:
          this.router.navigate(['/']);
          break;
      }

      // Mensaje de éxito
      this.loginSuccess = true;
      this.errorMessage = '';
    } catch (error) {
      console.error('Error en inicio de sesión:', error);
      this.errorMessage = 'Hubo un problema al procesar el inicio de sesión.';
    }
  }

  registrarse() {
    console.log('Navegando a registro...');
    this.router.navigate(['/register']);
  }

  volverAlInicio() {
    this.router.navigate(['/']);
  }
}
