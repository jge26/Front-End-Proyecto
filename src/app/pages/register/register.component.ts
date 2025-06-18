import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AccesoService } from '../../services/acceso.service';
import { trigger, transition, style, animate } from '@angular/animations';

// Interfaz para la respuesta del registro
interface RegisterResponse {
  status: string;
  message: string;
  data?: any;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate(
          '0.3s ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),
  ],
})
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private accesoService = inject(AccesoService);

  formRegister!: FormGroup;
  submitted = false;
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.formRegister = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(3)]],
        lastname: ['', [Validators.required, Validators.minLength(3)]],
        rut: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(10),
          ],
        ],
        phone: [
          '',
          [Validators.required, Validators.pattern(/^\+56[0-9]{9}$/)],
        ],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        password_confirmation: ['', Validators.required],
      },
      {
        validators: this.mustMatch('password', 'password_confirmation'),
      }
    );

    console.log('RegisterComponent: Inicializado');
  }

  // Validador personalizado para verificar que las contraseñas coincidan
  mustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];

      if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
        return;
      }

      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
      } else {
        matchingControl.setErrors(null);
      }
    };
  }

  // Método para verificar si las contraseñas coinciden
  passwordMismatch(): boolean {
    if (!this.formRegister) return false;

    const password = this.formRegister.get('password')?.value;
    const confirmPassword = this.formRegister.get(
      'password_confirmation'
    )?.value;

    return (
      !!this.formRegister.get('password_confirmation')?.touched &&
      password !== confirmPassword
    );
  }

  // Método explícito para validar campos
  campoNoValido(campo: string): boolean {
    const control = this.formRegister.get(campo);
    return Boolean(control && control.invalid && control.touched);
  }

  // Optimizar el método para obtener mensajes de error
  getMensajeError(campo: string): string {
    if (!this.formRegister.get(campo)) return '';

    const errors = this.formRegister.get(campo)?.errors;
    if (!errors) return '';

    // Priorizar el error de contraseñas no coincidentes
    if (campo === 'password_confirmation' && this.passwordMismatch()) {
      return 'Las contraseñas no coinciden';
    }

    if (errors['required']) {
      return 'Este campo es obligatorio';
    } else if (errors['minlength']) {
      return `Debe tener al menos ${errors['minlength'].requiredLength} caracteres`;
    } else if (errors['maxlength']) {
      return `No debe exceder ${errors['maxlength'].requiredLength} caracteres`;
    } else if (errors['pattern']) {
      if (campo === 'phone') {
        return 'El formato debe ser +56XXXXXXXXX';
      }
      return 'Formato inválido';
    } else if (errors['email']) {
      return 'Debe ser un email válido';
    }

    return '';
  }
  // Método para enviar el formulario
  registrarse(): void {
    this.submitted = true;
    console.log('RegisterComponent: Intento de registro');

    if (this.formRegister.invalid) {
      console.log('RegisterComponent: Formulario inválido');
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.formRegister.controls).forEach((key) => {
        const control = this.formRegister.get(key);
        control?.markAsTouched();
      });

      // Agregar una clase para mostrar animación de error
      document.querySelectorAll('.border-red-500').forEach((el) => {
        el.classList.add('error-shake');
        setTimeout(() => {
          el.classList.remove('error-shake');
        }, 820);
      });

      // Desplazarse al primer campo con error
      const firstErrorField = document.querySelector('.border-red-500');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const usuario = {
      name: this.formRegister.value.name,
      lastname: this.formRegister.value.lastname,
      rut: this.formRegister.value.rut,
      phone: this.formRegister.value.phone,
      email: this.formRegister.value.email,
      password: this.formRegister.value.password,
      password_confirmation: this.formRegister.value.password_confirmation,
    };

    console.log('RegisterComponent: Enviando solicitud al servidor');

    this.accesoService.registrarse(usuario).subscribe({
      next: (data: RegisterResponse) => {
        console.log('RegisterComponent: Respuesta exitosa', data);

        if (data.status === 'success') {
          // Redirigir al login con un mensaje de éxito
          console.log(
            'RegisterComponent: Registro exitoso, redirigiendo a login'
          );
          this.router.navigate(['/login'], {
            queryParams: { registered: 'success' },
          });
        } else {
          this.errorMessage = data.message || 'Error al registrar el usuario';
          this.loading = false;
          console.error(
            'RegisterComponent: Error en registro',
            this.errorMessage
          );
        }
      },
      error: (error: any) => {
        console.error('RegisterComponent: Error en la solicitud', error);
        this.errorMessage = error.message || 'Error al registrar el usuario';
        this.loading = false;
      },
    });
  }

  // Método para volver a la página de login
  volver(): void {
    console.log('RegisterComponent: Volviendo a login');
    this.router.navigate(['/login']);
  }
}
