import {
  AbstractControl,
  ValidationErrors,
  AsyncValidatorFn,
} from '@angular/forms';
import {
  Observable,
  map,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  first,
} from 'rxjs';
import { DoctorService } from '../../services/doctor.service';

export class CustomValidators {
  // Validador para RUT chileno
  static validateRut(control: AbstractControl): ValidationErrors | null {
    const rut = control.value;

    if (!rut) return null;

    // Verificar si el RUT tiene el formato correcto (números-dígito verificador)
    const rutRegex = /^[0-9]{7,8}-?[0-9kK]$/;
    if (!rutRegex.test(rut)) {
      return { invalidFormat: true };
    }

    // Limpiar el RUT de formato
    const cleanRut = rut.replace(/[.-]/g, '');
    const rutBody = cleanRut.slice(0, -1);
    const dv = cleanRut.slice(-1).toUpperCase();

    // Verificar que el cuerpo del RUT sea numérico
    if (!/^\d+$/.test(rutBody)) {
      return { invalidFormat: true };
    }

    // Algoritmo de validación de RUT chileno
    let sum = 0;
    let multiplier = 2;

    // Calcular suma ponderada
    for (let i = rutBody.length - 1; i >= 0; i--) {
      sum += parseInt(rutBody.charAt(i)) * multiplier;
      multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }

    // Calcular dígito verificador esperado
    let expectedDV;
    const mod = 11 - (sum % 11);

    if (mod === 11) expectedDV = '0';
    else if (mod === 10) expectedDV = 'K';
    else expectedDV = mod.toString();

    // Verificar si el dígito verificador es correcto
    if (dv !== expectedDV) {
      return { invalidRut: true };
    }

    return null;
  }

  // Validador asíncrono para verificar si un RUT ya existe
  static rutExists(doctorService: DoctorService): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      return control.valueChanges.pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((value) => doctorService.checkRutExists(value)),
        map((exists) => (exists ? { rutExists: true } : null)),
        first() // Completa el observable después de la primera emisión
      );
    };
  }

  // Validador asíncrono para verificar si un email ya existe
  static emailExists(doctorService: DoctorService): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      return control.valueChanges.pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((value) => doctorService.checkEmailExists(value)),
        map((exists) => (exists ? { emailExists: true } : null)),
        first() // Completa el observable después de la primera emisión
      );
    };
  }

  // Validador para formato de teléfono chileno
  static validPhone(control: AbstractControl): ValidationErrors | null {
    const phone = control.value;

    if (!phone) return null;

    // Formato esperado: +56912345678 o 56912345678
    const phoneRegex = /^(\+?56)?9\d{8}$/;

    if (!phoneRegex.test(phone)) {
      return { invalidPhone: true };
    }

    return null;
  }
}
