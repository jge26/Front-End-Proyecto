import { Component, inject } from '@angular/core';
import { AccesoService } from '../../services/acceso.service';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserRegister } from '../../interfaces/UserRegister';

@Component({
  selector: 'app-user-register',
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule],
  templateUrl: './user-register.component.html',
  styleUrl: './user-register.component.css'
})
export class UserRegisterComponent {

  // <-- Inyecta servicios: acceso, router y form builder -->
  private accesoService = inject(AccesoService);
  private router = inject(Router);
  public formBuild = inject(FormBuilder);

  // <-- Define formulario de registro de usuario con validaciones básicas -->
  public formRegister: FormGroup = this.formBuild.group({
    name: ['', [Validators.required]],
    lastname: ['', [Validators.required]],
    rut: ['', [Validators.required]],
    phone: ['', [Validators.required]],
    email: ['', [Validators.required]],
    password: ['', [Validators.required]],
    password_confirmation: ['', Validators.required]
  });

  // <-- Envía los datos al backend si el formulario es válido y las contraseñas coinciden -->
  registrarse() {

    if (this.formRegister.invalid) return;

    if (this.formRegister.value.password !== this.formRegister.value.password_confirmation) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    const usuario: UserRegister = {
      name: this.formRegister.value.name,
      lastname: this.formRegister.value.lastname,
      rut: this.formRegister.value.rut,
      phone: this.formRegister.value.phone,
      email: this.formRegister.value.email,
      password: this.formRegister.value.password,
      password_confirmation: this.formRegister.value.password_confirmation,
    };

    this.accesoService.registrarUsuario(usuario).subscribe({
      next: (data) => {
        if (data.status === 'success') {
          this.router.navigate(['login']);
        } else {
          alert('No se pudo registrar el usuario.');
        }
      },
      error: (error) => {
        console.error('Error en el registro: ', error);
        alert('Error al intentar registrar. Intente nuevamente más tarde.');
      }
    });
  }

  // <-- Redirige al usuario a la pantalla de login -->
  volver() {
    this.router.navigate(['login']);
  }
}
