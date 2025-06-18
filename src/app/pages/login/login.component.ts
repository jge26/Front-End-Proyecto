import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AccesoService } from '../../services/acceso.service';
import { AuthService } from '../../services/auth.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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
        const userRole = response.data?.user?.role_id;
        console.log('Rol del usuario:', userRole);

        if (userRole === 1 || userRole === 2) { // Admin o Doctor
          console.log('Redirigiendo a dashboard...');
          this.router.navigate(['/dashboard']);
        } else {
          console.log('Redirigiendo a home...');
          this.router.navigate(['/']);
        }

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

  registrarse() {
    console.log('Navegando a registro...');
    this.router.navigate(['/register']);
  }

  volverAlInicio() {
    this.router.navigate(['/']);
  }
}
