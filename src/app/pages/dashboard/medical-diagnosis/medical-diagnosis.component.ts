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

  constructor(private fb: FormBuilder, private diagnosisService: DiagnosisService, private route: ActivatedRoute) {
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
  }

  submitForm() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const data = this.form.value;

    // Validaciones extra si hay licencia médica
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

    this.diagnosisService.createDiagnosis(data).subscribe({
      next: () => alert('Diagnóstico registrado con éxito.'),
      error: () => alert('Ocurrió un error al registrar el diagnóstico.')
    });
  }
}
