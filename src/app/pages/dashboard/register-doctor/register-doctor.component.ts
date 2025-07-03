import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DoctorService } from '../../../services/doctor.service';
import { Router } from '@angular/router';
import { Specialty } from '../../../interfaces/Specialty';
import { CustomValidators } from '../../validators/custom-validators';

@Component({
  selector: 'app-register-doctor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register-doctor.component.html',
  styles: [
    `
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .animate-fadeIn {
        animation: fadeIn 0.3s ease-out forwards;
      }
    `,
  ],
})
export class RegisterDoctorComponent implements OnInit {
  doctorForm: FormGroup;
  loading = false;
  loadingSpecialties = true;
  successMessage = '';
  errorMessage = '';
  validationErrors: any = {};
  specialties: Specialty[] = [];

  constructor(
    private fb: FormBuilder,
    private doctorService: DoctorService,
    private router: Router
  ) {
    // Inicialización del formulario con validaciones mejoradas
    this.doctorForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(255),
          Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/), // Solo letras y espacios
        ],
      ],
      lastname: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(255),
          Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/), // Solo letras y espacios
        ],
      ],
      specialty_id: ['', [Validators.required]],
      rut: [
        '',
        [
          Validators.required,
          Validators.minLength(9),
          Validators.maxLength(12),
          CustomValidators.validateRut,
        ],
        [CustomValidators.rutExists(this.doctorService)], // Validador asíncrono
      ],
      phone: [
        '',
        [Validators.required, CustomValidators.validPhone],
      ],
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.maxLength(255),
        ],
        [CustomValidators.emailExists(this.doctorService)], // Validador asíncrono
      ],
    });
  }

  ngOnInit(): void {
    // Cargar las especialidades al iniciar el componente
    this.loadSpecialties();

    // Añadir formato al RUT cuando el usuario está escribiendo
    this.doctorForm.get('rut')?.valueChanges.subscribe((value) => {
      if (value && typeof value === 'string') {
        // Solo formatear si el usuario está añadiendo caracteres (no borrando)
        const currentLength = value.replace(/[.-]/g, '').length;
        const previousLength = this.previousRutLength || 0;
        this.previousRutLength = currentLength;

        if (currentLength > previousLength) {
          this.formatRut(value);
        }
      }
    });
  }

  // Variable para rastrear la longitud anterior del RUT
  private previousRutLength = 0;

  // Formatear el RUT automáticamente (ejemplo: 12345678-9)
  private formatRut(value: string) {
    // Eliminar caracteres no numéricos ni K/k
    let cleaned = value.replace(/[^0-9kK]/g, '');

    if (cleaned.length > 1) {
      // Separar el dígito verificador
      const body = cleaned.slice(0, -1);
      const dv = cleaned.slice(-1);

      // Actualizar el control con el formato correcto
      const formattedRut = `${body}-${dv}`;
      this.doctorForm.get('rut')?.setValue(formattedRut, { emitEvent: false });
    }
  }

  loadSpecialties(): void {
    this.loadingSpecialties = true;
    this.doctorService.getSpecialties().subscribe({
      next: (response) => {
        this.specialties = response;
        this.loadingSpecialties = false;
      },
      error: (error) => {
        console.error('Error al cargar especialidades:', error);
        this.errorMessage = 'No se pudieron cargar las especialidades médicas.';
        this.loadingSpecialties = false;
      },
    });
  }

  onSubmit() {
    if (this.doctorForm.invalid) {
      this.markFormGroupTouched(this.doctorForm);
      return;
    }

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.validationErrors = {};

    // Preparar los datos del formulario
    let formData = { ...this.doctorForm.value };

    // Asegurar que phone tiene el formato correcto (con +)
    if (formData.phone && !formData.phone.startsWith('+')) {
      formData.phone = '+' + formData.phone;
    }

    // Limpiar el formato del RUT para enviarlo correctamente
    if (formData.rut) {
      formData.rut = formData.rut.replace(/\./g, '');
    }

    // Convertir specialty_id a número
    formData.specialty_id = parseInt(formData.specialty_id);

    this.doctorService.registerDoctor(formData).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = response.message || 'Médico registrado con éxito';
        this.doctorForm.reset();

        // Desaparecer el mensaje después de 3 segundos
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.loading = false;
        if (error.status === 422) {
          this.validationErrors = error.error.errors || {};
          this.errorMessage = error.error.message || 'Error de validación';

          // Mensajes específicos para errores comunes
          if (
            this.validationErrors['rut'] &&
            this.validationErrors['rut'].includes('ya ha sido registrado')
          ) {
            this.errorMessage = 'El RUT ya está registrado en el sistema.';
          } else if (
            this.validationErrors['email'] &&
            this.validationErrors['email'].includes('ya ha sido registrado')
          ) {
            this.errorMessage = 'El correo electrónico ya está registrado en el sistema.';
          }
        } else {
          this.errorMessage =
            error.message || 'Error al registrar el médico. Intente de nuevo más tarde.';
        }
      },
    });
  }

  // Marcar todos los campos como tocados para mostrar errores
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
    });
  }

  // Verificar si un campo tiene error
  hasError(controlName: string, errorName: string): boolean {
    const control = this.doctorForm.get(controlName);
    return control !== null && control.touched && control.hasError(errorName);
  }

  // Obtener mensaje de error según el tipo
  getErrorMessage(controlName: string): string {
    const control = this.doctorForm.get(controlName);
    if (!control || !control.errors) return '';

    const errors = control.errors;

    if (errors['required']) return 'Este campo es requerido';
    if (errors['minlength'])
      return `Debe tener al menos ${errors['minlength'].requiredLength} caracteres`;
    if (errors['maxlength'])
      return `No puede tener más de ${errors['maxlength'].requiredLength} caracteres`;
    if (errors['email']) return 'Debe ser un correo electrónico válido';
    if (errors['pattern']) return 'Formato inválido';
    if (errors['invalidRut'])
      return 'El RUT no es válido (dígito verificador incorrecto)';
    if (errors['invalidFormat'])
      return 'Formato de RUT inválido. Debe ser XXXXXXXX-X';
    if (errors['rutExists']) return 'Este RUT ya está registrado en el sistema';
    if (errors['emailExists']) return 'Este correo electrónico ya está registrado';
    if (errors['invalidPhone'])
      return 'Formato de teléfono inválido. Debe ser +569XXXXXXXX o 569XXXXXXXX';

    return 'Campo inválido';
  }
}
