import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DiagnosisService } from '../../../services/diagnosis.service';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-medical-diagnosis',
  templateUrl: './medical-diagnosis.component.html',
  styleUrls: ['./medical-diagnosis.component.css'],
  imports: [CommonModule, ReactiveFormsModule, RouterLink]
})
export class MedicalDiagnosisComponent {
  form: FormGroup;
  appointmentId!: number;

  constructor(
    private fb: FormBuilder,
    private diagnosisService: DiagnosisService,
    private route: ActivatedRoute
  ) {
    // Inicializa el formulario con validaciones
    this.form = this.fb.group({
      motivo: ['', Validators.required],
      diagnostico: ['', Validators.required],
      tratamiento: ['', Validators.required],
      medicamentos: ['', Validators.required],
      notas: [''],
      tieneLicencia: [false],
      diasLicencia: [null],
      inicioLicencia: [''],
      finLicencia: [''],
      motivoLicencia: ['']
    });

    // Obtiene el ID de la cita desde la URL
    this.appointmentId = Number(this.route.snapshot.paramMap.get('appointmentId'));
  }

  // Envía el formulario para registrar un diagnóstico médico.
  submitForm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const data = this.form.value;

    // Validaciones adicionales si se incluye licencia médica
    if (data.tieneLicencia) {
      if (!data.diasLicencia || data.diasLicencia <= 0) {
        alert('La cantidad de días de licencia debe ser mayor a 0.');
        return;
      }
      if (new Date(data.finLicencia) <= new Date(data.inicioLicencia)) {
        alert('La fecha de término debe ser posterior a la fecha de inicio.');
        return;
      }
      if (!data.motivoLicencia || data.motivoLicencia.trim() === '') {
        alert('Debe ingresar el motivo de la licencia médica.');
        return;
      }
    }

    // Payload para el diagnóstico
    const diagnosticoPayload = {
      appointment_id: this.appointmentId,
      motivo_consulta: data.motivo,
      diagnostico: data.diagnostico,
      tratamiento: data.tratamiento,
      notas: data.notas
    };

    // Registrar diagnóstico
    this.diagnosisService.createDiagnosis(diagnosticoPayload).subscribe({
      next: (res) => {
        const diagnosticoId = res.diagnostico.id;

        // Si incluye licencia médica
        if (data.tieneLicencia) {
          const licenciaPayload = {
            diagnostico_id: diagnosticoId,
            dias: data.diasLicencia,
            fecha_inicio: data.inicioLicencia,
            motivo: data.motivoLicencia
          };

          this.diagnosisService.createLicense(licenciaPayload).subscribe({
            next: () => alert('Diagnóstico y licencia registrados con éxito.'),
            error: () => alert('Diagnóstico registrado, pero falló la licencia.')
          });
        } else {
          alert('Diagnóstico registrado con éxito.');
        }
      },
      error: () => {
        alert('Ocurrió un error al registrar el diagnóstico.');
      }
    });
  }
}
