import { Component, inject } from '@angular/core';
import { AccesoService } from '../../services/acceso.service';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Login } from '../../interfaces/Login';
import { ResponseAcceso } from '../../interfaces/RespondeAcceso';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule,RouterModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  // <-- Inyecta el servicio de acceso, el router y el constructor de formularios -->
  private AccesoService = inject(AccesoService);
  private router = inject(Router);
  public formBuild = inject(FormBuilder);

  // <-- Define el formulario reactivo con campos requeridos -->
  public formLogin: FormGroup = this.formBuild.group({
    email: ['', Validators.required],
    password: ['', Validators.required]
  });

  // <-- Mensaje de error personalizado si falla el login -->
  public loginError: string = '';

  // <-- Controla si debe activarse la animación de sacudida -->
  public triggerShake: boolean = false;

  // <-- Envía los datos al backend y redirige según el rol -->
  login() {
    if (this.formLogin.invalid) return;

    const objeto: Login = {
      email: this.formLogin.value.email,
      password: this.formLogin.value.password
    };

    console.log(objeto);

    this.AccesoService.login(objeto).subscribe({
      next: (data: ResponseAcceso) => {
        if (data.status === 'success') {
          const token = data.data.token;
          const roleId = data.data.user.role_id;

          localStorage.setItem('token', token);
          localStorage.setItem('role_id', roleId.toString());

          // <-- Redirige al usuario según su rol -->
          switch (roleId) {
            case 1:
              this.router.navigate(['/admin']);
              break;
            case 2:
              this.router.navigate(['/patient']);
              break;
            case 3:
              this.router.navigate(['/medic']);
              break;
              
            default:
              console.warn('Rol desconocido:', roleId);
              this.router.navigate(['/home']);
          }
        } else {
          this.loginError = 'Error al iniciar sesión. Verifique sus credenciales.';
        }
      },
      error: (error) => {
        console.error('Error al iniciar sesión', error);

        // <-- Ocultar mensaje y quitar clase shake temporalmente -->
        this.loginError = '';
        this.triggerShake = false;

        // <-- Esperar un momento antes de volver a mostrar y animar -->
        setTimeout(() => {
          this.triggerShake = true;

          // <-- Mostrar mensaje según tipo de error -->
          if (error.error?.status === 'disabled') {
            this.loginError = 'Su cuenta ha sido deshabilitada. Contacte al administrador.';
          } else {
            this.loginError = 'Error al iniciar sesión. Verifique sus credenciales.';
          }
        }, 10); // <-- Suficiente para reiniciar animación
      }
    });
  }

  // <-- Redirige al formulario de registro -->
  registrarse() {
    this.router.navigate(['register']);
  }

}
